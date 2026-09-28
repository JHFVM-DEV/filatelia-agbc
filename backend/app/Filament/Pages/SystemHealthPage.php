<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\DB;

class SystemHealthPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCpuChip;

    protected static ?string $navigationLabel = 'Monitoreo Pulse';

    protected static ?string $title = 'Monitoreo del Servidor y Estado del Sistema (Pulse)';

    protected static \UnitEnum|string|null $navigationGroup = 'Reportes & Auditoría';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.system-health-page';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    public function getViewData(): array
    {
        $dbStatus = 'OK';
        $dbLatency = 0;
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $dbLatency = round((microtime(true) - $start) * 1000, 2);
        } catch (\Exception $e) {
            $dbStatus = 'ERROR';
        }

        $memoryUsage = round(memory_get_usage(true) / 1024 / 1024, 2);
        $peakMemory = round(memory_get_peak_usage(true) / 1024 / 1024, 2);

        return [
            'phpVersion' => PHP_VERSION,
            'laravelVersion' => app()->version(),
            'filamentVersion' => 'v5.8.1',
            'dbConnection' => config('database.default'),
            'dbStatus' => $dbStatus,
            'dbLatency' => $dbLatency,
            'memoryUsage' => $memoryUsage,
            'peakMemory' => $peakMemory,
            'cacheDriver' => config('cache.default'),
            'sessionDriver' => config('session.driver'),
            'queueDriver' => config('queue.default'),
            'serverTime' => now()->format('d/m/Y H:i:s T'),
        ];
    }
}
