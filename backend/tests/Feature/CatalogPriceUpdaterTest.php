<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Services\CatalogPriceUpdater;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class CatalogPriceUpdaterTest extends TestCase
{
    use RefreshDatabase;

    private function product(string $slug, array $values = []): Product
    {
        $category = Category::firstOrCreate(['slug' => 'sellos'], ['name' => 'Sellos']);
        return Product::create(array_merge([
            'slug' => $slug, 'name' => 'Pieza existente', 'catalog_code' => 'CODIGO-ANTERIOR',
            'category_id' => $category->id, 'price' => 185, 'face_value' => 'Bs 185',
            'year' => 2007, 'stock' => 7, 'is_active' => false, 'vault_notes' => 'Custodia real',
        ], $values));
    }

    public function test_all_48_prices_match_the_supplied_table_and_both_seed_catalogs(): void
    {
        $prices = ['3.80','6.00','6.00','6.00','6.00','6.00','8.50','6.00','6.50','2.90','1.90','6.00','3.50','12.00','9.00','4.00','6.50','3.50','10.50','6.50','6.50','6.50','5.50','5.50','5.50','7.50','10.50','1.50','2.50','3.50','2.50','2.50','10.50','10.50','1.50','2.00','18.00','14.00','100.00','0.50','3.00','20.00','20.00','50.00','4.00','2.30','10.00','16.00'];
        $entries = app(CatalogPriceUpdater::class)->entries();
        $this->assertCount(48, $entries);
        $seed = file_get_contents(database_path('seeders/DatabaseSeeder.php'));
        $frontend = file_get_contents(base_path('../frontend/src/data/stamps.ts'));
        foreach ($entries as $index => $entry) {
            $this->assertSame('BO.AGBC-' . ($index + 1), $entry['catalog_code']);
            $this->assertSame($prices[$index], $entry['price']);
            $this->assertSame('Bs ' . $prices[$index], $entry['face_value']);
            if ($entry['slug'] === null) {
                $this->assertSame('BO.AGBC-44', $entry['catalog_code']);
                $this->assertStringNotContainsString("'catalog_code' => 'BO.AGBC-44'", $seed);
                $this->assertStringNotContainsString('catalog_code: "BO.AGBC-44"', $frontend);
                continue;
            }
            $code = preg_quote($entry['catalog_code'], '/');
            $price = preg_quote($entry['price'], '/');
            $this->assertMatchesRegularExpression("/'catalog_code' => '$code',.*?'price' => $price,/s", $seed);
            $this->assertMatchesRegularExpression('/catalog_code: "' . $code . '",.*?price: ' . $price . ',/s', $frontend);
        }
    }

    public function test_preview_does_not_change_prices_or_create_missing_pieces(): void
    {
        $product = $this->product('energia-limpia-solar-2012');
        // Use the canonical slug, independently of this product's old code.
        $entry = collect(app(CatalogPriceUpdater::class)->entries())->firstWhere('catalog_code', 'BO.AGBC-30');
        $product->update(['slug' => $entry['slug']]);
        $result = app(CatalogPriceUpdater::class)->run();
        $this->assertCount(1, $result['changes']);
        $this->assertCount(47, $result['missing']);
        $this->assertNull($result['backup']);
        $this->assertSame('185.00', $product->fresh()->price);
        $this->assertSame(1, Product::count());
    }

    public function test_update_preserves_inventory_ids_and_metadata_is_repeatable_and_clears_cache(): void
    {
        $updater = app(CatalogPriceUpdater::class);
        foreach ($updater->entries() as $entry) {
            if ($entry['slug'] !== null) {
                $this->product($entry['slug']);
            }
        }
        $unrelated = $this->product('pieza-ajena');
        $original = Product::orderBy('id')->get()->map(fn ($p) => $p->only(['id','slug','name','stock','is_active','vault_notes']))->all();
        Cache::put('public_catalog_default', 'stale');
        Cache::put('product_slug_' . $updater->entries()[0]['slug'], 'stale');
        $result = $updater->run(true);
        try {
            $this->assertCount(47, $result['changes']);
            $this->assertCount(1, $result['missing']);
            $this->assertFileExists($result['backup']);
            $this->assertCount(47, json_decode(file_get_contents($result['backup']), true));
            $this->assertSame($original, Product::orderBy('id')->get()->map(fn ($p) => $p->only(['id','slug','name','stock','is_active','vault_notes']))->all());
            $this->assertSame('185.00', $unrelated->fresh()->price);
            foreach ($updater->entries() as $entry) {
                if ($entry['slug'] !== null) {
                    $this->assertDatabaseHas('products', ['slug' => $entry['slug'], 'price' => $entry['price'], 'catalog_code' => $entry['catalog_code'], 'face_value' => $entry['face_value']]);
                }
            }
            $this->assertNull(Cache::get('public_catalog_default'));
            $this->assertNull(Cache::get('product_slug_' . $updater->entries()[0]['slug']));
            $this->assertCount(0, $updater->run(true)['changes']);
        } finally {
            File::delete($result['backup']);
        }
    }

    public function test_known_duplicate_codes_are_corrected_together(): void
    {
        $entries = app(CatalogPriceUpdater::class)->entries();
        $scouts = $this->product($entries[6]['slug'], ['catalog_code' => 'BO.AGBC-7']);
        $flag = $this->product($entries[7]['slug'], ['catalog_code' => 'BO.AGBC-7']);
        $result = app(CatalogPriceUpdater::class)->run(true);
        try {
            $this->assertSame('BO.AGBC-7', $scouts->fresh()->catalog_code);
            $this->assertSame('BO.AGBC-8', $flag->fresh()->catalog_code);
        } finally {
            File::delete($result['backup']);
        }
    }

    public function test_unknown_code_collision_aborts_without_partial_changes(): void
    {
        $entries = app(CatalogPriceUpdater::class)->entries();
        $product = $this->product($entries[0]['slug']);
        $this->product('pieza-desconocida', ['catalog_code' => 'BO.AGBC-1']);
        try {
            app(CatalogPriceUpdater::class)->run(true);
            $this->fail('Debe detectar el código ocupado.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('BO.AGBC-1', $exception->getMessage());
            $this->assertSame('185.00', $product->fresh()->price);
            $this->assertSame('CODIGO-ANTERIOR', $product->fresh()->catalog_code);
        }
    }
}
