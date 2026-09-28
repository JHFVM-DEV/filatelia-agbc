<?php

namespace App\Filament\Resources\Orders\Pages;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOrders extends ListRecords
{
    protected static string $resource = OrderResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('exportSalesBook')
                ->label('Descargar Libro Matriz')
                ->icon('heroicon-o-arrow-down-tray')
                ->color('warning')
                ->action(function () {
                    $orders = Order::with('items')->orderBy('id', 'desc')->get();
                    $csvFileName = 'Libro_Matriz_Ventas_Filatelia_' . date('Y-m-d') . '.csv';

                    return response()->streamDownload(function () use ($orders) {
                        $handle = fopen('php://output', 'w');
                        fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
                        fputcsv($handle, ['N° Orden', 'Fecha', 'Coleccionista', 'Email', 'Teléfono', 'Destino', 'Método Pago', 'Estado', 'Total BOB', 'Piezas Amparadas']);

                        foreach ($orders as $order) {
                            $itemsSummary = $order->items->map(fn ($i) => "{$i->quantity}x {$i->product_name}")->join('; ');
                            fputcsv($handle, [
                                $order->order_number,
                                $order->created_at ? $order->created_at->format('d/m/Y H:i') : 'N/A',
                                $order->customer_name,
                                $order->customer_email,
                                $order->customer_phone ?? 'N/A',
                                "{$order->city} ({$order->department})",
                                $order->payment_method,
                                $order->status,
                                number_format($order->total_amount, 2, '.', ''),
                                $itemsSummary,
                            ]);
                        }
                        fclose($handle);
                    }, $csvFileName, [
                        'Content-Type' => 'text/csv; charset=UTF-8',
                    ]);
                }),

            CreateAction::make(),
        ];
    }
}
