<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Models\Product;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProducts extends ListRecords
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('exportVaultInventory')
                ->label('Descargar Arqueo de Bóveda')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('warning')
                ->action(function () {
                    $products = Product::with('category')->orderBy('id', 'asc')->get();
                    $csvFileName = 'Arqueo_Fisico_Boveda_' . date('Y-m-d') . '.csv';

                    return response()->streamDownload(function () use ($products) {
                        $handle = fopen('php://output', 'w');
                        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
                        fputcsv($handle, ['Cód. Catálogo', 'Ejemplar Filatélico', 'Categoría', 'Año', 'Condición', 'Rareza', 'Certificado', 'Stock en Bóveda', 'Precio Unitario BOB', 'Valoración Total BOB']);

                        foreach ($products as $p) {
                            $subtotalValuation = $p->price * $p->stock;
                            fputcsv($handle, [
                                $p->catalog_code,
                                $p->name,
                                $p->category?->name ?? 'General',
                                $p->year,
                                $p->condition,
                                $p->rarity,
                                $p->certified ? 'SÍ' : 'NO',
                                $p->stock,
                                number_format($p->price, 2, '.', ''),
                                number_format($subtotalValuation, 2, '.', ''),
                            ]);
                        }
                        fclose($handle);
                    }, $csvFileName, [
                        'Content-Type' => 'text/csv; charset=UTF-8',
                    ]);
                }),

            CreateAction::make(),
        ];
    }
}
