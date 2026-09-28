<?php

namespace App\Filament\Resources\Shipments\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ShipmentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Información del Despacho y Valija Postal')
                    ->description('Detalle de expedición y entrega oficial.')
                    ->icon('heroicon-o-truck')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                Select::make('order_id')
                                    ->label('Orden de Colección Asociada')
                                    ->relationship('order', 'order_number')
                                    ->required()
                                    ->searchable()
                                    ->preload(),

                                TextInput::make('tracking_code')
                                    ->label('Número de Guía Oficial')
                                    ->required()
                                    ->placeholder('Ej: BO-CORREOS-LPZ-001'),
                            ]),

                        Grid::make(3)
                            ->schema([
                                TextInput::make('carrier')
                                    ->label('Operador Logístico')
                                    ->default('Agencia Boliviana de Correos')
                                    ->required(),

                                Select::make('status')
                                    ->label('Estado del Envío')
                                    ->options([
                                        'PENDING' => '⏳ Pendiente de Retiro',
                                        'DISPATCHED' => '📦 Despachado de Bóveda',
                                        'IN_TRANSIT' => '🚚 En Tránsito Postal',
                                        'DELIVERED' => '✅ Entregado a Destino',
                                        'RETURNED' => '⚠️ Devuelto / En Custodia',
                                    ])
                                    ->default('PENDING')
                                    ->required(),

                                Select::make('origin_department')
                                    ->label('Departamento de Origen')
                                    ->options([
                                        'La Paz' => 'La Paz (Bóveda Central)',
                                        'Santa Cruz' => 'Santa Cruz',
                                        'Cochabamba' => 'Cochabamba',
                                    ])
                                    ->default('La Paz')
                                    ->required(),
                            ]),

                        Grid::make(2)
                            ->schema([
                                Select::make('destination_department')
                                    ->label('Departamento de Destino')
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
                                    ])
                                    ->required(),

                                DateTimePicker::make('shipped_at')
                                    ->label('Fecha y Hora de Despacho'),
                            ]),

                        Textarea::make('notes')
                            ->label('Observaciones de Custodia y Entrega')
                            ->placeholder('Ej: Precinto inviolable #4920, valija diplomática/postal.')
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
