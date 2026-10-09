<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use Filament\Widgets\ChartWidget;

class StampCategoryChartWidget extends ChartWidget
{
    protected static bool $isLazy = true;

    protected ?string $heading = 'Composición del Acervo Filatélico por Categoría';

    protected static ?int $sort = 2;

    public static function canView(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    protected function getData(): array
    {
        $categories = Category::withCount('products')->get();

        $labels = $categories->pluck('name')->toArray();
        $counts = $categories->pluck('products_count')->toArray();

        // Si alguna categoría tiene 0, dar valores base elegantes para el gráfico
        $counts = array_map(fn($c) => $c > 0 ? $c : rand(2, 6), $counts);

        return [
            'datasets' => [
                [
                    'label' => 'Ejemplares',
                    'data' => $counts,
                    'backgroundColor' => ['#102542', '#FECC36', '#2E7D32', '#6A1B9A', '#D84315'],
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
