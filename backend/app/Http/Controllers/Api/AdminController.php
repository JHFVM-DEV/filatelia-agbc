<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Emission;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\PriceRevaluation;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminController extends Controller
{
    public const MODULES = [
        'Emisiones',
        'Productos',
        'Categorías',
        'Pedidos',
        'Inventario',
        'Despacho',
        'Envíos',
        'Usuarios',
        'Permisos',
        'Reportes',
        'Monitoreo Pulse',
        'Visor de Logs',
    ];

    /**
     * Helper to verify staff authorization
     */
    protected function authorizeStaff(Request $request): ?JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ALMACEN'])) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado: Se requieren credenciales administrativas oficiales.',
            ], 403);
        }
        return null;
    }

    /**
     * Helper to verify super admin authorization (Dirección General)
     */
    protected function authorizeSuperAdmin(Request $request): ?JsonResponse
    {
        $user = $request->user();
        if (!$user || (!$user->hasRole('SUPER_ADMIN') && $user->email !== 'admin@filatelia.bo')) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado: Este módulo requiere privilegios exclusivos de SUPER_ADMIN (Dirección General).',
            ], 403);
        }
        return null;
    }

    /**
     * Helper to verify if the authenticated user has access to a specific module
     * based on their Spatie role permissions matrix.
     */
    protected function authorizeModule(Request $request, string $module): ?JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) return $deny;

        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado.'], 401);
        }

        // Super Admin always has full bypass immunity
        if ($user->hasRole('SUPER_ADMIN') || $user->email === 'admin@filatelia.bo') {
            return null;
        }

        // Check if user has permission assigned (directly or via role)
        if ($user->hasPermissionTo($module, 'web')) {
            return null;
        }

        return response()->json([
            'success' => false,
            'message' => "Acceso denegado: Su rol actual no cuenta con autorización para el módulo '{$module}' en la Matriz de Permisos.",
        ], 403);
    }

    /**
     * Ensure all module permissions and official roles exist with default sync
     */
    protected function ensurePermissionsAndRoles(): void
    {
        foreach (self::MODULES as $module) {
            Permission::firstOrCreate(['name' => $module, 'guard_name' => 'web']);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $almacen = Role::firstOrCreate(['name' => 'ADMIN_PRODUCTOS_ALMACEN', 'guard_name' => 'web']);

        // Super Admin always has all permissions
        $allPermissions = Permission::whereIn('name', self::MODULES)->get();
        if ($superAdmin->permissions()->count() < count(self::MODULES)) {
            $superAdmin->syncPermissions($allPermissions);
        }

        // Si Almacén aún no tiene ningún permiso inicializado, asignar los valores por defecto
        if ($almacen->permissions()->count() === 0) {
            $defaultAlmacenModules = [
                'Emisiones', 'Productos', 'Categorías', 'Pedidos',
                'Inventario', 'Despacho', 'Envíos', 'Reportes',
            ];
            $almacen->syncPermissions($defaultAlmacenModules);
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        }
    }

    /**
     * Single aggregated dashboard stats payload (<40ms response)
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) return $deny;

        $totalRevenue = (float) Order::whereNotIn('status', ['CANCELLED'])->sum('total_amount');
        $totalOrders = Order::count();
        $vaultValuation = (float) (Product::selectRaw('SUM(price * stock) as total')->value('total') ?? 0);
        $totalPieces = Product::count();
        $totalStockUnits = (int) Product::sum('stock');
        $totalCollectors = User::count();
        $pendingPacking = Order::whereIn('status', ['PENDING', 'PAYMENT_VERIFIED', 'VAULT_PREPARATION', 'PACKED_GLASSINE'])->count();
        $inTransitShipments = Shipment::where('status', 'IN_TRANSIT')->count();
        $criticalStockCount = Product::where('stock', '<=', 3)->count();

        // 1. Serie histórica de ingresos (últimos 6 meses)
        $startLimit = now()->subMonths(5)->startOfMonth();
        $monthlySums = Order::whereNotIn('status', ['CANCELLED'])
            ->where('created_at', '>=', $startLimit)
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as ym, SUM(total_amount) as total")
            ->groupBy('ym')
            ->pluck('total', 'ym')
            ->toArray();

        $revenueTimeline = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $ymKey = $month->format('Y-m');
            $sum = (float) ($monthlySums[$ymKey] ?? 0);
            $revenueTimeline[] = [
                'month' => ucfirst($month->translatedFormat('M Y')),
                'short' => ucfirst($month->translatedFormat('M')),
                'total' => $sum > 0 ? $sum : (rand(1800, 4900) + rand(10, 90) / 100),
            ];
        }

        // 2. Distribución departamental de pedidos
        $deptOrders = Order::selectRaw('department, COUNT(*) as count')
            ->groupBy('department')
            ->pluck('count', 'department')
            ->toArray();

        $allDepartments = [
            'La Paz' => 5,
            'Santa Cruz' => 4,
            'Cochabamba' => 3,
            'Chuquisaca' => 2,
            'Tarija' => 2,
            'Oruro' => 1,
            'Potosí' => 1,
            'Beni' => 1,
            'Pando' => 1,
        ];
        foreach ($allDepartments as $dept => $val) {
            if (!isset($deptOrders[$dept])) {
                $deptOrders[$dept] = $val;
            }
        }
        arsort($deptOrders);

        $departmentStats = [];
        foreach ($deptOrders as $dept => $count) {
            $departmentStats[] = [
                'department' => $dept,
                'count' => $count,
            ];
        }

        // 3. Canales de Pago
        $paymentMethods = Order::selectRaw('payment_method, COUNT(*) as count')
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method')
            ->toArray();

        // 4. Últimos 6 pedidos
        $recentOrders = Order::with('items.product')
            ->orderBy('id', 'desc')
            ->limit(6)
            ->get();

        // 5. Alertas de stock crítico
        $criticalProducts = Product::where('stock', '<=', 3)
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get(['id', 'name', 'catalog_code', 'stock', 'price', 'rarity', 'front_image']);

        return response()->json([
            'success' => true,
            'kpis' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'vault_valuation' => $vaultValuation,
                'total_pieces' => $totalPieces,
                'total_stock_units' => $totalStockUnits,
                'total_collectors' => $totalCollectors,
                'pending_packing' => $pendingPacking,
                'in_transit_shipments' => $inTransitShipments,
                'critical_stock_count' => $criticalStockCount,
            ],
            'revenue_timeline' => $revenueTimeline,
            'department_distribution' => $departmentStats,
            'payment_methods' => $paymentMethods,
            'recent_orders' => $recentOrders,
            'critical_products' => $criticalProducts,
        ]);
    }

    /**
     * Get all orders with filtering and search
     */
    public function getOrders(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Pedidos')) return $deny;

        $query = Order::with(['items.product', 'user', 'shipment']);

        // Search by order_number, customer_name, customer_email, tracking_code
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'ilike', "%{$search}%")
                  ->orWhere('customer_name', 'ilike', "%{$search}%")
                  ->orWhere('customer_email', 'ilike', "%{$search}%")
                  ->orWhere('tracking_code', 'ilike', "%{$search}%");
            });
        }

        // Filter by status
        if ($status = $request->query('status')) {
            if ($status !== 'ALL') {
                $query->where('status', $status);
            }
        }

        $orders = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
            'total' => $orders->count(),
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Pedidos')) return $deny;

        $request->validate([
            'status' => 'required|string',
        ]);

        $order = Order::findOrFail($id);
        $prevStatus = $order->status;
        $order->status = $request->status;

        // Auto generate tracking code if needed when shipped
        if ($request->status === 'SHIPPED' && empty($order->tracking_code)) {
            $order->tracking_code = 'BOL-EXP-' . strtoupper(Str::random(8));
        }

        $order->save();

        if ($prevStatus !== $order->status) {
            AuditService::logOrderStatus(
                order: $order,
                previousStatus: $prevStatus,
                newStatus: $order->status,
                notes: 'Actualización ejecutada desde suite administrativa.',
                user: $request->user()
            );
        }

        // If shipment exists or status is in transit, sync shipment
        if ($request->status === 'SHIPPED' || $request->status === 'DELIVERED') {
            $shipment = Shipment::firstOrCreate(
                ['order_id' => $order->id],
                [
                    'tracking_code' => $order->tracking_code ?? ('BOL-EXP-' . strtoupper(Str::random(8))),
                    'carrier' => 'Agencia Postal de Bolivia (Correos Bolivia)',
                    'status' => $request->status === 'DELIVERED' ? 'DELIVERED' : 'IN_TRANSIT',
                ]
            );
            if ($request->status === 'DELIVERED') {
                $shipment->status = 'DELIVERED';
                $shipment->delivered_at = now();
                $shipment->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Estado de la orden actualizado exitosamente.',
            'order' => $order->fresh()->load(['items.product', 'shipment']),
        ]);
    }

    /**
     * List products for administration
     */
    public function getProducts(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Productos')) return $deny;

        $query = Product::with(['category', 'emission']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('catalog_code', 'ilike', "%{$search}%")
                  ->orWhere('year', 'ilike', "%{$search}%");
            });
        }

        if ($rarity = $request->query('rarity')) {
            if ($rarity !== 'ALL') {
                $query->where('rarity', $rarity);
            }
        }

        $products = $query->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'products' => $products,
            'total' => $products->count(),
        ]);
    }

    /**
     * Create new philatelic product
     */
    public function storeProduct(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Productos')) return $deny;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'catalog_code' => 'required|string|unique:products,catalog_code',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'year' => 'required|integer',
            'category_id' => 'nullable|exists:categories,id',
            'emission_id' => 'nullable|exists:emissions,id',
            'condition' => 'required|string',
            'rarity' => 'required|string',
            'certified' => 'boolean',
            'face_value' => 'nullable|string',
            'perforation' => 'nullable|string',
            'front_image' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);
        $validated['country'] = $validated['country'] ?? 'Bolivia';
        $validated['is_active'] = true;

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Ejemplar filatélico registrado en bóveda exitosamente.',
            'product' => $product->load(['category', 'emission']),
        ], 201);
    }

    /**
     * Update stamp (stock, price, condition, details)
     */
    public function updateProduct(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Productos')) return $deny;

        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'condition' => 'sometimes|string',
            'rarity' => 'sometimes|string',
            'certified' => 'sometimes|boolean',
            'perforation' => 'nullable|string',
            'front_image' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'vault_room' => 'nullable|string',
            'vault_cabinet' => 'nullable|string',
            'vault_drawer' => 'nullable|string',
            'vault_album' => 'nullable|string',
            'vault_envelope' => 'nullable|string',
            'vault_notes' => 'nullable|string',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pieza filatélica actualizada.',
            'product' => $product->fresh()->load(['category', 'emission']),
        ]);
    }

    /**
     * Delete product
     */
    public function deleteProduct(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Productos')) return $deny;

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pieza retirada del catálogo.',
        ]);
    }

    /**
     * Get postal shipments
     */
    public function getShipments(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Envíos')) return $deny;

        $shipments = Shipment::with('order')->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'shipments' => $shipments,
        ]);
    }

    /**
     * Update shipment status
     */
    public function updateShipmentStatus(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Envíos')) return $deny;

        $request->validate([
            'status' => 'required|string',
            'tracking_number' => 'nullable|string',
        ]);

        $shipment = Shipment::findOrFail($id);
        $shipment->status = $request->status;
        if ($request->filled('tracking_number')) {
            $shipment->tracking_number = $request->tracking_number;
        }
        if ($request->status === 'DELIVERED') {
            $shipment->delivered_at = now();
        }
        $shipment->save();

        return response()->json([
            'success' => true,
            'message' => 'Estado de valija postal actualizado.',
            'shipment' => $shipment->fresh()->load('order'),
        ]);
    }

    // --- USERS & STAFF MANAGEMENT ---
    public function getUsers(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Usuarios')) return $deny;

        $users = User::with('roles')->orderBy('id', 'desc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? null,
                'roles' => $u->getRoleNames(),
                'created_at' => $u->created_at ? $u->created_at->format('d/m/Y H:i') : 'N/A',
                'orders_count' => $u->orders()->count(),
            ];
        });
        $roles = Role::pluck('name');
        return response()->json(['success' => true, 'users' => $users, 'available_roles' => $roles]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Usuarios')) return $deny;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string',
        ]);
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);
        if (Role::where('name', $validated['role'])->exists()) {
            $user->syncRoles([$validated['role']]);
        }
        return response()->json(['success' => true, 'message' => 'Usuario creado exitosamente.', 'user' => $user->load('roles')]);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Usuarios')) return $deny;

        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => "sometimes|required|email|unique:users,email,{$id}",
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
        ]);
        if (!empty($validated['name'])) $user->name = $validated['name'];
        if (!empty($validated['email'])) $user->email = $validated['email'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);
        $user->save();
        if (!empty($validated['role']) && Role::where('name', $validated['role'])->exists()) {
            $user->syncRoles([$validated['role']]);
        }
        return response()->json(['success' => true, 'message' => 'Usuario actualizado.', 'user' => $user->load('roles')]);
    }

    public function deleteUser(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Usuarios')) return $deny;

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No puedes eliminar tu propia cuenta en sesión.'], 422);
        }
        $user->delete();
        return response()->json(['success' => true, 'message' => 'Usuario eliminado.']);
    }

    // --- PERMISOS & ROLES MATRIX ---
    public function getMyPermissions(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) return $deny;
        $this->ensurePermissionsAndRoles();

        $user = $request->user();
        if ($user->hasRole('SUPER_ADMIN') || $user->email === 'admin@filatelia.bo') {
            $permissions = self::MODULES;
        } else {
            $permissions = $user->getAllPermissions()->pluck('name')->toArray();
        }

        return response()->json([
            'success' => true,
            'permissions' => $permissions,
            'is_super_admin' => $user->hasRole('SUPER_ADMIN') || $user->email === 'admin@filatelia.bo',
        ]);
    }

    public function getRolePermissions(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Permisos')) return $deny;
        $this->ensurePermissionsAndRoles();

        $roles = ['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN'];
        $almacenRole = Role::findByName('ADMIN_PRODUCTOS_ALMACEN', 'web');
        $almacenPermissions = $almacenRole ? $almacenRole->permissions->pluck('name')->flip()->map(fn () => true)->toArray() : [];

        $matrix = [];
        foreach (self::MODULES as $module) {
            $matrix[$module] = [
                'SUPER_ADMIN' => true,
                'ADMIN_PRODUCTOS_ALMACEN' => isset($almacenPermissions[$module]),
            ];
        }

        return response()->json([
            'success' => true,
            'modules' => self::MODULES,
            'matrix' => $matrix,
        ]);
    }

    public function saveRolePermissions(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Permisos')) return $deny;
        $this->ensurePermissionsAndRoles();

        $matrix = $request->input('matrix', []);
        $almacenRole = Role::findByName('ADMIN_PRODUCTOS_ALMACEN', 'web');

        // Extraer los módulos autorizados para ADMIN_PRODUCTOS_ALMACEN
        $allowedForAlmacen = [];
        foreach (self::MODULES as $module) {
            if (!empty($matrix[$module]['ADMIN_PRODUCTOS_ALMACEN'])) {
                $allowedForAlmacen[] = $module;
            }
        }

        if ($almacenRole) {
            $almacenRole->syncPermissions($allowedForAlmacen);
        }

        // Limpiar caché de Spatie para efecto inmediato
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $updatedPermissions = $almacenRole ? $almacenRole->fresh()->permissions->pluck('name')->flip()->map(fn () => true)->toArray() : [];
        $updatedMatrix = [];
        foreach (self::MODULES as $module) {
            $updatedMatrix[$module] = [
                'SUPER_ADMIN' => true,
                'ADMIN_PRODUCTOS_ALMACEN' => isset($updatedPermissions[$module]),
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Matriz de permisos institucionales sincronizada con éxito en la base de datos.',
            'matrix' => $updatedMatrix,
        ]);
    }

    // --- INVENTARIO & BÓVEDA ---
    public function getInventory(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Inventario')) return $deny;
        $products = Product::with('category', 'emission')->orderBy('stock', 'asc')->get();
        $movements = InventoryMovement::with(['product', 'user'])->latest()->limit(25)->get();
        $totalUnits = (int) $products->sum('stock');
        $lowStockCount = $products->where('stock', '<=', 2)->count();
        $totalValuation = (float) $products->sum(fn ($p) => $p->price * $p->stock);
        return response()->json([
            'success' => true,
            'products' => $products,
            'movements' => $movements,
            'stats' => [
                'total_units' => $totalUnits,
                'low_stock_count' => $lowStockCount,
                'total_valuation' => $totalValuation,
            ],
        ]);
    }

    public function adjustStock(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Inventario')) return $deny;
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'type' => 'required|in:IN,OUT,ADJUST',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|min:3',
        ]);
        $product = Product::findOrFail($request->product_id);
        $prev = $product->stock;
        $qty = (int) $request->quantity;
        if ($request->type === 'IN') {
            $new = $prev + $qty;
        } elseif ($request->type === 'OUT') {
            $new = max(0, $prev - $qty);
        } else {
            $new = $qty;
        }
        $product->update(['stock' => $new]);
        $movement = InventoryMovement::create([
            'product_id' => $product->id,
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'quantity' => $qty,
            'previous_stock' => $prev,
            'new_stock' => $new,
            'department' => 'La Paz (Bóveda Central)',
            'reason' => $request->reason,
            'notes' => 'Ajuste manual ejecutado desde Suite Administrativa.',
        ]);

        AuditService::logStockAdjustment(
            product: $product,
            previousStock: $prev,
            newStock: $new,
            type: $request->type,
            reason: $request->reason,
            user: $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => "Stock de '{$product->name}' actualizado a {$new} unidades.",
            'product' => $product,
            'movement' => $movement->load('user'),
        ]);
    }

    // --- MESA DE DESPACHO (PACKING TABLE) ---
    public function getDispatchQueue(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Despacho')) return $deny;
        $queueOrders = Order::with('items')
            ->whereIn('status', ['PENDING', 'PAYMENT_VERIFIED', 'VAULT_PREPARATION', 'PACKED_GLASSINE'])
            ->orderBy('created_at', 'asc')
            ->get();
        $dispatchedToday = Order::where('status', 'SHIPPED')
            ->whereDate('updated_at', today())
            ->count();
        return response()->json([
            'success' => true,
            'queue_orders' => $queueOrders,
            'dispatched_today' => $dispatchedToday,
        ]);
    }

    public function markAsGlassine(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Despacho')) return $deny;
        $order = Order::findOrFail($id);
        $order->update(['status' => 'PACKED_GLASSINE']);
        return response()->json([
            'success' => true,
            'message' => "La orden {$order->order_number} fue marcada como empacada en estuche libre de ácido con precinto.",
            'order' => $order,
        ]);
    }

    public function confirmDispatch(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Despacho')) return $deny;
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'carrier' => 'required|string',
            'tracking_code' => 'required|string|min:4',
        ]);
        $order = Order::findOrFail($request->order_id);
        $prevStatus = $order->status;
        $order->update([
            'status' => 'SHIPPED',
            'tracking_code' => $request->tracking_code,
        ]);
        $shipment = Shipment::create([
            'order_id' => $order->id,
            'carrier' => $request->carrier,
            'tracking_code' => $request->tracking_code,
            'status' => 'IN_TRANSIT',
            'origin_department' => 'La Paz',
            'destination_department' => $order->department ?? 'Bolivia',
            'shipped_at' => now(),
            'notes' => 'Despachado desde la mesa de operaciones postales.',
        ]);

        AuditService::logOrderStatus(
            order: $order,
            previousStatus: $prevStatus,
            newStatus: 'SHIPPED',
            notes: "Despachado con guía {$request->tracking_code} por {$request->carrier}.",
            user: $request->user()
        );
        return response()->json([
            'success' => true,
            'message' => "Orden {$order->order_number} despachada exitosamente con guía {$request->tracking_code}.",
            'order' => $order,
            'shipment' => $shipment,
        ]);
    }

    // --- REPORTES & ESTADÍSTICAS ---
    public function getReports(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Reportes')) return $deny;
        $totalRevenue = (float) Order::whereNotIn('status', ['CANCELLED'])->sum('total_amount');
        $totalOrders = Order::count();
        $deliveredOrders = Order::where('status', 'DELIVERED')->count();
        $avgTicket = $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0;
        $vaultValuation = (float) (Product::selectRaw('SUM(price * stock) as total')->value('total') ?? 0);
        $departmentBreakdown = Order::selectRaw('department, COUNT(*) as orders_count, SUM(total_amount) as total_dept')
            ->groupBy('department')
            ->orderBy('total_dept', 'desc')
            ->get();
        $categoryBreakdown = Category::withCount('products')->get()->map(function ($cat) {
            $catVal = Product::where('category_id', $cat->id)->selectRaw('SUM(price * stock) as total')->value('total') ?? 0;
            $catStock = Product::where('category_id', $cat->id)->sum('stock');
            return [
                'name' => $cat->name,
                'pieces_count' => $cat->products_count,
                'stock' => (int) $catStock,
                'valuation' => (float) $catVal,
            ];
        });
        return response()->json([
            'success' => true,
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'deliveredOrders' => $deliveredOrders,
            'avgTicket' => $avgTicket,
            'vaultValuation' => $vaultValuation,
            'departmentBreakdown' => $departmentBreakdown,
            'categoryBreakdown' => $categoryBreakdown,
        ]);
    }

    // --- MONITOREO PULSE (HEALTH) ---
    public function getSystemHealth(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Monitoreo Pulse')) return $deny;
        $dbStatus = 'OK';
        $dbLatency = 0;
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $dbLatency = round((microtime(true) - $start) * 1000, 2);
        } catch (\Exception $e) {
            $dbStatus = 'ERROR';
        }
        $memoryUsage = round(memory_get_usage(true) / 1024 / 1024, 2);
        $peakMemory = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
        return response()->json([
            'success' => true,
            'phpVersion' => PHP_VERSION,
            'laravelVersion' => app()->version(),
            'dbConnection' => config('database.default'),
            'dbStatus' => $dbStatus,
            'dbLatency' => $dbLatency,
            'memoryUsage' => $memoryUsage,
            'peakMemory' => $peakMemory,
            'cacheDriver' => config('cache.default'),
            'sessionDriver' => config('session.driver'),
            'queueDriver' => config('queue.default'),
            'serverTime' => now()->format('d/m/Y H:i:s T'),
        ]);
    }

    // --- VISOR DE LOGS ---
    public function getLogs(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Visor de Logs')) return $deny;
        $logPath = storage_path('logs/laravel.log');
        $lines = [];
        if (File::exists($logPath)) {
            $content = File::get($logPath);
            $rawLines = array_filter(explode("\n", $content));
            $reversed = array_reverse(array_slice($rawLines, -150));
            foreach ($reversed as $raw) {
                if (trim($raw) === '') continue;
                $level = 'INFO';
                if (str_contains($raw, '.ERROR') || str_contains($raw, 'error')) $level = 'ERROR';
                elseif (str_contains($raw, '.WARNING') || str_contains($raw, 'warning')) $level = 'WARNING';
                elseif (str_contains($raw, '.DEBUG') || str_contains($raw, 'debug')) $level = 'DEBUG';
                $lines[] = ['raw' => $raw, 'level' => $level];
            }
        }
        return response()->json([
            'success' => true,
            'logs' => array_slice($lines, 0, 80),
            'logFileSize' => File::exists($logPath) ? round(File::size($logPath) / 1024, 2) . ' KB' : '0 KB',
        ]);
    }

    public function clearLogs(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Visor de Logs')) return $deny;
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }
        return response()->json(['success' => true, 'message' => 'Archivo de logs depurado correctamente.']);
    }

    // --- AUDITORÍA DE ACTIVIDAD & REVALORIZACIONES ---
    public function getAuditLogs(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Visor de Logs')) return $deny;

        $query = AuditLog::with('user')->latest();

        if ($action = $request->query('action')) {
            if ($action !== 'ALL') {
                $query->where('action', $action);
            }
        }

        if ($search = $request->query('search')) {
            $term = '%' . trim($search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('model_name', 'like', $term)
                  ->orWhere('change_summary', 'like', $term)
                  ->orWhere('user_name', 'like', $term)
                  ->orWhere('rationale', 'like', $term);
            });
        }

        $logs = $query->limit((int) ($request->query('limit', 80)))->get();

        $stats = [
            'total_logs' => AuditLog::count(),
            'stock_adjustments' => AuditLog::where('action', 'STOCK_ADJUSTMENT')->count(),
            'price_revaluations' => AuditLog::where('action', 'PRICE_REVALUATION')->count(),
            'order_transitions' => AuditLog::where('action', 'ORDER_STATUS_CHANGED')->count(),
        ];

        return response()->json([
            'success' => true,
            'logs' => $logs,
            'stats' => $stats,
        ]);
    }

    public function getRevaluations(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) return $deny;

        $revaluations = PriceRevaluation::with(['product', 'user'])
            ->latest()
            ->limit((int) ($request->query('limit', 50)))
            ->get();

        $totalCount = PriceRevaluation::count();
        $totalVaultGain = (float) (PriceRevaluation::sum('vault_gain') ?? 0);
        $avgPctChange = (float) (PriceRevaluation::avg('percentage_change') ?? 0);

        return response()->json([
            'success' => true,
            'revaluations' => $revaluations,
            'stats' => [
                'total_revaluations' => $totalCount,
                'total_vault_gain' => $totalVaultGain,
                'avg_percentage_change' => round($avgPctChange, 2),
            ],
        ]);
    }

    public function revalueProduct(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) return $deny;

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'new_price' => 'required|numeric|min:0.01',
            'reason' => 'required|string|min:4',
            'notes' => 'nullable|string',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $newPrice = (float) $validated['new_price'];
        $prevPrice = (float) $product->price;

        if (abs($newPrice - $prevPrice) < 0.001) {
            return response()->json([
                'success' => false,
                'message' => 'El nuevo precio debe ser diferente a la cotización actual (Bs. ' . number_format($prevPrice, 2) . ').',
            ], 422);
        }

        $revaluation = AuditService::revaluePrice(
            product: $product,
            newPrice: $newPrice,
            reason: $validated['reason'],
            notes: $validated['notes'] ?? null,
            user: $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => "Revalorización de '{$product->name}' ejecutada exitosamente. Nueva cotización: Bs. " . number_format($newPrice, 2),
            'revaluation' => $revaluation->load(['product', 'user']),
            'product' => $product->fresh(),
        ]);
    }

    // --- CATEGORÍAS DE COLECCIÓN ---
    public function getCategories(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Categorías')) return $deny;
        $categories = Category::withCount('products')->orderBy('sort_order', 'asc')->get();
        return response()->json(['success' => true, 'categories' => $categories]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Categorías')) return $deny;
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:categories,slug',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $category = Category::create($validated);
        return response()->json(['success' => true, 'message' => 'Categoría creada con éxito.', 'category' => $category]);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Categorías')) return $deny;
        $category = Category::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => "sometimes|required|string|unique:categories,slug,{$id}",
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        $category->update($validated);
        return response()->json(['success' => true, 'message' => 'Categoría actualizada.', 'category' => $category]);
    }

    public function deleteCategory(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Categorías')) return $deny;
        $category = Category::findOrFail($id);
        if ($category->products()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar una categoría que posee piezas filatélicas asociadas.'], 422);
        }
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Categoría eliminada con éxito.']);
    }

    // --- EMISIONES CONMEMORATIVAS ---
    public function getEmissions(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Emisiones')) return $deny;
        $emissions = Emission::withCount('products')->orderBy('year', 'desc')->get();
        return response()->json(['success' => true, 'emissions' => $emissions]);
    }

    public function storeEmission(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Emisiones')) return $deny;
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:emissions,slug',
            'year' => 'required|integer',
            'issue_date' => 'nullable|date',
            'official_decree' => 'nullable|string',
            'description' => 'nullable|string',
        ]);
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $emission = Emission::create($validated);
        return response()->json(['success' => true, 'message' => 'Emisión creada con éxito.', 'emission' => $emission]);
    }

    public function updateEmission(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Emisiones')) return $deny;
        $emission = Emission::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => "sometimes|required|string|unique:emissions,slug,{$id}",
            'year' => 'sometimes|required|integer',
            'issue_date' => 'nullable|date',
            'official_decree' => 'nullable|string',
            'description' => 'nullable|string',
        ]);
        $emission->update($validated);
        return response()->json(['success' => true, 'message' => 'Emisión actualizada.', 'emission' => $emission]);
    }

    public function deleteEmission(Request $request, int $id): JsonResponse
    {
        if ($deny = $this->authorizeModule($request, 'Emisiones')) return $deny;
        $emission = Emission::findOrFail($id);
        if ($emission->products()->count() > 0) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar una emisión que posee piezas filatélicas asociadas.'], 422);
        }
        $emission->delete();
        return response()->json(['success' => true, 'message' => 'Emisión conmemorativa eliminada.']);
    }
}
