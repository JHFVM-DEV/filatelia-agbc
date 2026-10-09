<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\InventoryMovement;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $fictitiousSlugs = [
            'condor-1866-10c-verde',
            'bicentenario-hojita-bloque-gala',
            'fauna-andina-serie-completa-2024',
            'fdc-bicentenario-sucre-2025',
            'clasificador-lujo-64-paginas',
        ];

        $fictitious = Product::whereIn('slug', $fictitiousSlugs)->get();

        if ($fictitious->isNotEmpty()) {
            // Reasignar órdenes huérfanas de prueba a un sello real oficial si existen
            $realProduct = Product::whereNotIn('slug', $fictitiousSlugs)->where('is_active', true)->first();
            if (!$realProduct) {
                $realProduct = Product::whereNotIn('slug', $fictitiousSlugs)->first();
            }

            foreach ($fictitious as $product) {
                if ($realProduct) {
                    OrderItem::where('product_id', $product->id)->update([
                        'product_id' => $realProduct->id,
                        'product_name' => $realProduct->name,
                    ]);

                    InventoryMovement::where('product_id', $product->id)->update([
                        'product_id' => $realProduct->id,
                    ]);
                }

                $product->delete();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No se restauran productos de ejemplo ficticios
    }
};
