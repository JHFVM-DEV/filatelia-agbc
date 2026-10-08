<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShowcaseController extends Controller
{
    /**
     * Valida permisos administrativos
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
     * Listar configuración de vitrina para el portal general de correos
     * GET /api/admin/showcase
     */
    public function index(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) {
            return $deny;
        }

        // Piezas en vitrina ordenadas por su posición
        $showcaseItems = Product::with(['category', 'emission'])
            ->where('is_active', true)
            ->where('is_in_showcase', true)
            ->orderBy('showcase_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        // Todas las piezas del catálogo disponibles para seleccionar
        $allProducts = Product::with(['category', 'emission'])
            ->where('is_active', true)
            ->orderBy('id', 'asc')
            ->get();

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $apiUrl = url('/api/external/showcase');

        $suggestedBadges = [
            'COLECCIÓN OFICIAL',
            'PATRIMONIO CULTURAL',
            'MEMORIA POSTAL',
            'EDICIÓN INSTITUCIONAL',
            'SERIE ESPECIAL',
            'PIEZA DE BÓVEDA',
            'HOMENAJE SOBERANO',
            'BICENTENARIO',
        ];

        return response()->json([
            'success' => true,
            'showcase_items' => $showcaseItems,
            'all_products' => $allProducts,
            'total_showcase' => $showcaseItems->count(),
            'total_catalog' => $allProducts->count(),
            'endpoint_url' => $apiUrl,
            'suggested_badges' => $suggestedBadges,
        ]);
    }

    /**
     * Guardar configuración completa de piezas en vitrina y su orden
     * POST /api/admin/showcase
     */
    public function update(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) {
            return $deny;
        }

        $items = $request->input('items', []);
        $orderedIds = $request->input('ordered_ids', []);
        $badges = $request->input('badges', []);

        DB::beginTransaction();
        try {
            if (!empty($orderedIds)) {
                // Modo lista ordenada de IDs
                // 1. Desactivar todos los que no están en orderedIds
                Product::whereNotIn('id', $orderedIds)
                    ->update([
                        'is_in_showcase' => false,
                        'showcase_order' => 0,
                    ]);

                // 2. Asignar orden y activar a los IDs seleccionados
                foreach ($orderedIds as $index => $id) {
                    $order = $index + 1;
                    $data = [
                        'is_in_showcase' => true,
                        'showcase_order' => $order,
                    ];
                    if (isset($badges[$id])) {
                        $data['showcase_badge'] = $badges[$id];
                    }
                    Product::where('id', $id)->update($data);
                }
            } elseif (!empty($items)) {
                // Modo array de objetos [{id, is_in_showcase, showcase_order, showcase_badge}]
                foreach ($items as $item) {
                    if (isset($item['id'])) {
                        Product::where('id', $item['id'])->update([
                            'is_in_showcase' => (bool) ($item['is_in_showcase'] ?? false),
                            'showcase_order' => (int) ($item['showcase_order'] ?? 0),
                            'showcase_badge' => $item['showcase_badge'] ?? null,
                        ]);
                    }
                }
            }

            DB::commit();

            AuditService::log(
                'ACTUALIZAR_VITRINA_PORTAL',
                'Product',
                null,
                'Vitrina General Correos Market',
                null,
                ['count' => count($orderedIds ?: $items)],
                'Actualización de estampas expuestas y orden para el portal general de Correos',
                null,
                $request->user()
            );

            // Refrescar y retornar
            return $this->index($request);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar configuración de vitrina: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Alternar estado de una pieza en vitrina
     * POST /api/admin/showcase/{id}/toggle
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) {
            return $deny;
        }

        $product = Product::findOrFail($id);
        $newStatus = !$product->is_in_showcase;

        if ($newStatus) {
            $maxOrder = Product::where('is_in_showcase', true)->max('showcase_order') ?? 0;
            $product->is_in_showcase = true;
            $product->showcase_order = $maxOrder + 1;
            if (empty($product->showcase_badge)) {
                $product->showcase_badge = 'COLECCIÓN OFICIAL';
            }
        } else {
            $product->is_in_showcase = false;
            $product->showcase_order = 0;
        }

        $product->save();

        AuditService::log(
            $newStatus ? 'AGREGAR_A_VITRINA' : 'QUITAR_DE_VITRINA',
            'Product',
            $product->id,
            $product->name,
            ['is_in_showcase' => !$newStatus],
            ['is_in_showcase' => $newStatus, 'showcase_order' => $product->showcase_order],
            "Pieza {$product->name} " . ($newStatus ? 'agregada a' : 'retirada de') . ' vitrina del portal',
            null,
            $request->user()
        );

        return $this->index($request);
    }

    /**
     * Restablecer vitrina a la selección inicial sugerida de 4 piezas
     * POST /api/admin/showcase/reset-default
     */
    public function resetDefault(Request $request): JsonResponse
    {
        if ($deny = $this->authorizeStaff($request)) {
            return $deny;
        }

        DB::beginTransaction();
        try {
            // Desactivar todos
            Product::query()->update([
                'is_in_showcase' => false,
                'showcase_order' => 0,
            ]);

            // Asignar los primeros 4 productos
            $firstFour = Product::where('is_active', true)->orderBy('id', 'asc')->take(4)->get();
            $badges = [
                'COLECCIÓN OFICIAL',
                'PATRIMONIO CULTURAL',
                'MEMORIA POSTAL',
                'EDICIÓN INSTITUCIONAL',
            ];

            foreach ($firstFour as $idx => $prod) {
                $prod->update([
                    'is_in_showcase' => true,
                    'showcase_order' => $idx + 1,
                    'showcase_badge' => $badges[$idx] ?? 'COLECCIÓN OFICIAL',
                ]);
            }

            DB::commit();

            AuditService::log(
                'RESTABLECER_VITRINA_PORTAL',
                'Product',
                null,
                'Vitrina General Correos Market',
                null,
                ['reset' => true],
                'Restablecimiento de la vitrina a las 4 piezas predeterminadas institucionales',
                null,
                $request->user()
            );

            return $this->index($request);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al restablecer vitrina: ' . $e->getMessage(),
            ], 500);
        }
    }
}
