<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identificación de la Orden y Coleccionista')
                    ->description('Datos del comprador y registro de la transacción filatélica.')
                    ->icon('heroicon-o-user-circle')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('order_number')
                                    ->label('Número de Orden')
                                    ->required()
                                    ->readOnly(),
                                Select::make('user_id')
                                    ->label('Cuenta de Coleccionista')
                                    ->relationship('user', 'name')
                                    ->searchable()
                                    ->preload(),
                            ]),
                        Grid::make(3)
                            ->schema([
                                TextInput::make('customer_name')
                                    ->label('Nombre Completo')
                                    ->required(),
                                TextInput::make('customer_email')
                                    ->label('Correo Electrónico')
                                    ->email()
                                    ->required(),
                                TextInput::make('customer_phone')
                                    ->label('Teléfono Móvil')
                                    ->tel(),
                            ]),
                    ]),

                Section::make('Custodia, Despacho y Entrega Segura')
                    ->description('Dirección de entrega y despacho oficial de la orden.')
                    ->icon('heroicon-o-truck')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                Select::make('department')
                                    ->label('Departamento')
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
                                    ])
                                    ->required(),
                                TextInput::make('city')
                                    ->label('Ciudad / Localidad')
                                    ->required(),
                            ]),
                        Textarea::make('shipping_address')
                            ->label('Dirección Completa de Custodia / Entrega')
                            ->rows(2)
                            ->required()
                            ->columnSpanFull(),
                        Grid::make(2)
                            ->schema([
                                TextInput::make('tracking_code')
                                    ->label('Código de Guía / Valija Postal')
                                    ->placeholder('Ej: BO-FIL-9928174-LPZ')
                                    ->helperText('Código emitido por Correos de Bolivia o Courier de seguridad.'),
                                Textarea::make('special_notes')
                                    ->label('Instrucciones Especiales de Conservación')
                                    ->placeholder('Ej: Precinto inviolable, libre de humedad, entrega personal.')
                                    ->rows(2),
                            ]),
                    ]),

                Section::make('Estado de Bóveda & Liquidación Financiera')
                    ->description('Flujo operativo de preparación, empaque glassine y control de pago.')
                    ->icon('heroicon-o-banknotes')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                Select::make('status')
                                    ->label('Estado Operativo del Pedido')
                                    ->options([
                                        'PENDING' => '⏳ Pendiente de Verificación de Pago',
                                        'PAYMENT_VERIFIED' => '💳 Pago Confirmado por Tesorería',
                                        'VAULT_PREPARATION' => '🏛️ En Bóveda (Peritaje y Retiro)',
                                        'PACKED_GLASSINE' => '📦 Empacado Glassine con Precinto',
                                        'SHIPPED' => '🚚 Despachado en Valija Postal',
                                        'DELIVERED' => '✅ Entregado al Coleccionista',
                                        'CANCELLED' => '❌ Cancelado / Reembolsado',
                                    ])
                                    ->default('PENDING')
                                    ->required(),
                                Select::make('payment_method')
                                    ->label('Método de Liquidación')
                                    ->options([
                                        'QR_TRANSFER' => 'Transferencia Bancaria QR',
                                        'BANK_DEPOSIT' => 'Depósito Bancario en Cuenta',
                                        'CREDIT_CARD' => 'Tarjeta de Crédito / Débito',
                                        'IN_PERSON_VAULT' => 'Pago en Bóveda Central',
                                    ])
                                    ->default('QR_TRANSFER')
                                    ->required(),
                                TextInput::make('total_amount')
                                    ->label('Monto Total Liquidado')
                                    ->prefix('Bs.')
                                    ->numeric()
                                    ->required(),
                            ]),
                    ]),
            ]);
    }
}
