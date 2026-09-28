<?php

namespace App\Filament\Resources\SupportTickets\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SupportTicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('ticket_code')
                    ->label('N° Ticket')
                    ->badge()
                    ->color('primary')
                    ->weight('bold')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('customer_name')
                    ->label('Coleccionista')
                    ->searchable()
                    ->weight('bold'),

                TextColumn::make('subject')
                    ->label('Asunto')
                    ->limit(35)
                    ->searchable(),

                TextColumn::make('priority')
                    ->label('Prioridad')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'LOW' => 'gray',
                        'NORMAL' => 'info',
                        'HIGH' => 'warning',
                        'URGENT' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'LOW' => 'Baja',
                        'NORMAL' => 'Normal',
                        'HIGH' => 'Alta',
                        'URGENT' => '🚨 Urgente',
                        default => $state,
                    }),

                TextColumn::make('status')
                    ->label('Estado')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'PENDING' => 'warning',
                        'IN_PROGRESS' => 'primary',
                        'RESOLVED' => 'success',
                        'CLOSED' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'PENDING' => '⏳ Pendiente',
                        'IN_PROGRESS' => '🔍 En Análisis',
                        'RESOLVED' => '✅ Resuelto',
                        'CLOSED' => 'Cerrado',
                        default => $state,
                    }),

                TextColumn::make('order.order_number')
                    ->label('Orden')
                    ->badge()
                    ->color('gray')
                    ->placeholder('Sin orden'),

                TextColumn::make('created_at')
                    ->label('Fecha')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('priority')
                    ->label('Prioridad')
                    ->options([
                        'LOW' => 'Baja',
                        'NORMAL' => 'Normal',
                        'HIGH' => 'Alta',
                        'URGENT' => 'Urgente',
                    ]),

                SelectFilter::make('status')
                    ->label('Estado')
                    ->options([
                        'PENDING' => 'Pendiente',
                        'IN_PROGRESS' => 'En Análisis',
                        'RESOLVED' => 'Resuelto',
                        'CLOSED' => 'Cerrado',
                    ]),
            ])
            ->recordActions([
                Action::make('resolve')
                    ->label('Resolver')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => in_array($record->status, ['PENDING', 'IN_PROGRESS']))
                    ->requiresConfirmation()
                    ->modalHeading('Marcar Caso como Resuelto')
                    ->action(function ($record) {
                        $record->update(['status' => 'RESOLVED']);
                        Notification::make()
                            ->title('Ticket Resuelto')
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
