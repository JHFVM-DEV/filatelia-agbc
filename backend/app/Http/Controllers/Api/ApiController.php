<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Emission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiController extends Controller
{
    /**
     * Get philatelic catalog with advanced filters and in-memory cache
     */
    public function getProducts(Request $request): JsonResponse
    {
        $hasCustomFilters = $request->filled('category') 
            || $request->filled('condition') 
            || $request->filled('rarity') 
            || $request->filled('year') 
            || $request->filled('search') 
            || $request->boolean('featured') 
            || ($request->get('sort', 'newest') !== 'newest');

        if (!$hasCustomFilters) {
            $products = Cache::remember('public_catalog_default', 60, function () {
                return Product::with(['category', 'emission'])
                    ->where('is_active', true)
                    ->orderBy('id', 'desc')
                    ->get();
            });

            return response()->json([
                'success' => true,
                'count' => $products->count(),
                'cached' => true,
                'data' => $products,
            ]);
        }

        $query = Product::with(['category', 'emission'])->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('rarity')) {
            $query->where('rarity', $request->rarity);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', $s)
                  ->orWhere('catalog_code', 'like', $s)
                  ->orWhere('description', 'like', $s);
            });
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $sort = $request->get('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'year_asc':
                $query->orderBy('year', 'asc');
                break;
            case 'year_desc':
                $query->orderBy('year', 'desc');
                break;
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'count' => $products->count(),
            'cached' => false,
            'data' => $products,
        ]);
    }

    /**
     * Get single product by slug
     */
    public function getProductBySlug(string $slug): JsonResponse
    {
        $product = Cache::remember("product_slug_{$slug}", 300, function () use ($slug) {
            return Product::with(['category', 'emission'])->where('slug', $slug)->first();
        });

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Pieza filatélica no encontrada.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Get categories
     */
    public function getCategories(): JsonResponse
    {
        $categories = Cache::remember('public_categories_list', 300, function () {
            return Category::withCount('products')->orderBy('sort_order')->get();
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get emissions
     */
    public function getEmissions(): JsonResponse
    {
        $emissions = Cache::remember('public_emissions_list', 300, function () {
            return Emission::withCount('products')->orderBy('year', 'desc')->get();
        });

        return response()->json([
            'success' => true,
            'data' => $emissions,
        ]);
    }

    /**
     * Create an order (checkout)
     */
    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'shipping_address' => 'required|string',
            'city' => 'required|string|max:100',
            'department' => 'required|string|max:100',
            'payment_method' => 'required|string|in:QR_TRANSFER,CREDIT_CARD,VAULT_PICKUP',
            'special_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];

                // Reducir stock si aplica
                if ($product->stock >= $item['quantity']) {
                    $product->decrement('stock', $item['quantity']);
                }
            }

            $orderNumber = 'BO-FIL-' . date('Y') . '-' . strtoupper(Str::random(6));
            $trackingCode = 'TRK-' . strtoupper(Str::random(10));

            $userId = null;
            if ($request->user()) {
                $userId = $request->user()->id;
            } else {
                $existingUser = User::where('email', $validated['customer_email'])->first();
                if ($existingUser) {
                    $userId = $existingUser->id;
                }
            }

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'],
                'city' => $validated['city'],
                'department' => $validated['department'],
                'total_amount' => $totalAmount,
                'status' => 'VAULT_VERIFIED', // Marcado como recibido y en proceso de bóveda
                'payment_method' => $validated['payment_method'],
                'tracking_code' => $trackingCode,
                'special_notes' => $validated['special_notes'] ?? null,
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Orden de colección registrada exitosamente.',
                'data' => $order->load('items'),
            ], 201);
        });
    }

    /**
     * User Login API
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        $roles = $user->getRoleNames();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $roles,
            ],
        ]);
    }

    /**
     * Unified Login for Storefront & Filament SSO
     */
    public function unifiedLogin(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas.',
            ], 401);
        }

        $roles = $user->getRoleNames();
        $token = $user->createToken('unified-token')->plainTextToken;

        $isStaff = $user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ADMIN_FILATELIA', 'ALMACEN', 'ATENCION']);
        $redirectUrl = null;

        if ($isStaff) {
            $ssoToken = Str::random(40);
            \Illuminate\Support\Facades\Cache::put('sso_token_' . $ssoToken, $user->id, now()->addMinutes(5));
            $redirectUrl = url('/admin/auth-bridge?token=' . $ssoToken);
        }

        $permissions = self::getUserModulePermissions($user);

        return response()->json([
            'success' => true,
            'token' => $token,
            'is_staff' => $isStaff,
            'redirect_url' => $redirectUrl,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $roles,
                'primary_role' => $roles->first() ?? 'CLIENTE',
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Verify if current session/token is valid and active
     */
    public function verifySession(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');

        if (!$user) {
            return response()->json([
                'valid' => false,
                'message' => 'Sesión expirada o no autenticada.',
            ], 401);
        }

        $roles = $user->getRoleNames();
        $isStaff = $user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ADMIN_FILATELIA', 'ALMACEN', 'ATENCION']);
        $permissions = self::getUserModulePermissions($user);

        return response()->json([
            'valid' => true,
            'is_staff' => $isStaff,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $roles,
                'primary_role' => $roles->first() ?? 'CLIENTE',
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Get module permissions list for a user
     */
    public static function getUserModulePermissions(User $user): array
    {
        $allModules = [
            'Emisiones', 'Productos', 'Categorías', 'Pedidos', 'Inventario', 'Despacho',
            'Envíos', 'Usuarios', 'Permisos', 'Reportes', 'Monitoreo Pulse', 'Visor de Logs',
        ];

        if ($user->hasRole('SUPER_ADMIN') || $user->email === 'admin@filatelia.bo') {
            return $allModules;
        }

        return $user->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Unified Logout (Revokes Sanctum Token and invalidates Web/Filament session)
     */
    public function logout(Request $request): JsonResponse
    {
        // 1. Invalidate sanctum token if available
        if ($user = $request->user('sanctum')) {
            $user->tokens()->delete();
        }

        // 2. Invalidate web / Filament session if active
        if (Auth::guard('web')->check()) {
            $webUser = Auth::guard('web')->user();
            if ($webUser && method_exists($webUser, 'tokens')) {
                $webUser->tokens()->delete();
            }
            Auth::guard('web')->logout();
        }
        
        try {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada correctamente en todos los portales.',
        ]);
    }

    /**
     * Get user profile with recent orders
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $orders = Order::with('items')->where('user_id', $user->id)->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ],
            'orders' => $orders,
        ]);
    }
}
