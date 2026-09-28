<?php

namespace App\Filament\Pages;

use App\Models\Order;
use App\Models\Shipment;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class DispatchPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCube;

    protected static ?string $navigationLabel = 'Mesa de Despacho';

    protected static ?string $title = 'Mesa de Operaciones de Despacho y Valija Postal';

    protected static \UnitEnum|string|null $navigationGroup = 'Bóveda & Logística';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.dispatch-page';

    public $dispatchOrderId;
    public $dispatchCarrier = 'Agencia Boliviana de Correos - Valija Postal';
    public $dispatchTrackingCode = '';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    public function markAsGlassine(int $orderId): void
    {
        $order = Order::findOrFail($orderId);
        $order->update(['status' => 'PACKED_GLASSINE']);

        Notification::make()
            ->title('Empaque Glassine Completado')
            ->body("La orden {$order->order_number} fue marcada como empacada en estuche libre de ácido con precinto.")
            ->success()
            ->send();
    }

    public function confirmDispatch(): void
    {
        $this->validate([
            'dispatchOrderId' => 'required|exists:orders,id',
            'dispatchCarrier' => 'required|string',
            'dispatchTrackingCode' => 'required|string|min:4',
        ]);

        $order = Order::findOrFail($this->dispatchOrderId);
        $order->update([
            'status' => 'SHIPPED',
            'tracking_code' => $this->dispatchTrackingCode,
        ]);

        Shipment::create([
            'order_id' => $order->id,
            'carrier' => $this->dispatchCarrier,
            'tracking_code' => $this->dispatchTrackingCode,
            'status' => 'IN_TRANSIT',
            'origin_department' => 'La Paz',
            'destination_department' => $order->department,
            'shipped_at' => now(),
            'notes' => 'Despachado desde la mesa de operaciones postales.',
        ]);

        $this->reset(['dispatchOrderId', 'dispatchTrackingCode']);

        Notification::make()
            ->title('Orden Despachada Exitosamente')
            ->body("Se generó el envío postal y la guía oficial {$order->tracking_code}.")
            ->success()
            ->send();
    }

    public function getViewData(): array
    {
        $queueOrders = Order::with('items')
            ->whereIn('status', ['PENDING', 'PAYMENT_VERIFIED', 'VAULT_PREPARATION', 'PACKED_GLASSINE'])
            ->orderBy('created_at', 'asc')
            ->get();

        $dispatchedToday = Order::where('status', 'SHIPPED')
            ->whereDate('updated_at', today())
            ->count();

        return [
            'queueOrders' => $queueOrders,
            'dispatchedToday' => $dispatchedToday,
        ];
    }
}
