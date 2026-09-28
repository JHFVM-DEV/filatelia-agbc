<?php

namespace App\Filament\Pages;

use App\Models\AuditLog;
use App\Models\PriceRevaluation;
use App\Models\Product;
use App\Services\AuditService;
use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class AuditLogPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    protected static ?string $navigationLabel = 'Auditoría & Revalorizaciones';

    protected static ?string $title = 'Auditoría Integral y Revalorización de Precios Filatélicos';

    protected static \UnitEnum|string|null $navigationGroup = 'Reportes & Auditoría';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.audit-log-page';

    public string $activeTab = 'audit'; // 'audit' o 'revaluations'
    public string $actionFilter = 'ALL';
    public string $searchQuery = '';

    // Formulario de Revalorización Oficial
    public $revalProductId = '';
    public $revalNewPrice = '';
    public $revalReason = 'Actualización según Catálogo Internacional Scott / Yvert 2026';
    public $revalNotes = '';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    public function setTab(string $tab): void
    {
        $this->activeTab = $tab;
    }

    public function executeRevaluation(): void
    {
        $this->validate([
            'revalProductId' => 'required|exists:products,id',
            'revalNewPrice' => 'required|numeric|min:0.01',
            'revalReason' => 'required|string|min:4',
            'revalNotes' => 'nullable|string',
        ]);

        $product = Product::findOrFail($this->revalProductId);
        $newPrice = (float) $this->revalNewPrice;
        $prevPrice = (float) $product->price;

        if (abs($newPrice - $prevPrice) < 0.001) {
            Notification::make()
                ->title('Precio sin cambios')
                ->body('El nuevo precio debe ser diferente a la cotización actual.')
                ->warning()
                ->send();
            return;
        }

        $reval = AuditService::revaluePrice(
            product: $product,
            newPrice: $newPrice,
            reason: $this->revalReason,
            notes: $this->revalNotes,
            user: auth()->user()
        );

        $sign = $reval->percentage_change >= 0 ? '+' : '';
        $gainFormatted = number_format((float) $reval->vault_gain, 2);

        Notification::make()
            ->title('Revalorización Filatélica Completada')
            ->body("Sello '{$product->name}' revalorizado a Bs. {$newPrice} ({$sign}{$reval->percentage_change}%). Plusvalía en custodia: +Bs. {$gainFormatted}.")
            ->success()
            ->send();

        $this->reset(['revalProductId', 'revalNewPrice', 'revalNotes']);
        $this->activeTab = 'revaluations';
    }

    public function getViewData(): array
    {
        // 1. Logs de Auditoría
        $logsQuery = AuditLog::with('user')->latest();

        if ($this->actionFilter !== 'ALL') {
            $logsQuery->where('action', $this->actionFilter);
        }

        if (trim($this->searchQuery) !== '') {
            $term = '%' . trim($this->searchQuery) . '%';
            $logsQuery->where(function ($q) use ($term) {
                $q->where('model_name', 'like', $term)
                  ->orWhere('change_summary', 'like', $term)
                  ->orWhere('user_name', 'like', $term)
                  ->orWhere('rationale', 'like', $term);
            });
        }

        $logs = $logsQuery->limit(50)->get();

        // 2. Historial de Revalorizaciones
        $revaluations = PriceRevaluation::with('product', 'user')
            ->latest()
            ->limit(30)
            ->get();

        // 3. Métricas Ejecutivas
        $totalLogs = AuditLog::count();
        $totalRevaluations = PriceRevaluation::count();
        $totalVaultGain = (float) (PriceRevaluation::sum('vault_gain') ?? 0);
        $totalStockAdjustments = AuditLog::where('action', 'STOCK_ADJUSTMENT')->count();

        // Catálogo de productos para el selector de revalorización
        $products = Product::orderBy('name')->get();

        return [
            'logs' => $logs,
            'revaluations' => $revaluations,
            'totalLogs' => $totalLogs,
            'totalRevaluations' => $totalRevaluations,
            'totalVaultGain' => $totalVaultGain,
            'totalStockAdjustments' => $totalStockAdjustments,
            'products' => $products,
        ];
    }
}
