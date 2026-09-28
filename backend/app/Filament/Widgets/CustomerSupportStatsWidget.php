<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Shipment;
use App\Models\SupportTicket;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CustomerSupportStatsWidget extends BaseWidget
{
    protected static bool $isLazy = true;

    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    protected function getStats(): array
    {
        $pendingTickets = SupportTicket::whereIn('status', ['PENDING', 'IN_PROGRESS'])->count();
        $urgentTickets = SupportTicket::where('priority', 'HIGH')->whereIn('status', ['PENDING', 'IN_PROGRESS'])->count();
        $inTransit = Shipment::where('status', 'IN_TRANSIT')->count();
        $recentOrders = Order::whereDate('created_at', '>=', now()->subDays(7))->count();
        $resolvedCount = SupportTicket::where('status', 'RESOLVED')->count();
        $totalTickets = SupportTicket::count();
        $satisfaction = $totalTickets > 0 ? round(($resolvedCount / $totalTickets) * 100) : 100;

        return [
            Stat::make('Casos y Tickets Activos', (string) $pendingTickets . ' casos')
                ->description('Requerimientos de coleccionistas en atención')
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color($pendingTickets > 0 ? 'warning' : 'success'),

            Stat::make('Atenciones de Alta Prioridad', (string) $urgentTickets . ' urgentes')
                ->description('Consultas de peritaje o reclamos críticos')
                ->descriptionIcon('heroicon-m-exclamation-circle')
                ->color($urgentTickets > 0 ? 'danger' : 'gray'),

            Stat::make('Envíos en Tránsito Postal', (string) $inTransit . ' despachos')
                ->description('Paquetes rastreables con número de guía')
                ->descriptionIcon('heroicon-m-truck')
                ->color('primary'),

            Stat::make('Pedidos Nuevos (Últimos 7 días)', (string) $recentOrders . ' compras')
                ->description('Contactos pendientes de confirmación')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('info'),

            Stat::make('Tasa de Resolución', $satisfaction . '%')
                ->description('Respuestas efectivas brindadas')
                ->descriptionIcon('heroicon-m-hand-thumb-up')
                ->color('emerald'),
        ];
    }
}
