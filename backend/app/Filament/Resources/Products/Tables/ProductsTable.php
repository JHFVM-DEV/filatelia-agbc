<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('front_image')
                    ->label('Pieza')
                    ->square()
                    ->defaultImageUrl('/images/cat-classic.jpg'),

                TextColumn::make('catalog_code')
                    ->label('Cód. Catálogo')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('warning')
                    ->weight('bold'),

                TextColumn::make('name')
                    ->label('Ejemplar Filatélico')
                    ->searchable()
                    ->sortable()
                    ->limit(35)
                    ->weight('bold'),

                TextColumn::make('category.name')
                    ->label('Categoría')
                    ->badge()
                    ->color('gray'),

                TextColumn::make('price')
                    ->label('Cotización')
                    ->money('BOB')
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('stock')
                    ->label('Stock Bóveda')
                    ->numeric()
                    ->sortable()
                    ->badge()
                    ->color(fn ($state) => match (true) {
                        $state <= 0 => 'danger',
                        $state <= 2 => 'warning',
                        default => 'success',
                    })
                    ->formatStateUsing(fn ($state) => match (true) {
                        $state <= 0 => '0 (Agotado)',
                        $state <= 2 => "{$state} (Crítico)",
                        default => "{$state} unid.",
                    }),

                TextColumn::make('condition')
                    ->label('Condición')
                    ->badge()
                    ->color('info'),

                TextColumn::make('rarity')
                    ->label('Rareza')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'MUSEUM_PIECE' => 'warning',
                        'VERY_RARE' => 'primary',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'MUSEUM_PIECE' => '👑 Museo',
                        'VERY_RARE' => '💎 Muy Rara',
                        'RARE' => '⭐ Rara',
                        'SCARCE' => 'Escasa',
                        default => 'Común',
                    }),

                IconColumn::make('certified')
                    ->label('Certif.')
                    ->boolean(),

                ToggleColumn::make('is_active')
                    ->label('Activo'),

                TextColumn::make('vault_drawer')
                    ->label('Gaveta Bóveda')
                    ->badge()
                    ->color('info')
                    ->searchable(),

                TextColumn::make('year')
                    ->label('Año')
                    ->numeric()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Ingreso a Bóveda')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category_id')
                    ->label('Categoría Filatélica')
                    ->relationship('category', 'name'),

                SelectFilter::make('condition')
                    ->label('Estado de Conservación')
                    ->options([
                        'MINT_NH' => 'MINT NH (Goma Intacta)',
                        'MINT_LH' => 'MINT LH (Rastro Charnela)',
                        'FDC' => 'FDC (Sobre Primer Día)',
                        'USED' => 'USED (Matasellado)',
                    ]),

                SelectFilter::make('rarity')
                    ->label('Nivel de Rareza')
                    ->options([
                        'MUSEUM_PIECE' => 'Pieza de Museo',
                        'VERY_RARE' => 'Muy Rara',
                        'RARE' => 'Rara',
                        'SCARCE' => 'Escasa',
                        'COMMON' => 'Común',
                    ]),

                TernaryFilter::make('certified')
                    ->label('Certificado de Autenticidad'),

                TernaryFilter::make('is_active')
                    ->label('Visible en Vitrina Pública'),
            ])
            ->recordActions([
                Action::make('adjustStock')
                    ->label('Ajustar Stock')
                    ->icon('heroicon-o-archive-box-arrow-down')
                    ->color('warning')
                    ->form([
                        TextInput::make('stock')
                            ->label('Nueva Cantidad Física en Bóveda')
                            ->numeric()
                            ->minValue(0)
                            ->required()
                            ->default(fn ($record) => $record->stock),
                        TextInput::make('reason')
                            ->label('Motivo del Ajuste de Inventario')
                            ->placeholder('Ej: Ingreso de nueva emisión, arqueo pericial, reclasificación')
                            ->required(),
                    ])
                    ->action(function ($record, array $data) {
                        $old = $record->stock;
                        $record->update(['stock' => $data['stock']]);
                        Notification::make()
                            ->title('Inventario de Bóveda Actualizado')
                            ->body("El stock de '{$record->name}' pasó de {$old} a {$data['stock']} unidades. Motivo: {$data['reason']}")
                            ->success()
                            ->send();
                    }),

                Action::make('printQrTag')
                    ->label('Ficha QR')
                    ->icon('heroicon-o-qr-code')
                    ->color('info')
                    ->url(fn ($record) => "http://localhost:3000/admin/fichas-almacen?search=" . urlencode($record->catalog_code))
                    ->openUrlInNewTab(),

                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
