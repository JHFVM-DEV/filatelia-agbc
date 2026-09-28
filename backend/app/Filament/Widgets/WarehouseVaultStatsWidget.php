<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\Shipment;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class WarehouseVaultStatsWidget extends BaseWidget
{
    protected static bool $isLazy = true;

    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    protected function getStats(): array
    {
        $totalUnits = Product::sum('stock');
        $pendingPacking = Order::whereIn('status', ['PENDING', 'VAULT_PREPARATION', 'PACKED_GLASSINE'])->count();
        $inTransit = Shipment::where('status', 'IN_TRANSIT')->count();
        $criticalStock = Product::where('stock', '<=', 2)->count();
        $delivered = Shipment::where('status', 'DELIVERED')->count();
        $totalShipments = Shipment::count();
        $successRate = $totalShipments > 0 ? round(($delivered / $totalShipments) * 100) : 98;

        return [
            Stat::make('Unidades en Bóveda Física', number_format($totalUnits, 0) . ' unid.')
                ->description('Existencias físicas bajo llave y custodia')
                ->descriptionIcon('heroicon-m-archive-box')
                ->color('success'),

            Stat::make('Cola de Preparación & Embalaje', (string) $pendingPacking . ' pedidos')
                ->description('Órdenes requiriendo sobre glassine')
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingPacking > 0 ? 'warning' : 'gray'),

            Stat::make('Valijas en Tránsito Postal', (string) $inTransit . ' despachos')
                ->description('En ruta a oficinas departamentales')
                ->descriptionIcon('heroicon-m-truck')
                ->color('primary'),

            Stat::make('Alertas de Stock Crítico', (string) $criticalStock . ' piezas')
                ->description('Sellos con existencia ≤ 2 o agotándose')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($criticalStock > 0 ? 'danger' : 'success'),

            Stat::make('Efectividad de Entrega', $successRate . '%')
                ->description('Guías postales entregadas sin incidencias')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('emerald'),
        ];
    }
}
