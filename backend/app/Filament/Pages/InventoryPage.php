<?php

namespace App\Filament\Pages;

use App\Models\InventoryMovement;
use App\Models\Product;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class InventoryPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static ?string $navigationLabel = 'Inventario & Bóveda';

    protected static ?string $title = 'Control de Inventario y Movimientos de Bóveda';

    protected static \UnitEnum|string|null $navigationGroup = 'Bóveda & Logística';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.inventory-page';

    public $adjustProductId;
    public $adjustType = 'IN';
    public $adjustQuantity = 1;
    public $adjustReason = '';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    public function adjustStock(): void
    {
        $this->validate([
            'adjustProductId' => 'required|exists:products,id',
            'adjustType' => 'required|in:IN,OUT,ADJUST',
            'adjustQuantity' => 'required|integer|min:1',
            'adjustReason' => 'required|string|min:3',
        ]);

        $product = Product::findOrFail($this->adjustProductId);
        $prev = $product->stock;
        $qty = (int) $this->adjustQuantity;

        if ($this->adjustType === 'IN') {
            $new = $prev + $qty;
        } elseif ($this->adjustType === 'OUT') {
            $new = max(0, $prev - $qty);
        } else {
            $new = $qty;
        }

        $product->update(['stock' => $new]);

        InventoryMovement::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'type' => $this->adjustType,
            'quantity' => $qty,
            'previous_stock' => $prev,
            'new_stock' => $new,
            'department' => 'La Paz (Bóveda Central)',
            'reason' => $this->adjustReason,
            'notes' => 'Ajuste manual ejecutado desde el panel de control.',
        ]);

        $this->reset(['adjustProductId', 'adjustQuantity', 'adjustReason']);

        Notification::make()
            ->title('Stock Actualizado')
            ->body("El stock de '{$product->name}' fue actualizado a {$new} unidades.")
            ->success()
            ->send();
    }

    public function getViewData(): array
    {
        $products = Product::with('category', 'emission')->orderBy('stock', 'asc')->get();
        $movements = InventoryMovement::with('product', 'user')->latest()->limit(15)->get();
        $totalUnits = $products->sum('stock');
        $lowStockCount = $products->where('stock', '<=', 2)->count();
        $totalValuation = $products->sum(fn ($p) => $p->price * $p->stock);

        return [
            'products' => $products,
            'movements' => $movements,
            'totalUnits' => $totalUnits,
            'lowStockCount' => $lowStockCount,
            'totalValuation' => $totalValuation,
        ];
    }
}
