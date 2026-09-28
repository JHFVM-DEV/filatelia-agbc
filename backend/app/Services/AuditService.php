<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\PriceRevaluation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class AuditService
{
    /**
     * Registrar una entrada general en la bitácora de auditoría
     */
    public static function log(
        string $action,
        ?string $modelType = null,
        ?int $modelId = null,
        ?string $modelName = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        string $summary = '',
        ?string $rationale = null,
        ?User $user = null
    ): AuditLog {
        $currentUser = $user ?? auth()->user();
        $userName = $currentUser ? $currentUser->name : 'Sistema Automático';
        $userRole = $currentUser && method_exists($currentUser, 'getRoleNames') 
            ? ($currentUser->getRoleNames()->first() ?? 'USUARIO') 
            : 'SISTEMA';

        return AuditLog::create([
            'user_id' => $currentUser?->id,
            'user_name' => $userName,
            'user_role' => $userRole,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'model_name' => $modelName,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'change_summary' => $summary,
            'rationale' => $rationale,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'Sistema Filatelia Core',
        ]);
    }

    /**
     * Ejecutar y registrar una revalorización oficial de cotización filatélica
     */
    public static function revaluePrice(
        Product $product,
        float $newPrice,
        string $reason,
        ?string $notes = null,
        ?User $user = null
    ): PriceRevaluation {
        $currentUser = $user ?? auth()->user();
        $userName = $currentUser ? $currentUser->name : 'Super Administrador (Peritaje)';
        $prevPrice = (float) $product->price;
        $stock = (int) $product->stock;

        // Calcular variación porcentual y plusvalía generada en bóveda
        $pctChange = $prevPrice > 0 ? (($newPrice - $prevPrice) / $prevPrice) * 100 : 0;
        $vaultGain = ($newPrice - $prevPrice) * $stock;

        // Actualizar precio en la pieza filatélica
        $product->update(['price' => $newPrice]);

        // Registrar en historial de revalorizaciones
        $reval = PriceRevaluation::create([
            'product_id' => $product->id,
            'user_id' => $currentUser?->id,
            'user_name' => $userName,
            'previous_price' => $prevPrice,
            'new_price' => $newPrice,
            'percentage_change' => $pctChange,
            'stock_at_revaluation' => $stock,
            'vault_gain' => $vaultGain,
            'reason' => $reason,
            'notes' => $notes,
        ]);

        // Registrar en Audit Log
        $sign = $pctChange >= 0 ? '+' : '';
        $summary = sprintf(
            "Revalorización de cotización para [%s]: Bs. %.2f -> Bs. %.2f (%s%.2f%%). Plusvalía en bóveda (%d piezas): Bs. %.2f",
            $product->catalog_code,
            $prevPrice,
            $newPrice,
            $sign,
            $pctChange,
            $stock,
            $vaultGain
        );

        self::log(
            action: 'PRICE_REVALUATION',
            modelType: Product::class,
            modelId: $product->id,
            modelName: $product->name,
            oldValues: ['price' => $prevPrice],
            newValues: ['price' => $newPrice, 'vault_gain' => $vaultGain],
            summary: $summary,
            rationale: $reason . ($notes ? " - {$notes}" : ''),
            user: $currentUser
        );

        // Limpiar caché pública del catálogo
        Cache::forget('public_catalog_default');
        Cache::flush();

        return $reval;
    }

    /**
     * Registrar ajuste de stock físico / bóveda
     */
    public static function logStockAdjustment(
        Product $product,
        int $previousStock,
        int $newStock,
        string $type,
        string $reason,
        ?User $user = null
    ): AuditLog {
        $diff = $newStock - $previousStock;
        $sign = $diff >= 0 ? "+{$diff}" : "{$diff}";
        $summary = sprintf(
            "Ajuste de inventario en bóveda para [%s]: %d -> %d piezas (%s). Tipo: %s",
            $product->catalog_code,
            $previousStock,
            $newStock,
            $sign,
            $type
        );

        return self::log(
            action: 'STOCK_ADJUSTMENT',
            modelType: Product::class,
            modelId: $product->id,
            modelName: $product->name,
            oldValues: ['stock' => $previousStock],
            newValues: ['stock' => $newStock, 'diff' => $diff],
            summary: $summary,
            rationale: $reason,
            user: $user
        );
    }

    /**
     * Registrar cambio de estado en pedidos y despacho
     */
    public static function logOrderStatus(
        Order $order,
        string $previousStatus,
        string $newStatus,
        ?string $notes = null,
        ?User $user = null
    ): AuditLog {
        $summary = sprintf(
            "Transición de estado de orden [%s]: %s -> %s (Total: Bs. %.2f)",
            $order->order_number,
            $previousStatus,
            $newStatus,
            $order->total_amount
        );

        return self::log(
            action: 'ORDER_STATUS_CHANGED',
            modelType: Order::class,
            modelId: $order->id,
            modelName: $order->order_number,
            oldValues: ['status' => $previousStatus],
            newValues: ['status' => $newStatus],
            summary: $summary,
            rationale: $notes,
            user: $user
        );
    }
}
