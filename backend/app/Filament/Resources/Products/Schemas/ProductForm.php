<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Ficha Filatélica Oficial')
                    ->description('Identificación histórica y catalogación de la pieza según los estándares internacionales.')
                    ->icon('heroicon-o-document-magnifying-glass')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nombre del Ejemplar')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('Ej: Tríptico Arte Sacro — Navidad 2007'),
                                TextInput::make('slug')
                                    ->label('Identificador URL (Slug)')
                                    ->required()
                                    ->maxLength(255),
                            ]),
                        Grid::make(3)
                            ->schema([
                                TextInput::make('catalog_code')
                                    ->label('Código de Catálogo (Scott/Yvert)')
                                    ->placeholder('Ej: BO-2007-NAV-TRIP')
                                    ->required(),
                                Select::make('category_id')
                                    ->label('Categoría Filatélica')
                                    ->relationship('category', 'name')
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                                Select::make('emission_id')
                                    ->label('Emisión Conmemorativa')
                                    ->relationship('emission', 'name')
                                    ->searchable()
                                    ->preload(),
                            ]),
                        Grid::make(3)
                            ->schema([
                                TextInput::make('year')
                                    ->label('Año de Emisión')
                                    ->numeric()
                                    ->minValue(1800)
                                    ->maxValue(2030)
                                    ->required(),
                                TextInput::make('country')
                                    ->label('País Emisor')
                                    ->default('Bolivia')
                                    ->required(),
                                TextInput::make('face_value')
                                    ->label('Valor Facial Histórico')
                                    ->placeholder('Ej: 10 Centavos / 5 Pesos'),
                            ]),
                    ]),

                Section::make('Control de Bóveda & Tasación')
                    ->description('Gestión de existencias físicas, precio oficial y parámetros de custodia.')
                    ->icon('heroicon-o-archive-box')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('stock')
                                    ->label('Unidades Físicas en Bóveda')
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(1)
                                    ->required()
                                    ->helperText('0 = Agotado. ≤ 2 unidades activa alerta de inventario crítico.'),
                                TextInput::make('price')
                                    ->label('Cotización Oficial')
                                    ->prefix('Bs.')
                                    ->numeric()
                                    ->required()
                                    ->helperText('Precio formal en moneda nacional (BOB).'),
                                Toggle::make('certified')
                                    ->label('Certificado de Autenticidad')
                                    ->helperText('Garantía pericial de Correos de Bolivia.')
                                    ->default(true),
                            ]),
                        Grid::make(2)
                            ->schema([
                                Toggle::make('is_active')
                                    ->label('Activo en Vitrina Pública')
                                    ->helperText('Permite a los coleccionistas ver y adquirir la pieza.')
                                    ->default(true),
                                Toggle::make('is_featured')
                                    ->label('Pieza de Vitrina / Destacada')
                                    ->helperText('Muestra el ejemplar en el carrusel de gala superior.')
                                    ->default(false),
                            ]),
                    ]),

                Section::make('Peritaje Técnico de Conservación')
                    ->description('Especificaciones físicas, estado de goma, dentado y rareza bajo normas FIP.')
                    ->icon('heroicon-o-shield-check')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                Select::make('condition')
                                    ->label('Estado de Conservación')
                                    ->options([
                                        'MINT_NH' => 'MINT NH — Goma Intacta Sin Charnela (Impecable)',
                                        'MINT_LH' => 'MINT LH — Goma Original con Rastro Leve de Charnela',
                                        'FDC' => 'FDC — Sobre Primer Día de Emisión con Matasellos',
                                        'USED' => 'USED — Matasellado / Circulación Postal Histórica',
                                    ])
                                    ->default('MINT_NH')
                                    ->required(),
                                Select::make('rarity')
                                    ->label('Nivel de Rareza y Cotización')
                                    ->options([
                                        'MUSEUM_PIECE' => '👑 Pieza de Museo (Récord Histórico)',
                                        'VERY_RARE' => '💎 Muy Rara (Menos de 50 ejemplares conocidos)',
                                        'RARE' => '⭐ Rara (Alta cotización en subasta)',
                                        'SCARCE' => '🏷️ Escasa (Tirada limitada)',
                                        'COMMON' => '📦 Circulación General (Serie Regular)',
                                    ])
                                    ->default('COMMON')
                                    ->required(),
                            ]),
                        Grid::make(3)
                            ->schema([
                                TextInput::make('perforation')
                                    ->label('Dentado')
                                    ->placeholder('Ej: 11 x 11.5 / Imperforado'),
                                TextInput::make('printing_technique')
                                    ->label('Técnica de Impresión')
                                    ->placeholder('Ej: Grabado en acero / Litografía'),
                                TextInput::make('paper_type')
                                    ->label('Tipo de Papel y Filigrana')
                                    ->placeholder('Ej: Papel verjurado sin filigrana'),
                            ]),
                        Grid::make(2)
                            ->schema([
                                TextInput::make('gum_condition')
                                    ->label('Estado Específico de la Goma')
                                    ->placeholder('Ej: Goma blanca original 100% íntegra'),
                                TextInput::make('dimensions')
                                    ->label('Dimensiones Físicas')
                                    ->placeholder('Ej: 24 x 30 mm'),
                            ]),
                    ]),

                Section::make('Archivo Fotográfico & Documentación')
                    ->description('Registro visual del anverso y reverso con reseña historiográfica.')
                    ->icon('heroicon-o-photo')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('front_image')
                                    ->label('Ruta / URL Fotografía Anverso')
                                    ->default('/images/cat-classic.jpg')
                                    ->required(),
                                TextInput::make('back_image')
                                    ->label('Ruta / URL Fotografía Reverso')
                                    ->default('/images/cat-classic.jpg'),
                            ]),
                        Textarea::make('description')
                            ->label('Descripción Detallada')
                            ->rows(3)
                            ->columnSpanFull()
                            ->placeholder('Detalles de motivo, color, grabador y particularidades filatélicas.'),
                        Textarea::make('historical_context')
                            ->label('Contexto Histórico & Decretos')
                            ->rows(3)
                            ->columnSpanFull()
                            ->placeholder('Normativa oficial de aprobación, tirada de la época y hechos históricos relacionados.'),
                    ]),

                Section::make('Topografía de Almacén & Ubicación en Bóveda')
                    ->description('Coordenadas físicas de custodia para la emisión de fichas y rótulos con código QR.')
                    ->icon('heroicon-o-building-office-2')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('vault_room')
                                    ->label('Bóveda / Sala')
                                    ->default('Bóveda Central A')
                                    ->required(),
                                TextInput::make('vault_cabinet')
                                    ->label('Armario / Mueble Ignífugo')
                                    ->default('Armario Ignífugo 01')
                                    ->required(),
                                TextInput::make('vault_drawer')
                                    ->label('Gaveta / Bandeja')
                                    ->default('Gaveta G-01')
                                    ->required(),
                            ]),
                        Grid::make(2)
                            ->schema([
                                TextInput::make('vault_album')
                                    ->label('Álbum / Clasificador')
                                    ->placeholder('Ej: Álbum Lindner Bolivia I'),
                                TextInput::make('vault_envelope')
                                    ->label('Sobre Glassine / Posición')
                                    ->placeholder('Ej: Sobre Acid-Free #001'),
                            ]),
                        Textarea::make('vault_notes')
                            ->label('Recomendaciones de Conservación & Climatización')
                            ->rows(2)
                            ->columnSpanFull()
                            ->placeholder('Ej: Mantener a 18°C-20°C y 45% HR con gel de sílice.'),
                    ]),
            ]);
    }
}
