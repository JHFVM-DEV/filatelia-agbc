<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class CatalogPriceUpdater
{
    public function entries(): array
    {
        return require database_path('data/catalog_prices.php');
    }

    public function run(bool $apply = false): array
    {
        $result = DB::transaction(function () use ($apply) {
            $changes = [];
            $missing = [];
            $entries = $this->entries();
            $codesBySlug = array_column($entries, 'catalog_code', 'slug');
            foreach ($entries as $entry) {
                if ($entry['slug'] === null) {
                    $missing[] = $entry;
                    continue;
                }
                // Stable slugs identify the old catalog; PDF codes were duplicated.
                $query = Product::where('slug', $entry['slug']);
                $product = ($apply ? $query->lockForUpdate() : $query)->first();
                if (!$product) {
                    $missing[] = $entry;
                    continue;
                }
                $conflicts = Product::where('catalog_code', $entry['catalog_code'])
                    ->where('id', '!=', $product->id)->get();
                foreach ($conflicts as $conflict) {
                    // Known duplicates are corrected together in this transaction.
                    if (!isset($codesBySlug[$conflict->slug]) || $codesBySlug[$conflict->slug] === $entry['catalog_code']) {
                        throw new RuntimeException("Código {$entry['catalog_code']} asignado a otra pieza; revisar antes de actualizar.");
                    }
                }
                $after = array_intersect_key($entry, array_flip(['catalog_code', 'price', 'face_value']));
                $before = $product->only(['catalog_code', 'price', 'face_value']);
                if ($before !== $after) {
                    $changes[] = ['id' => $product->id, 'slug' => $product->slug, 'before' => $before, 'after' => $after];
                }
            }

            $backup = null;
            if ($apply && $changes) {
                $directory = storage_path('app/private/catalog-prices');
                File::ensureDirectoryExists($directory, 0700);
                $backup = $directory . '/before-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.json';
                $json = json_encode($changes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
                if (File::put($backup, $json) === false) {
                    throw new RuntimeException('No se pudo guardar el respaldo de precios.');
                }
                foreach ($changes as $change) {
                    Product::whereKey($change['id'])->update($change['after']);
                }
            }

            return compact('changes', 'missing', 'backup');
        });

        if ($apply && $result['changes']) {
            Cache::forget('public_catalog_default');
            foreach ($result['changes'] as $change) {
                Cache::forget('product_slug_' . $change['slug']);
            }
        }

        return $result;
    }
}
