<?php

namespace App\Console\Commands;

use App\Services\CatalogPriceUpdater;
use Illuminate\Console\Command;
use Throwable;

class UpdateCatalogPrices extends Command
{
    protected $signature = 'catalog:update-prices {--apply : Aplicar los cambios con respaldo previo}';
    protected $description = 'Comparar o actualizar las piezas existentes con los 48 precios oficiales AGBC';

    public function handle(CatalogPriceUpdater $updater): int
    {
        try {
            $result = $updater->run((bool) $this->option('apply'));
        } catch (Throwable $error) {
            $this->error($error->getMessage());
            return self::FAILURE;
        }

        $this->table(['Pieza', 'Código', 'Precio anterior', 'Precio nuevo'], array_map(
            fn ($change) => [$change['slug'], $change['after']['catalog_code'], $change['before']['price'], $change['after']['price']],
            $result['changes']
        ));
        $this->info(count($result['changes']) . ($this->option('apply') ? ' piezas actualizadas.' : ' cambios previstos. Usa --apply para aplicarlos.'));
        if ($result['backup']) {
            $this->info('Respaldo: ' . $result['backup']);
        }
        foreach ($result['missing'] as $entry) {
            $this->warn("Sin registro: {$entry['catalog_code']} — {$entry['name']}");
        }

        return self::SUCCESS;
    }
}
