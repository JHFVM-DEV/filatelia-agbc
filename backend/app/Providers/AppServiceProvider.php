<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \Filament\Http\Responses\Auth\Contracts\LogoutResponse::class,
            \App\Http\Responses\FilamentLogoutResponse::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $invalidateProduct = function (\App\Models\Product $product): void {
            \Illuminate\Support\Facades\Cache::forget('public_categories_list');
            \Illuminate\Support\Facades\Cache::forget('public_catalog_default');
            \Illuminate\Support\Facades\Cache::forget('product_slug_' . $product->slug);
            if ($product->getOriginal('slug')) {
                \Illuminate\Support\Facades\Cache::forget('product_slug_' . $product->getOriginal('slug'));
            }
        };
        \App\Models\Product::saved($invalidateProduct);
        \App\Models\Product::deleted($invalidateProduct);

        $invalidateCategory = function (): void {
            \Illuminate\Support\Facades\Cache::forget('public_categories_list');
            \Illuminate\Support\Facades\Cache::forget('public_catalog_default');
            // Las fichas individuales incluyen el nombre y slug de la categoría.
            \App\Models\Product::query()->select('id', 'slug')->chunkById(200, function ($products): void {
                foreach ($products as $product) {
                    \Illuminate\Support\Facades\Cache::forget('product_slug_' . $product->slug);
                }
            }, 'id');
        };
        \App\Models\Category::saved($invalidateCategory);
        \App\Models\Category::deleted($invalidateCategory);

        // Al cerrar sesión en web o Filament, revocar todos los tokens de API de ese usuario
        \Illuminate\Support\Facades\Event::listen(\Illuminate\Auth\Events\Logout::class, function ($event) {
            if ($event->user && method_exists($event->user, 'tokens')) {
                $event->user->tokens()->delete();
            }
        });
    }
}
