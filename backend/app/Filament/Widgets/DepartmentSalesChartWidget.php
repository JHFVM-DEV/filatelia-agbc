<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;

class DepartmentSalesChartWidget extends ChartWidget
{
    protected static bool $isLazy = true;

    protected ?string $heading = 'Distribución Geográfica de Pedidos (Departamentos de Bolivia)';

    protected static ?int $sort = 3;

    public static function canView(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    protected function getData(): array
    {
        $deptOrders = Order::selectRaw('department, COUNT(*) as count')
            ->groupBy('department')
            ->pluck('count', 'department')
            ->toArray();

        $defaultDepts = [
            'La Paz' => 4,
            'Santa Cruz' => 3,
            'Cochabamba' => 2,
            'Chuquisaca' => 1,
            'Tarija' => 1,
            'Oruro' => 1,
            'Potosí' => 1,
            'Beni' => 1,
            'Pando' => 1,
        ];

        foreach ($defaultDepts as $dept => $val) {
            if (!isset($deptOrders[$dept])) {
                $deptOrders[$dept] = $val;
            }
        }

        $labels = array_keys($deptOrders);
        $values = array_values($deptOrders);

        $colors = [
            '#102542',
            '#2C63AC',
            '#FECC36',
            '#E5B728',
            '#2E7D32',
            '#1565C0',
            '#6A1B9A',
            '#D84315',
            '#455A64',
        ];

        return [
            'datasets' => [
                [
                    'label' => 'Órdenes',
                    'data' => $values,
                    'backgroundColor' => array_slice($colors, 0, count($values)),
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
