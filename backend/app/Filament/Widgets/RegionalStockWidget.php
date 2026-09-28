<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;

class RegionalStockWidget extends ChartWidget
{
    protected static bool $isLazy = true;

    protected ?string $heading = 'Existencias Distribuidas en Bóvedas Departamentales';

    protected static ?int $sort = 2;

    public static function canView(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    protected function getData(): array
    {
        $regions = [
            'Bóveda Central La Paz' => 45,
            'Regional Santa Cruz' => 28,
            'Regional Cochabamba' => 20,
            'Sucursal Sucre' => 14,
            'Sucursal Tarija' => 10,
            'Sucursal Oruro' => 8,
            'Sucursal Potosí' => 6,
            'Sucursal Beni' => 5,
            'Sucursal Pando' => 4,
        ];

        return [
            'datasets' => [
                [
                    'label' => 'Unidades Custodiadas',
                    'data' => array_values($regions),
                    'backgroundColor' => '#002B5B',
                    'borderColor' => '#F4C400',
                    'borderWidth' => 1,
                ],
            ],
            'labels' => array_keys($regions),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
