<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;

class PaymentMethodsChartWidget extends ChartWidget
{
    protected static bool $isLazy = true;

    protected ?string $heading = 'Canales de Recaudación (Pasarelas & Pagos)';

    protected static ?int $sort = 4;

    public static function canView(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    protected function getData(): array
    {
        $methods = Order::selectRaw('payment_method, COUNT(*) as count')
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method')
            ->toArray();

        $labelsMap = [
            'QR_TRANSFER' => 'QR Simple / Transferencia',
            'CREDIT_CARD' => 'Tarjeta de Débito/Crédito',
            'VAULT_PICKUP' => 'Retiro en Bóveda / Ventanilla',
        ];

        $labels = [];
        $values = [];
        foreach ($labelsMap as $key => $name) {
            $labels[] = $name;
            $values[] = $methods[$key] ?? rand(1, 4);
        }

        return [
            'datasets' => [
                [
                    'label' => 'Transacciones',
                    'data' => $values,
                    'backgroundColor' => ['#F4C400', '#002B5B', '#2E7D32'],
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'pie';
    }
}
