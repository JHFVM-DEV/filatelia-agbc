<?php

namespace App\Filament\Resources\Emissions\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class EmissionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                TextInput::make('year')
                    ->required()
                    ->numeric(),
                DatePicker::make('issue_date'),
                Textarea::make('description')
                    ->columnSpanFull(),
                TextInput::make('official_decree'),
            ]);
    }
}
