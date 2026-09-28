<?php

namespace App\Filament\Resources\SupportTickets\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SupportTicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Detalle del Caso y Solicitante')
                    ->description('Información del coleccionista y motivo de la consulta o reclamo.')
                    ->icon('heroicon-o-chat-bubble-bottom-center-text')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('ticket_code')
                                    ->label('Código de Ticket')
                                    ->default(fn () => 'TCK-' . date('Y') . '-' . rand(100, 999))
                                    ->required()
                                    ->readOnly(),

                                Select::make('order_id')
                                    ->label('Orden Relacionada (Opcional)')
                                    ->relationship('order', 'order_number')
                                    ->searchable()
                                    ->preload(),
                            ]),

                        Grid::make(3)
                            ->schema([
                                TextInput::make('customer_name')
                                    ->label('Nombre del Coleccionista')
                                    ->required(),

                                TextInput::make('customer_email')
                                    ->label('Correo Electrónico')
                                    ->email()
                                    ->required(),

                                TextInput::make('customer_phone')
                                    ->label('Teléfono / WhatsApp'),
                            ]),

                        TextInput::make('subject')
                            ->label('Asunto del Requerimiento')
                            ->required()
                            ->columnSpanFull(),

                        Textarea::make('message')
                            ->label('Mensaje / Consulta Detallada')
                            ->rows(4)
                            ->required()
                            ->columnSpanFull(),
                    ]),

                Section::make('Gestión y Resolución Operativa')
                    ->description('Estado del caso, nivel de urgencia y notas del oficial asignado.')
                    ->icon('heroicon-o-shield-check')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                Select::make('priority')
                                    ->label('Prioridad')
                                    ->options([
                                        'LOW' => 'Baja (Informativa)',
                                        'NORMAL' => 'Normal (Consulta general)',
                                        'HIGH' => 'Alta (Peritaje / Envío)',
                                        'URGENT' => 'Urgente (Reclamo crítico)',
                                    ])
                                    ->default('NORMAL')
                                    ->required(),

                                Select::make('status')
                                    ->label('Estado del Ticket')
                                    ->options([
                                        'PENDING' => '⏳ Pendiente de Revisión',
                                        'IN_PROGRESS' => '🔍 En Análisis',
                                        'RESOLVED' => '✅ Resuelto y Notificado',
                                        'CLOSED' => '📁 Cerrado',
                                    ])
                                    ->default('PENDING')
                                    ->required(),

                                Select::make('assigned_user_id')
                                    ->label('Oficial Asignado')
                                    ->relationship('assignedUser', 'name')
                                    ->searchable()
                                    ->preload(),
                            ]),

                        Textarea::make('resolution_notes')
                            ->label('Notas de Resolución Oficial')
                            ->placeholder('Detalle de la respuesta o peritaje brindado al cliente.')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
