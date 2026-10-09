<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$products = App\Models\Product::orderBy('id')->get();
$folder = storage_path('app/catalog-audit');
if (!is_dir($folder)) mkdir($folder, 0755, true);
$path = $folder . '/before-prices-' . date('Ymd-His') . '.json';
file_put_contents($path, json_encode($products->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo json_encode([
    'connection' => config('database.default'),
    'database' => $products->first()?->getConnection()->getDatabaseName(),
    'count' => $products->count(),
    'backup' => $path,
    'products' => $products->map(fn ($product) => $product->only(['id', 'name', 'slug', 'catalog_code', 'price', 'face_value', 'stock', 'is_active'])),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
