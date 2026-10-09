<?php

namespace Database\Seeders;

use App\Services\CatalogPriceUpdater;
use Illuminate\Database\Seeder;

class CatalogPriceSeeder extends Seeder
{
    public function run(): void
    {
        $result = app(CatalogPriceUpdater::class)->run(true);
        $this->command?->info(count($result['changes']) . ' precios actualizados.');
        foreach ($result['missing'] as $entry) {
            $this->command?->warn("Pieza ausente: {$entry['catalog_code']} — {$entry['name']}");
        }
    }
}
