<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\File;

class LogViewerPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static ?string $navigationLabel = 'Visor de Logs';

    protected static ?string $title = 'Auditoría y Visor de Registros del Sistema (Logs)';

    protected static \UnitEnum|string|null $navigationGroup = 'Reportes & Auditoría';

    protected static ?int $navigationSort = 3;

    protected string $view = 'filament.pages.log-viewer-page';

    public $logFilter = 'ALL';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    public function clearLogs(): void
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        Notification::make()
            ->title('Archivo de Logs Limpiado')
            ->success()
            ->send();
    }

    public function getViewData(): array
    {
        $logPath = storage_path('logs/laravel.log');
        $lines = [];

        if (File::exists($logPath)) {
            $content = File::get($logPath);
            $rawLines = array_filter(explode("\n", $content));
            $reversed = array_reverse(array_slice($rawLines, -100));

            foreach ($reversed as $raw) {
                if (trim($raw) === '') continue;

                $level = 'INFO';
                if (str_contains($raw, '.ERROR') || str_contains($raw, 'error')) $level = 'ERROR';
                elseif (str_contains($raw, '.WARNING') || str_contains($raw, 'warning')) $level = 'WARNING';
                elseif (str_contains($raw, '.DEBUG') || str_contains($raw, 'debug')) $level = 'DEBUG';

                if ($this->logFilter === 'ALL' || $this->logFilter === $level) {
                    $lines[] = [
                        'raw' => $raw,
                        'level' => $level,
                    ];
                }
            }
        }

        return [
            'logs' => array_slice($lines, 0, 50),
            'logFileSize' => File::exists($logPath) ? round(File::size($logPath) / 1024, 2) . ' KB' : '0 KB',
        ];
    }
}
