<?php

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Catalog API
Route::get('/products', [ApiController::class, 'getProducts']);
Route::get('/products/{slug}', [ApiController::class, 'getProductBySlug']);
Route::get('/categories', [ApiController::class, 'getCategories']);
Route::get('/emissions', [ApiController::class, 'getEmissions']);
Route::post('/orders', [ApiController::class, 'createOrder']);

// External Showcase & Portal Integration (Con imágenes absolutas y datos formateados para tarjetas visuales)
Route::get('/external/products', [\App\Http\Controllers\Api\ExternalIntegrationController::class, 'getShowcase']);
Route::get('/external/showcase', [\App\Http\Controllers\Api\ExternalIntegrationController::class, 'getShowcase']);
Route::get('/external/products/{slug}', [\App\Http\Controllers\Api\ExternalIntegrationController::class, 'getProductDetail']);

// Auth API
Route::post('/auth/login', [ApiController::class, 'login']);
Route::post('/auth/unified-login', [ApiController::class, 'unifiedLogin']);
Route::get('/auth/verify-session', [ApiController::class, 'verifySession']);
Route::post('/auth/logout', [ApiController::class, 'logout']);

// Authenticated Collector Profile API
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ApiController::class, 'getProfile']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoleNames(),
        ]);
    });
});

// Native Admin Suite API
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/dashboard-stats', [\App\Http\Controllers\Api\AdminController::class, 'getDashboardStats']);
    
    // Pedidos & Órdenes
    Route::get('/orders', [\App\Http\Controllers\Api\AdminController::class, 'getOrders']);
    Route::patch('/orders/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateOrderStatus']);
    
    // Piezas Filatélicas & Catálogo
    Route::get('/products', [\App\Http\Controllers\Api\AdminController::class, 'getProducts']);
    Route::post('/products', [\App\Http\Controllers\Api\AdminController::class, 'storeProduct']);
    Route::put('/products/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateProduct']);
    Route::delete('/products/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteProduct']);
    
    // Envíos y Valijas Postales
    Route::get('/shipments', [\App\Http\Controllers\Api\AdminController::class, 'getShipments']);
    Route::patch('/shipments/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateShipmentStatus']);

    // Administración y Seguridad: Users
    Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'getUsers']);
    Route::post('/users', [\App\Http\Controllers\Api\AdminController::class, 'storeUser']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateUser']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);

    // Administración y Seguridad: Permisos & Roles
    Route::get('/roles-permissions', [\App\Http\Controllers\Api\AdminController::class, 'getRolePermissions']);
    Route::post('/roles-permissions', [\App\Http\Controllers\Api\AdminController::class, 'saveRolePermissions']);
    Route::get('/my-permissions', [\App\Http\Controllers\Api\AdminController::class, 'getMyPermissions']);

    // Bóveda & Logística: Inventario & Bóveda
    Route::get('/inventory', [\App\Http\Controllers\Api\AdminController::class, 'getInventory']);
    Route::post('/inventory/adjust', [\App\Http\Controllers\Api\AdminController::class, 'adjustStock']);

    // Bóveda & Logística: Mesa de Despacho
    Route::get('/dispatch-queue', [\App\Http\Controllers\Api\AdminController::class, 'getDispatchQueue']);
    Route::post('/dispatch-queue/{id}/glassine', [\App\Http\Controllers\Api\AdminController::class, 'markAsGlassine']);
    Route::post('/dispatch-queue/confirm', [\App\Http\Controllers\Api\AdminController::class, 'confirmDispatch']);

    // Reportes & Auditoría: Reportes & Estadísticas
    Route::get('/reports', [\App\Http\Controllers\Api\AdminController::class, 'getReports']);

    // Reportes & Auditoría: Monitoreo Pulse
    Route::get('/system-health', [\App\Http\Controllers\Api\AdminController::class, 'getSystemHealth']);

    // Reportes & Auditoría: Visor de Logs
    Route::get('/logs', [\App\Http\Controllers\Api\AdminController::class, 'getLogs']);
    Route::delete('/logs', [\App\Http\Controllers\Api\AdminController::class, 'clearLogs']);

    // Reportes & Auditoría: Bitácora de Auditoría & Revalorizaciones
    Route::get('/audit-logs', [\App\Http\Controllers\Api\AdminController::class, 'getAuditLogs']);
    Route::get('/revaluations', [\App\Http\Controllers\Api\AdminController::class, 'getRevaluations']);
    Route::post('/revalue-product', [\App\Http\Controllers\Api\AdminController::class, 'revalueProduct']);

    // Gestión Filatélica: Categorías de Colección
    Route::get('/categories', [\App\Http\Controllers\Api\AdminController::class, 'getCategories']);
    Route::post('/categories', [\App\Http\Controllers\Api\AdminController::class, 'storeCategory']);
    Route::put('/categories/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [\App\Http\Controllers\Api\AdminController::class, 'deleteCategory']);

    // Gestión Filatélica: Emisiones Conmemorativas
    Route::get('/emissions', [\App\Http\Controllers\Api\AdminController::class, 'getEmissions']);
    Route::post('/emissions', [\App\Http\Controllers\Api\AdminController::class, 'storeEmission']);
    Route::put('/emissions/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateEmission']);
    // Gestión de APIs & Integraciones (Exclusivo Super Administrador)
    Route::get('/api-tokens', [\App\Http\Controllers\Api\ApiTokenController::class, 'index']);
    Route::post('/api-tokens', [\App\Http\Controllers\Api\ApiTokenController::class, 'store']);
    Route::get('/api-tokens/docs', [\App\Http\Controllers\Api\ApiTokenController::class, 'documentation']);
    Route::get('/api-tokens/export-postman', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportPostman']);
    Route::get('/api-tokens/export-openapi', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportOpenApi']);
    Route::get('/api-tokens/export-markdown', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportMarkdown']);
    Route::get('/api-tokens/export-word', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportWord']);
    Route::get('/api-tokens/{id}', [\App\Http\Controllers\Api\ApiTokenController::class, 'show']);
    Route::get('/api-tokens/{id}/export-postman', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportTokenPostman']);
    Route::get('/api-tokens/{id}/export-markdown', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportTokenMarkdown']);
    Route::get('/api-tokens/{id}/export-word', [\App\Http\Controllers\Api\ApiTokenController::class, 'exportTokenWord']);
    Route::delete('/api-tokens/{id}', [\App\Http\Controllers\Api\ApiTokenController::class, 'destroy']);
});


