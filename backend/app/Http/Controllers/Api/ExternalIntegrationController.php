<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class ExternalIntegrationController extends Controller
{
    /**
     * Valida el token de acceso si se envía cabecera Bearer, verificando el scope 'catalogo:read' o '*'
     */
    protected function validateTokenIfPresent(Request $request): ?JsonResponse
    {
        $bearer = $request->bearerToken();
        if (!$bearer) {
            // Si no se envía token pero se solicita forzosamente autenticación con ?auth=true
            if ($request->boolean('auth_required')) {
                return response()->json([
                    'success' => false,
                    'error' => 'UNAUTHENTICATED',
                    'message' => 'Se requiere cabecera "Authorization: Bearer <API_TOKEN>" con el permiso "catalogo:read" para consultar este servicio.',
                ], 401);
            }
            return null;
        }

        $tokenModel = PersonalAccessToken::findToken($bearer);
        if (!$tokenModel) {
            return response()->json([
                'success' => false,
                'error' => 'INVALID_TOKEN',
                'message' => 'El API Token provisto no es válido o ha sido revocado.',
            ], 401);
        }

        if ($tokenModel->expires_at && Carbon::now()->gt($tokenModel->expires_at)) {
            return response()->json([
                'success' => false,
                'error' => 'TOKEN_EXPIRED',
                'message' => 'El API Token provisto ha caducado por límite de tiempo.',
            ], 401);
        }

        // Verificar habilidad de catálogo
        $abilities = $tokenModel->abilities ?? ['*'];
        $hasCatalogScope = in_array('*', $abilities) || in_array('catalogo:read', $abilities);

        if (!$hasCatalogScope) {
            return response()->json([
                'success' => false,
                'error' => 'INSUFFICIENT_SCOPE',
                'message' => 'Permiso denegado: Su clave de API no tiene asignado el scope "catalogo:read" requerido para consultar piezas filatélicas.',
                'assigned_scopes' => $abilities,
                'required_scope' => 'catalogo:read',
            ], 403);
        }

        // Actualizar último uso
        $tokenModel->forceFill(['last_used_at' => Carbon::now()])->save();

        return null;
    }

    /**
     * Transforma un modelo Product al formato óptimo de tarjeta visual para portales externos
     */
    protected function formatProductCard(Product $p): array
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        
        $conditionLabels = [
            'MINT_NH' => 'MINT NH — Goma Intacta Sin Charnela',
            'MINT_LH' => 'MINT LH — Goma con Rastro Leve',
            'FDC' => 'FDC — Sobre Primer Día de Emisión',
            'USED' => 'USED — Matasellado / Circulación Postal',
        ];

        $rarityLabels = [
            'MUSEUM_PIECE' => '👑 Pieza de Museo',
            'VERY_RARE' => '💎 Muy Rara (<50 conocidos)',
            'RARE' => '⭐ Rara (Alta Cotización)',
            'SCARCE' => '🏷️ Tirada Escasa',
            'COMMON' => '📦 Colección Regular',
        ];

        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'catalog_code' => $p->catalog_code,
            'badge' => mb_strtoupper($p->category?->name ?? 'FILATELIA OFICIAL', 'UTF-8'),
            'category' => [
                'id' => $p->category_id,
                'name' => $p->category?->name ?? 'Colección General',
                'slug' => $p->category?->slug ?? 'general',
            ],
            'emission' => $p->emission ? [
                'id' => $p->emission->id,
                'name' => $p->emission->name,
                'year' => $p->emission->year,
            ] : null,
            // URLs absolutas directas para <img src="..." />
            'image_url' => $p->image_url,
            'front_image_url' => $p->front_image_url,
            'back_image_url' => $p->back_image_url,
            'price' => (float) $p->price,
            'price_formatted' => $p->price_formatted,
            'currency' => 'BOB',
            'currency_symbol' => 'Bs.',
            'description' => $p->description,
            'short_description' => Str::limit(strip_tags($p->description ?? ''), 140, '...'),
            'year' => $p->year,
            'country' => $p->country ?: 'Bolivia',
            'condition' => $conditionLabels[$p->condition] ?? $p->condition,
            'condition_code' => $p->condition,
            'rarity' => $rarityLabels[$p->rarity] ?? $p->rarity,
            'rarity_code' => $p->rarity,
            'stock' => $p->stock,
            'is_in_stock' => $p->stock > 0,
            'certified' => (bool) $p->certified,
            'dimensions' => $p->dimensions,
            'perforation' => $p->perforation,
            'printing_technique' => $p->printing_technique,
            // Enlaces directos a la tienda para botones de compra
            'store_url' => "{$frontendUrl}/catalogo/{$p->slug}",
            'add_to_cart_url' => "{$frontendUrl}/catalogo/{$p->slug}?action=buy",
        ];
    }

    /**
     * Endpoint optimizado para vitrinas y tarjetas destacadas en la página principal externa
     * GET /api/external/showcase o GET /api/external/products
     */
    public function getShowcase(Request $request): JsonResponse
    {
        if ($deny = $this->validateTokenIfPresent($request)) {
            return $deny;
        }

        $query = Product::with(['category', 'emission'])->where('is_active', true);

        // Filtro por destacadas (por defecto true para la vitrina principal)
        if ($request->has('featured')) {
            if ($request->boolean('featured')) {
                $query->where('is_featured', true);
            }
        } else {
            // Si no se especifica, priorizar destacadas o las más recientes
            $query->where('is_featured', true);
        }

        // Si se filtra por categoría
        if ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('category', function ($q) use ($cat) {
                $q->where('slug', $cat)->orWhere('id', $cat);
            });
        }

        // Búsqueda libre
        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', $s)
                  ->orWhere('catalog_code', 'like', $s)
                  ->orWhere('description', 'like', $s);
            });
        }

        $limit = min((int) $request->get('limit', 4), 50);
        $products = $query->orderBy('id', 'desc')->take($limit)->get();

        // Si no hubieron destacadas suficientes, rellenar con activas
        if ($products->count() < $limit && !$request->has('category') && !$request->has('search')) {
            $ids = $products->pluck('id')->toArray();
            $more = Product::with(['category', 'emission'])
                ->where('is_active', true)
                ->whereNotIn('id', $ids)
                ->orderBy('id', 'desc')
                ->take($limit - count($ids))
                ->get();
            $products = $products->concat($more);
        }

        $formattedCards = $products->map(fn($p) => $this->formatProductCard($p))->values();

        return response()->json([
            'success' => true,
            'count' => $formattedCards->count(),
            'target_component' => 'Vitrina Postal de Página Principal',
            'data' => $formattedCards,
            'integration_mapping' => [
                'card_image' => 'item.image_url (URL absoluta y directa para la etiqueta <img>)',
                'card_badge' => 'item.badge (Texto de categoría superior: ej. HISTORIA POSTAL)',
                'card_title' => 'item.name (Título oficial del sello)',
                'card_description' => 'item.short_description (Reseña histórica resumida)',
                'card_price' => 'item.price_formatted (Precio con moneda en Bs.)',
                'button_redirect' => 'item.store_url (Enlace directo a la pieza en la tienda para comprar)',
            ],
        ]);
    }

    /**
     * Detalle completo de una pieza para vista modal o ficha externa
     * GET /api/external/products/{slug}
     */
    public function getProductDetail(Request $request, string $slug): JsonResponse
    {
        if ($deny = $this->validateTokenIfPresent($request)) {
            return $deny;
        }

        $product = Product::with(['category', 'emission'])
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug);
                if (is_numeric($slug)) {
                    $q->orWhere('id', (int) $slug);
                }
            })
            ->where('is_active', true)
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Pieza filatélica no encontrada o no disponible.',
            ], 404);
        }

        // Buscar piezas relacionadas de la misma categoría
        $related = Product::with(['category'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->take(3)
            ->get()
            ->map(fn($p) => $this->formatProductCard($p));

        return response()->json([
            'success' => true,
            'data' => $this->formatProductCard($product),
            'related_pieces' => $related,
        ]);
    }
}
