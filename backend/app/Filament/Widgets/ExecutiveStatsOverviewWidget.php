<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ExecutiveStatsOverviewWidget extends BaseWidget
{
    protected static bool $isLazy = true;

    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    protected function getStats(): array
    {
        $totalRevenue = Order::whereNotIn('status', ['CANCELLED'])->sum('total_amount');
        $totalOrders = Order::count();
        $avgTicket = $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0;
        $vaultValuation = Product::selectRaw('SUM(price * stock) as total')->value('total') ?? 0;
        $totalUsers = User::count();

        return [
            Stat::make('Recaudación Total Bruta', 'Bs. ' . number_format($totalRevenue, 2, '.', ','))
                ->description('Ingresos por ventas de acervo oficial')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make('Volumen de Pedidos', (string) $totalOrders . ' órdenes')
                ->description('Transacciones postales registradas')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),

            Stat::make('Ticket Promedio', 'Bs. ' . number_format($avgTicket, 2, '.', ','))
                ->description('Gasto medio por coleccionista')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('warning'),

            Stat::make('Tasación Total de Bóveda', 'Bs. ' . number_format($vaultValuation, 2, '.', ','))
                ->description('Activos filatélicos bajo resguardo')
                ->descriptionIcon('heroicon-m-shield-check')
                ->color('amber'),

            Stat::make('Coleccionistas & Usuarios', (string) $totalUsers . ' cuentas')
                ->description('Usuarios en el padrón numismático')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),
        ];
    }
}
