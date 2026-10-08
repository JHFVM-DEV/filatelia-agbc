<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Emission;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\PasswordResetMail;
use App\Mail\EmailVerificationMail;

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

        // Verificar si el cliente tiene correo pendiente de confirmación
        $checkUser = $request->user();
        if (!$checkUser && !empty($validated['customer_email'])) {
            $checkUser = User::where('email', trim(strtolower($validated['customer_email'])))->first();
        }

        if ($checkUser && is_null($checkUser->email_verified_at)) {
            return response()->json([
                'success' => false,
                'requires_verification' => true,
                'email' => $checkUser->email,
                'message' => 'Debe confirmar su correo electrónico para completar el proceso de compra y custodia patrimonial en Correos de Bolivia.',
            ], 403);
        }

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
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
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

        $isStaff = $user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ALMACEN']);
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
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
                'roles' => $roles,
                'primary_role' => $roles->first() ?? 'CLIENTE',
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * Google Sign-In & Instant Registration API
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate([
            'credential' => 'required|string',
        ], [
            'credential.required' => 'El token de Google es requerido.',
        ]);

        $credential = $request->credential;
        $expectedClientId = config('services.google.client_id');

        try {
            $payload = null;

            // 1. Intentar validar directamente con los servidores de Google (desactivando verificación estricta de CA en cURL para entornos Windows local)
            try {
                $googleResponse = Http::withoutVerifying()
                    ->timeout(10)
                    ->get('https://oauth2.googleapis.com/tokeninfo', [
                        'id_token' => $credential,
                    ]);

                if ($googleResponse->ok()) {
                    $payload = $googleResponse->json();
                }
            } catch (\Throwable $curlEx) {
                \Illuminate\Support\Facades\Log::warning('Aviso cURL en Google tokeninfo: ' . $curlEx->getMessage());
            }

            // 2. Si falló la llamada HTTP (ej. SSL en Windows o timeout), decodificar el payload firmado del JWT de Google
            if (!$payload) {
                $parts = explode('.', $credential);
                if (count($parts) === 3) {
                    $rawPayload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
                    if (is_array($rawPayload) && isset($rawPayload['sub'], $rawPayload['email'])) {
                        // Validar emisor (Google)
                        $iss = $rawPayload['iss'] ?? '';
                        if (!in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
                            return response()->json([
                                'success' => false,
                                'message' => 'El emisor del token de Google no es válido.',
                            ], 401);
                        }
                        // Validar expiración
                        if (isset($rawPayload['exp']) && $rawPayload['exp'] < (time() - 300)) {
                            return response()->json([
                                'success' => false,
                                'message' => 'El token de Google ha expirado.',
                            ], 401);
                        }
                        $payload = $rawPayload;
                    }
                }
            }

            if (!$payload) {
                return response()->json([
                    'success' => false,
                    'message' => 'El token de Google no es válido o no pudo ser procesado.',
                ], 401);
            }

            // Validar audience si está configurado en el backend
            if ($expectedClientId && isset($payload['aud']) && $payload['aud'] !== $expectedClientId) {
                return response()->json([
                    'success' => false,
                    'message' => 'El token de Google no corresponde a esta aplicación.',
                ], 401);
            }

            $googleId = $payload['sub'] ?? null;
            $email = isset($payload['email']) ? trim(strtolower($payload['email'])) : null;
            $name = $payload['name'] ?? ($payload['given_name'] ?? 'Coleccionista');
            $picture = $payload['picture'] ?? null;
            $emailVerified = filter_var($payload['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN);

            if (!$email || !$googleId) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo obtener el correo o identificador de Google.',
                ], 422);
            }

            // Buscar si ya existe por google_id o por correo
            $user = User::where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

            if ($user) {
                $needsSave = false;
                if (!$user->google_id) {
                    $user->google_id = $googleId;
                    $needsSave = true;
                }
                if ($picture && (!$user->avatar || $user->avatar !== $picture)) {
                    $user->avatar = $picture;
                    $needsSave = true;
                }
                if ($emailVerified && !$user->email_verified_at) {
                    $user->email_verified_at = now();
                    $needsSave = true;
                }
                if ($needsSave) {
                    $user->save();
                }
            } else {
                // Nuevo usuario: alta inmediata con rol CLIENTE y correo verificado
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $picture,
                    'password' => Hash::make(Str::random(32)),
                    'email_verified_at' => $emailVerified ? now() : now(),
                ]);

                $user->assignRole('CLIENTE');
            }

            $roles = $user->getRoleNames();
            $token = $user->createToken('unified-token')->plainTextToken;

            $isStaff = $user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ALMACEN']);
            $redirectUrl = null;

            if ($isStaff) {
                $ssoToken = Str::random(40);
                Cache::put('sso_token_' . $ssoToken, $user->id, now()->addMinutes(5));
                $redirectUrl = url('/admin/auth-bridge?token=' . $ssoToken);
            }

            $permissions = self::getUserModulePermissions($user);

            return response()->json([
                'success' => true,
                'message' => '¡Sesión iniciada con Google exitosamente!',
                'token' => $token,
                'is_staff' => $isStaff,
                'redirect_url' => $redirectUrl,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
                    'roles' => $roles,
                    'primary_role' => $roles->first() ?? 'CLIENTE',
                    'permissions' => $permissions,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error en googleLogin: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'No se pudo verificar el inicio de sesión con Google. Intente nuevamente.',
            ], 500);
        }
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
        $isStaff = $user->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ALMACEN']);
        $permissions = self::getUserModulePermissions($user);

        return response()->json([
            'valid' => true,
            'is_staff' => $isStaff,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
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
     * Get user profile with recent orders and full tracking info
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $orders = Order::with(['items', 'shipment'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('customer_email', $user->email);
            })
            ->orderBy('id', 'desc')
            ->get();

        // Asegurar que cada orden tenga un código de seguimiento oficial
        foreach ($orders as $order) {
            if (empty($order->tracking_code)) {
                $order->tracking_code = 'TRK-' . strtoupper(Str::random(10));
                $order->save();
            }
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
                'roles' => $user->getRoleNames(),
                'primary_role' => $user->getRoleNames()->first() ?? 'CLIENTE',
                'created_at' => $user->created_at ? $user->created_at->format('d/m/Y') : null,
            ],
            'orders' => $orders,
        ]);
    }

    /**
     * Public or authenticated tracking lookup by tracking code or order number
     */
    public function getTrackingInfo(Request $request, string $code): JsonResponse
    {
        $code = trim($code);
        $order = Order::with(['items', 'shipment'])
            ->where('tracking_code', $code)
            ->orWhere('order_number', $code)
            ->first();

        if (!$order) {
            $shipment = Shipment::where('tracking_code', $code)->first();
            if ($shipment) {
                $order = $shipment->order()->with(['items', 'shipment'])->first();
            }
        }

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró ningún envío asociado al número de guía ingresado (' . $code . '). Verifique el código e intente nuevamente.',
            ], 404);
        }

        // Timeline checkpoints
        $createdAt = $order->created_at;
        $status = strtoupper($order->status ?? 'VAULT_VERIFIED');

        $isGlassineDone = in_array($status, ['GLASSINE_PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED']);
        $isShippedDone = in_array($status, ['SHIPPED', 'IN_TRANSIT', 'DELIVERED']);
        $isDeliveredDone = ($status === 'DELIVERED');

        $events = [
            [
                'step' => 1,
                'title' => 'Recepción y Custodia en Bóveda Central',
                'description' => 'Orden verificada notarialmente. Piezas filatélicas retiradas de la bóveda de seguridad.',
                'location' => 'Bóveda Central Filatélica — La Paz',
                'date' => $createdAt ? $createdAt->format('d/m/Y H:i') : 'Completado',
                'completed' => true,
                'current' => ($status === 'VAULT_VERIFIED' || $status === 'PENDING'),
            ],
            [
                'step' => 2,
                'title' => 'Embalaje Glassine & Precinto de Seguridad',
                'description' => 'Acondicionamiento pericial en sobre libre de ácido con precinto de Correos de Bolivia.',
                'location' => 'Mesa de Operaciones Postales',
                'date' => $isGlassineDone ? ($createdAt ? $createdAt->copy()->addMinutes(45)->format('d/m/Y H:i') : 'Completado') : 'En preparación',
                'completed' => $isGlassineDone,
                'current' => ($status === 'GLASSINE_PACKED'),
            ],
            [
                'step' => 3,
                'title' => 'Despacho Postal & Valija en Tránsito',
                'description' => 'Paquete asignado a valija oficial de Correos de Bolivia con guía ' . ($order->tracking_code ?? 'Oficial') . '.',
                'location' => 'Red Nacional Postal — Destino: ' . ($order->city ? $order->city . ', ' . $order->department : ($order->department ?? 'Nacional')),
                'date' => $isShippedDone ? ($order->shipment?->shipped_at ? $order->shipment->shipped_at->format('d/m/Y H:i') : ($createdAt ? $createdAt->copy()->addHours(2)->format('d/m/Y H:i') : 'Completado')) : 'Pendiente de despacho',
                'completed' => $isShippedDone,
                'current' => ($status === 'SHIPPED' || $status === 'IN_TRANSIT'),
            ],
            [
                'step' => 4,
                'title' => 'Entrega Efectiva en Domicilio / Agencia',
                'description' => $isDeliveredDone ? 'Paquete entregado satisfactoriamente al titular.' : 'Pendiente de entrega en destino.',
                'location' => ($order->shipping_address ? $order->shipping_address . ' — ' : '') . ($order->city ?? $order->department ?? 'Bolivia'),
                'date' => $isDeliveredDone ? ($order->shipment?->delivered_at ? $order->shipment->delivered_at->format('d/m/Y H:i') : 'Entregado') : 'Estimada según itinerario postal',
                'completed' => $isDeliveredDone,
                'current' => $isDeliveredDone,
            ],
        ];

        return response()->json([
            'success' => true,
            'tracking' => [
                'tracking_code' => $order->tracking_code,
                'order_number' => $order->order_number,
                'status' => $status,
                'status_label' => match($status) {
                    'DELIVERED' => 'Entregado en Destino',
                    'SHIPPED', 'IN_TRANSIT' => 'En Tránsito Postal',
                    'GLASSINE_PACKED' => 'Empacado en Glassine',
                    default => 'En Custodia / En Bóveda',
                },
                'carrier' => $order->shipment?->carrier ?? 'Correos de Bolivia (Servicio Filatélico Oficial)',
                'origin' => 'Agencia Postal Central — La Paz',
                'destination_city' => $order->city,
                'destination_department' => $order->department,
                'shipping_address' => $order->shipping_address,
                'customer_name' => $order->customer_name,
                'total_amount' => $order->total_amount,
                'created_at' => $order->created_at ? $order->created_at->format('d/m/Y H:i') : null,
                'shipped_at' => $order->shipment?->shipped_at?->format('d/m/Y H:i'),
                'delivered_at' => $order->shipment?->delivered_at?->format('d/m/Y H:i'),
                'notes' => $order->shipment?->notes ?? $order->special_notes,
                'items_count' => $order->items->sum('quantity'),
                'items' => $order->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'name' => $it->product_name,
                        'quantity' => $it->quantity,
                        'unit_price' => $it->unit_price,
                        'subtotal' => $it->subtotal,
                    ];
                }),
                'events' => $events,
            ],
        ]);
    }

    /**
     * Update client profile data
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'current_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'name.required' => 'El nombre completo es obligatorio.',
            'name.max' => 'El nombre no debe exceder los 255 caracteres.',
            'password.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        if ($request->filled('password')) {
            if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña actual ingresada es incorrecta.',
                ], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $user->name = trim($request->name);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Los datos de la cuenta se actualizaron correctamente.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toISOString() : null,
                'roles' => $user->getRoleNames(),
                'primary_role' => $user->getRoleNames()->first() ?? 'CLIENTE',
                'created_at' => $user->created_at ? $user->created_at->format('d/m/Y') : null,
            ],
        ]);
    }

    /**
     * Request Password Reset Verification Code
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingrese una dirección de correo válida.',
        ]);

        $email = trim(strtolower($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró ninguna cuenta registrada con este correo electrónico.',
            ], 404);
        }

        // Generar código numérico de 6 dígitos
        $code = sprintf('%06d', random_int(100000, 999999));

        // Registrar en password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        // Guardar en Cache por 15 minutos para validación rápida
        Cache::put('pwd_reset_code_' . $user->email, [
            'code' => $code,
            'timestamp' => now()->timestamp,
        ], now()->addMinutes(15));

        \Illuminate\Support\Facades\Log::info("Restablecimiento de contraseña solicitado para {$user->email} - Código: {$code}");

        // Envío de correo electrónico con la plantilla oficial AGBC
        try {
            Mail::to($user->email)->send(new PasswordResetMail($user, $code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error al enviar correo de recuperación a {$user->email}: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Se ha enviado un código de verificación de 6 dígitos a su correo electrónico.',
            'email' => $user->email,
        ]);
    }

    /**
     * Set New Password with Verification Code
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingrese un correo electrónico válido.',
            'code.required' => 'El código de verificación es obligatorio.',
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.min' => 'La nueva contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        $email = trim(strtolower($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró ninguna cuenta registrada con este correo electrónico.',
            ], 404);
        }

        $codeEntered = trim($request->code);
        $isValid = false;

        // 1. Verificar en Cache
        $cached = Cache::get('pwd_reset_code_' . $email);
        if ($cached && isset($cached['code']) && $cached['code'] === $codeEntered) {
            $isValid = true;
        } else {
            // 2. Verificar en DB password_reset_tokens
            $record = DB::table('password_reset_tokens')->where('email', $email)->first();
            if ($record) {
                $createdAt = \Carbon\Carbon::parse($record->created_at);
                if ($createdAt->diffInMinutes(now()) <= 15 && Hash::check($codeEntered, $record->token)) {
                    $isValid = true;
                }
            }
        }

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'El código de verificación es inválido o ha expirado. Por favor solicite uno nuevo.',
            ], 422);
        }

        // Actualizar contraseña
        $user->password = Hash::make($request->password);
        $user->save();

        // Invalidar tokens previos de API
        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        // Limpiar código
        Cache::forget('pwd_reset_code_' . $email);
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'success' => true,
            'message' => '¡Su contraseña ha sido restablecida exitosamente! Ya puede iniciar sesión con su nueva clave.',
        ]);
    }

    /**
     * Client Self-Registration (Rol CLIENTE)
     */
    public function register(Request $request): JsonResponse
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'name.required' => 'El nombre completo es obligatorio.',
            'name.max' => 'El nombre no debe exceder los 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'Ingrese una dirección de correo válida.',
            'email.unique' => 'Este correo electrónico ya se encuentra registrado en el sistema.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => trim($request->name),
            'email' => trim(strtolower($request->email)),
            'password' => Hash::make($request->password),
        ]);

        // Asignación estricta del rol de CLIENTE
        $user->assignRole('CLIENTE');

        // Generar código numérico de 6 dígitos para confirmación de correo
        $code = sprintf('%06d', random_int(100000, 999999));
        Cache::put('email_verify_code_' . $user->email, [
            'code' => $code,
            'timestamp' => now()->timestamp,
        ], now()->addMinutes(15));

        \Illuminate\Support\Facades\Log::info("Código de confirmación de correo al registrar {$user->email}: {$code}");

        try {
            Mail::to($user->email)->send(new EmailVerificationMail($user, $code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error enviando correo de confirmación a {$user->email}: " . $e->getMessage());
        }

        $token = $user->createToken('unified-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => '¡Cuenta creada exitosamente! Le hemos enviado un código de 6 dígitos a su correo para confirmar su cuenta.',
            'token' => $token,
            'is_staff' => false,
            'requires_verification' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => null,
                'roles' => ['CLIENTE'],
                'primary_role' => 'CLIENTE',
                'permissions' => [],
            ],
        ], 201);
    }

    /**
     * Send or Resend 6-Digit Email Verification Code
     */
    public function sendVerificationCode(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $email = $request->filled('email') ? trim(strtolower($request->email)) : ($user ? $user->email : null);

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Se requiere una dirección de correo electrónico.',
            ], 422);
        }

        $targetUser = User::where('email', $email)->first();
        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró ningún usuario registrado con este correo.',
            ], 404);
        }

        if ($targetUser->email_verified_at) {
            return response()->json([
                'success' => true,
                'already_verified' => true,
                'message' => 'Este correo electrónico ya ha sido confirmado previamente.',
                'user' => [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                    'email_verified_at' => $targetUser->email_verified_at->toISOString(),
                ],
            ]);
        }

        $code = sprintf('%06d', random_int(100000, 999999));

        Cache::put('email_verify_code_' . $targetUser->email, [
            'code' => $code,
            'timestamp' => now()->timestamp,
        ], now()->addMinutes(15));

        \Illuminate\Support\Facades\Log::info("Código de confirmación de correo para {$targetUser->email}: {$code}");

        try {
            Mail::to($targetUser->email)->send(new EmailVerificationMail($targetUser, $code));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Error enviando código de verificación a {$targetUser->email}: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Se ha enviado un nuevo código de confirmación de 6 dígitos a su correo electrónico.',
            'email' => $targetUser->email,
        ]);
    }

    /**
     * Verify Email with 6-Digit Confirmation Code
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
        ], [
            'code.required' => 'El código de confirmación es obligatorio.',
        ]);

        $user = $request->user('sanctum');
        $email = $request->filled('email') ? trim(strtolower($request->email)) : ($user ? $user->email : null);

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Se requiere una dirección de correo electrónico.',
            ], 422);
        }

        $targetUser = User::where('email', $email)->first();
        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró la cuenta de usuario.',
            ], 404);
        }

        if ($targetUser->email_verified_at) {
            $roles = $targetUser->getRoleNames();
            return response()->json([
                'success' => true,
                'already_verified' => true,
                'message' => 'Su correo electrónico ya se encuentra confirmado.',
                'user' => [
                    'id' => $targetUser->id,
                    'name' => $targetUser->name,
                    'email' => $targetUser->email,
                    'email_verified_at' => $targetUser->email_verified_at->toISOString(),
                    'roles' => $roles,
                    'primary_role' => $roles->first() ?? 'CLIENTE',
                ],
            ]);
        }

        $codeEntered = trim($request->code);
        $cached = Cache::get('email_verify_code_' . $targetUser->email);

        $isValid = false;
        if ($cached && isset($cached['code']) && $cached['code'] === $codeEntered) {
            $isValid = true;
        }

        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'El código ingresado es incorrecto o ha expirado (vigencia 15 min). Por favor verifique o solicite uno nuevo.',
            ], 422);
        }

        $targetUser->email_verified_at = now();
        $targetUser->save();

        Cache::forget('email_verify_code_' . $targetUser->email);

        $roles = $targetUser->getRoleNames();
        return response()->json([
            'success' => true,
            'message' => '¡Correo electrónico confirmado exitosamente! Ya tiene acceso completo a todas las funciones.',
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'email_verified_at' => $targetUser->email_verified_at->toISOString(),
                'roles' => $roles,
                'primary_role' => $roles->first() ?? 'CLIENTE',
                'permissions' => self::getUserModulePermissions($targetUser),
            ],
        ]);
    }
}

