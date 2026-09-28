<?php

namespace App\Filament\Resources\Shipments\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ShipmentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('tracking_code')
                    ->label('Guía Postal')
                    ->badge()
                    ->color('info')
                    ->weight('bold')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('order.order_number')
                    ->label('Orden')
                    ->badge()
                    ->color('warning')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('order.customer_name')
                    ->label('Destinatario')
                    ->searchable()
                    ->weight('bold'),

                TextColumn::make('carrier')
                    ->label('Transportista')
                    ->limit(25),

                TextColumn::make('destination_department')
                    ->label('Destino')
                    ->badge()
                    ->color('gray'),

                TextColumn::make('status')
                    ->label('Estado Postal')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'PENDING' => 'warning',
                        'DISPATCHED' => 'primary',
                        'IN_TRANSIT' => 'info',
                        'DELIVERED' => 'success',
                        'RETURNED' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'PENDING' => '⏳ Pendiente',
                        'DISPATCHED' => '📦 Despachado',
                        'IN_TRANSIT' => '🚚 En Tránsito',
                        'DELIVERED' => '✅ Entregado',
                        'RETURNED' => '⚠️ Retornado',
                        default => $state,
                    }),

                TextColumn::make('shipped_at')
                    ->label('Fecha Despacho')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Estado')
                    ->options([
                        'PENDING' => 'Pendiente',
                        'DISPATCHED' => 'Despachado',
                        'IN_TRANSIT' => 'En Tránsito',
                        'DELIVERED' => 'Entregado',
                        'RETURNED' => 'Devuelto',
                    ]),

                SelectFilter::make('destination_department')
                    ->label('Destino')
                    ->options([
                        'La Paz' => 'La Paz',
                        'Santa Cruz' => 'Santa Cruz',
                        'Cochabamba' => 'Cochabamba',
                        'Chuquisaca' => 'Chuquisaca',
                        'Oruro' => 'Oruro',
                        'Potosí' => 'Potosí',
                        'Tarija' => 'Tarija',
                        'Beni' => 'Beni',
                        'Pando' => 'Pando',
                    ]),
            ])
            ->recordActions([
                Action::make('markDelivered')
                    ->label('Entregado')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->visible(fn ($record) => in_array($record->status, ['DISPATCHED', 'IN_TRANSIT']))
                    ->requiresConfirmation()
                    ->modalHeading('Confirmar Entrega Postal')
                    ->action(function ($record) {
                        $record->update([
                            'status' => 'DELIVERED',
                            'delivered_at' => now(),
                        ]);
                        if ($record->order) {
                            $record->order->update(['status' => 'DELIVERED']);
                        }
                        Notification::make()
                            ->title('Envío Marcado como Entregado')
                            ->success()
                            ->send();
                    }),

                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
