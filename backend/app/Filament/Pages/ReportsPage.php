<?php

namespace App\Filament\Pages;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class ReportsPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static ?string $navigationLabel = 'Reportes & Estadísticas';

    protected static ?string $title = 'Informes Oficiales de Recaudación y Tasación Filatélica';

    protected static \UnitEnum|string|null $navigationGroup = 'Reportes & Auditoría';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.reports-page';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    public function getViewData(): array
    {
        $totalRevenue = Order::whereNotIn('status', ['CANCELLED'])->sum('total_amount');
        $totalOrders = Order::count();
        $deliveredOrders = Order::where('status', 'DELIVERED')->count();
        $avgTicket = $totalOrders > 0 ? ($totalRevenue / $totalOrders) : 0;
        $vaultValuation = Product::selectRaw('SUM(price * stock) as total')->value('total') ?? 0;

        $departmentBreakdown = Order::selectRaw('department, COUNT(*) as orders_count, SUM(total_amount) as total_dept')
            ->groupBy('department')
            ->orderBy('total_dept', 'desc')
            ->get();

        $categoryBreakdown = Category::withCount('products')->get()->map(function ($cat) {
            $catVal = Product::where('category_id', $cat->id)->selectRaw('SUM(price * stock) as total')->value('total') ?? 0;
            $catStock = Product::where('category_id', $cat->id)->sum('stock');
            return [
                'name' => $cat->name,
                'pieces_count' => $cat->products_count,
                'stock' => $catStock,
                'valuation' => $catVal,
            ];
        });

        return [
            'totalRevenue' => $totalRevenue,
            'totalOrders' => $totalOrders,
            'deliveredOrders' => $deliveredOrders,
            'avgTicket' => $avgTicket,
            'vaultValuation' => $vaultValuation,
            'departmentBreakdown' => $departmentBreakdown,
            'categoryBreakdown' => $categoryBreakdown,
        ];
    }

    /**
     * Exportar Libro Matriz de Ventas en formato CSV / Excel
     */
    public function exportSalesBook()
    {
        $orders = Order::with('items')->orderBy('id', 'desc')->get();
        $csvFileName = 'Libro_Matriz_Ventas_Filatelia_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM para Excel
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
    }

    /**
     * Exportar Arqueo Físico de Bóveda en formato CSV / Excel
     */
    public function exportVaultInventory()
    {
        $products = Product::with('category')->orderBy('id', 'asc')->get();
        $csvFileName = 'Arqueo_Fisico_Boveda_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($products) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM para Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, ['Cód. Catálogo', 'Ejemplar Filatélico', 'Categoría', 'Año', 'Condición', 'Rareza', 'Certificado', 'Stock en Bóveda', 'Precio Unitario BOB', 'Valoración Total BOB']);

            foreach ($products as $p) {
                $subtotalValuation = $p->price * $p->stock;
                fputcsv($handle, [
                    $p->catalog_code,
                    $p->name,
                    $p->category?->name ?? 'General',
                    $p->year,
                    $p->condition,
                    $p->rarity,
                    $p->certified ? 'SÍ' : 'NO',
                    $p->stock,
                    number_format($p->price, 2, '.', ''),
                    number_format($subtotalValuation, 2, '.', ''),
                ]);
            }
            fclose($handle);
        }, $csvFileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
