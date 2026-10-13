<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CatalogCategoriesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_changes_immediately_update_cached_public_categories_and_product_details(): void
    {
        Cache::flush();
        Role::firstOrCreate(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('SUPER_ADMIN');
        $this->actingAs($user, 'sanctum');
        $this->getJson('/api/categories')->assertOk()->assertJsonCount(0, 'data');

        $response = $this->postJson('/api/admin/categories', [
            'name' => 'Nueva temática', 'slug' => 'nueva-tematica', 'sort_order' => 1,
        ])->assertOk();
        $id = $response->json('category.id');
        $this->getJson('/api/categories')->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'nueva-tematica')->assertJsonPath('data.0.products_count', 0);

        $product = Product::create(['name' => 'Sello', 'slug' => 'sello', 'catalog_code' => 'TEST',
            'category_id' => $id, 'price' => 3, 'stock' => 0, 'year' => 2026]);
        $this->getJson('/api/categories')->assertJsonPath('data.0.products_count', 1);
        $this->getJson('/api/products')->assertOk();
        $this->getJson('/api/products/sello')->assertOk()->assertJsonPath('data.category.slug', 'nueva-tematica');
        $this->putJson("/api/admin/categories/{$id}", ['name' => 'Renombrada', 'slug' => 'renombrada'])->assertOk();
        $this->getJson('/api/categories')->assertJsonPath('data.0.name', 'Renombrada')
            ->assertJsonPath('data.0.slug', 'renombrada');
        $this->getJson('/api/products')->assertJsonPath('data.0.category.slug', 'renombrada');
        $this->getJson('/api/products/sello')->assertJsonPath('data.category.name', 'Renombrada');
        $this->deleteJson("/api/admin/categories/{$id}")->assertStatus(422);
        $product->delete();
        $this->getJson('/api/categories')->assertJsonPath('data.0.products_count', 0);
        $this->deleteJson("/api/admin/categories/{$id}")->assertOk();
        $this->getJson('/api/categories')->assertJsonCount(0, 'data');
    }

    public function test_public_categories_include_empty_categories_in_admin_order(): void
    {
        Cache::flush();
        Category::create(['name' => 'Segunda', 'slug' => 'segunda', 'sort_order' => 2]);
        Category::create(['name' => 'Primera', 'slug' => 'primera', 'sort_order' => 1]);
        $this->getJson('/api/categories')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'primera')->assertJsonPath('data.1.slug', 'segunda');
    }
}
