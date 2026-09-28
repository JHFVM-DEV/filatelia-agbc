<?php

namespace App\Filament\Widgets;

use App\Models\Emission;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PhilatelicStatsWidget extends BaseWidget
{
    protected static bool $isLazy = true;

    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    protected function getStats(): array
    {
        $totalPieces = Product::count();
        $catalogValuation = Product::selectRaw('SUM(price * stock) as total')->value('total') ?? 0;
        $activeEmissions = Emission::count();
        $certifiedCount = Product::where('certified', true)->count();
        $rareCount = Product::whereIn('rarity', ['MUSEUM_PIECE', 'VERY_RARE', 'RARE'])->count();

        return [
            Stat::make('Títulos Catalogados', (string) $totalPieces . ' ejemplares')
                ->description('Obras filatélicas debidamente indexadas')
                ->descriptionIcon('heroicon-m-rectangle-stack')
                ->color('primary'),

            Stat::make('Valoración del Acervo Postal', 'Bs. ' . number_format($catalogValuation, 2, '.', ','))
                ->description('Tasación oficial de la colección soberana')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('amber'),

            Stat::make('Emisiones Conmemorativas', (string) $activeEmissions . ' decretos')
                ->description('Series históricas y de gala activas')
                ->descriptionIcon('heroicon-m-sparkles')
                ->color('success'),

            Stat::make('Certificados de Autenticidad', (string) $certifiedCount . ' sellos')
                ->description('Con peritaje notarial y respaldo oficial')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('info'),

            Stat::make('Piezas Raras / De Museo', (string) $rareCount . ' tesoros')
                ->description('Custodia especial de alta numismática')
                ->descriptionIcon('heroicon-m-trophy')
                ->color('warning'),
        ];
    }
}
