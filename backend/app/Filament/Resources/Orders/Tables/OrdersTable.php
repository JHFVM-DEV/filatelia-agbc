<?php

namespace App\Filament\Resources\Orders\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_number')
                    ->label('N° Orden')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('warning')
                    ->weight('bold'),

                TextColumn::make('customer_name')
                    ->label('Coleccionista')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('department')
                    ->label('Destino Postal')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(fn ($record) => "{$record->city} ({$record->department})"),

                TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('BOB')
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('status')
                    ->label('Estado Operativo')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'PENDING' => 'warning',
                        'PAYMENT_VERIFIED' => 'info',
                        'VAULT_PREPARATION' => 'primary',
                        'PACKED_GLASSINE' => 'purple',
                        'SHIPPED' => 'info',
                        'DELIVERED' => 'success',
                        'CANCELLED' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'PENDING' => '⏳ Pendiente Pago',
                        'PAYMENT_VERIFIED' => '💳 Pago Verificado',
                        'VAULT_PREPARATION' => '🏛️ En Bóveda',
                        'PACKED_GLASSINE' => '📦 Empacado Glassine',
                        'SHIPPED' => '🚚 Despachado',
                        'DELIVERED' => '✅ Entregado',
                        'CANCELLED' => '❌ Cancelado',
                        default => $state,
                    }),

                TextColumn::make('payment_method')
                    ->label('Modalidad Pago')
                    ->badge()
                    ->color('gray')
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'QR_TRANSFER' => 'QR Bancario',
                        'BANK_DEPOSIT' => 'Depósito Fiscal',
                        'CREDIT_CARD' => 'Tarjeta Int.',
                        'IN_PERSON_VAULT' => 'Bóveda Central',
                        default => $state,
                    }),

                TextColumn::make('tracking_code')
                    ->label('Guía Postal')
                    ->badge()
                    ->color('info')
                    ->placeholder('Sin despachar')
                    ->searchable(),

                TextColumn::make('created_at')
                    ->label('Fecha de Solicitud')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Estado Operativo')
                    ->options([
                        'PENDING' => 'Pendiente de Pago',
                        'PAYMENT_VERIFIED' => 'Pago Verificado',
                        'VAULT_PREPARATION' => 'En Bóveda (Peritaje)',
                        'PACKED_GLASSINE' => 'Empacado Glassine',
                        'SHIPPED' => 'Despachado en Valija',
                        'DELIVERED' => 'Entregado',
                        'CANCELLED' => 'Cancelado',
                    ]),

                SelectFilter::make('department')
                    ->label('Departamento de Destino')
                    ->options([
                        'La Paz' => 'La Paz',
                        'Santa Cruz' => 'Santa Cruz',
                        'Cochabamba' => 'Cochabamba',
                        'Chuquisaca' => 'Chuquisaca (Sucre)',
                        'Oruro' => 'Oruro',
                        'Potosí' => 'Potosí',
                        'Tarija' => 'Tarija',
                        'Beni' => 'Beni',
                        'Pando' => 'Pando',
                    ]),

                SelectFilter::make('payment_method')
                    ->label('Método de Liquidación')
                    ->options([
                        'QR_TRANSFER' => 'QR Bancario',
                        'BANK_DEPOSIT' => 'Depósito Fiscal',
                        'CREDIT_CARD' => 'Tarjeta Internacional',
                        'IN_PERSON_VAULT' => 'Bóveda Central',
                    ]),
            ])
            ->recordActions([
                Action::make('prepareVault')
                    ->label('Preparar en Bóveda')
                    ->icon('heroicon-o-archive-box')
                    ->color('primary')
                    ->visible(fn ($record) => in_array($record->status, ['PENDING', 'PAYMENT_VERIFIED']))
                    ->requiresConfirmation()
                    ->modalHeading('Iniciar Preparación en Bóveda')
                    ->modalDescription('¿Confirma que se ha retirado el ejemplar de la bóveda para verificación pericial de goma y dentado?')
                    ->action(function ($record) {
                        $record->update(['status' => 'VAULT_PREPARATION']);
                        Notification::make()
                            ->title('Orden en Bóveda')
                            ->body("La orden {$record->order_number} ahora se encuentra en estado de peritaje y empaque.")
                            ->success()
                            ->send();
                    }),

                Action::make('packGlassine')
                    ->label('Empacar Glassine')
                    ->icon('heroicon-o-gift')
                    ->color('purple')
                    ->visible(fn ($record) => $record->status === 'VAULT_PREPARATION')
                    ->requiresConfirmation()
                    ->modalHeading('Confirmar Empaque Neutro Glassine')
                    ->modalDescription('¿Confirma que los sellos han sido colocados en estuches libres de ácido con precinto inviolable de Correos de Bolivia?')
                    ->action(function ($record) {
                        $record->update(['status' => 'PACKED_GLASSINE']);
                        Notification::make()
                            ->title('Piezas Empacadas con Precinto')
                            ->body("La orden {$record->order_number} está lista para valija postal.")
                            ->success()
                            ->send();
                    }),

                Action::make('dispatch')
                    ->label('Despachar')
                    ->icon('heroicon-o-truck')
                    ->color('warning')
                    ->visible(fn ($record) => in_array($record->status, ['VAULT_PREPARATION', 'PACKED_GLASSINE', 'PAYMENT_VERIFIED']))
                    ->form([
                        TextInput::make('tracking_code')
                            ->label('Número de Guía Postal / Valija')
                            ->placeholder('Ej: BO-FIL-9928174-LPZ')
                            ->required()
                            ->default(fn ($record) => $record->tracking_code ?? 'BO-FIL-' . rand(1000000, 9999999) . '-' . strtoupper(substr($record->city, 0, 3))),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update([
                            'status' => 'SHIPPED',
                            'tracking_code' => $data['tracking_code'],
                        ]);
                        Notification::make()
                            ->title('Orden Despachada')
                            ->body("La orden {$record->order_number} ha sido despachada con la guía {$data['tracking_code']}.")
                            ->success()
                            ->send();
                    }),

                Action::make('markDelivered')
                    ->label('Entregado')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->visible(fn ($record) => $record->status === 'SHIPPED')
                    ->requiresConfirmation()
                    ->modalHeading('Confirmar Entrega de Colección')
                    ->modalDescription('¿Confirma que la orden ha sido recibida a entera satisfacción por el coleccionista?')
                    ->action(function ($record) {
                        $record->update(['status' => 'DELIVERED']);
                        Notification::make()
                            ->title('Orden Completada')
                            ->body("La orden {$record->order_number} ha sido marcada como entregada.")
                            ->success()
                            ->send();
                    }),

                Action::make('viewItems')
                    ->label('Ver Piezas')
                    ->icon('heroicon-o-magnifying-glass')
                    ->color('gray')
                    ->modalHeading(fn ($record) => "Piezas en Bóveda — {$record->order_number}")
                    ->modalDescription(function ($record) {
                        $lines = [];
                        foreach ($record->items as $item) {
                            $lines[] = "• {$item->quantity}x {$item->product_name} — Bs. " . number_format($item->subtotal, 2);
                        }
                        return count($lines) > 0 ? implode("\n", $lines) : 'Sin piezas registradas.';
                    })
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Cerrar'),

                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
