<?php

namespace App\Filament\Resources\Emissions;

use App\Filament\Resources\Emissions\Pages\CreateEmission;
use App\Filament\Resources\Emissions\Pages\EditEmission;
use App\Filament\Resources\Emissions\Pages\ListEmissions;
use App\Filament\Resources\Emissions\Schemas\EmissionForm;
use App\Filament\Resources\Emissions\Tables\EmissionsTable;
use App\Models\Emission;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class EmissionResource extends Resource
{
    protected static ?string $model = Emission::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static \UnitEnum|string|null $navigationGroup = 'Gestión Filatélica';

    protected static ?string $navigationLabel = 'Emisiones Conmemorativas';

    protected static ?string $modelLabel = 'Emisión Oficial';

    protected static ?string $pluralModelLabel = 'Emisiones Conmemorativas';

    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return auth()->user()?->hasAnyRole(['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN']) ?? false;
    }

    public static function form(Schema $schema): Schema
    {
        return EmissionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return EmissionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEmissions::route('/'),
            'create' => CreateEmission::route('/create'),
            'edit' => EditEmission::route('/{record}/edit'),
        ];
    }
}
