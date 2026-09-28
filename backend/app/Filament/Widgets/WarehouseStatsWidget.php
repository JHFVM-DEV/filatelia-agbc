<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class WarehouseStatsWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return false;
    }

    protected function getStats(): array
    {
        $totalPieces = Product::count();
        $totalUnits = Product::sum('stock');
        $lowStockCount = Product::where('stock', '<=', 2)->count();
        $pendingOrders = Order::whereIn('status', ['PENDING', 'PAYMENT_VERIFIED', 'VAULT_PREPARATION', 'PACKED_GLASSINE'])->count();
        
        $totalInventoryValue = Product::selectRaw('SUM(price * stock) as total')->value('total') ?? 0;

        return [
            Stat::make('Piezas Catalogadas', (string) $totalPieces)
                ->description('Ejemplares únicos registrados')
                ->descriptionIcon('heroicon-m-rectangle-stack')
                ->color('primary'),

            Stat::make('Unidades en Bóveda', number_format($totalUnits, 0) . ' unid.')
                ->description('Existencias físicas bajo custodia')
                ->descriptionIcon('heroicon-m-archive-box')
                ->color('success'),

            Stat::make('Alertas de Stock Crítico', (string) $lowStockCount)
                ->description($lowStockCount > 0 ? 'Ejemplares con stock ≤ 2 o agotados' : 'Niveles óptimos de stock')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($lowStockCount > 0 ? 'danger' : 'gray'),

            Stat::make('Órdenes por Preparar/Despachar', (string) $pendingOrders)
                ->description('Requerimientos en bóveda postal')
                ->descriptionIcon('heroicon-m-truck')
                ->color($pendingOrders > 0 ? 'warning' : 'success'),

            Stat::make('Valoración Total en Bóveda', 'Bs. ' . number_format($totalInventoryValue, 2, '.', ','))
                ->description('Tasación oficial de activos filatélicos')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('amber'),
        ];
    }
}
