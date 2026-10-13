<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ShowcaseAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private function product(string $slug, bool $selected = false, int $order = 0): Product
    {
        $category = Category::firstOrCreate(['slug' => 'sellos'], ['name' => 'Sellos']);
        return Product::create(['slug' => $slug, 'name' => $slug, 'catalog_code' => $slug, 'category_id' => $category->id,
            'price' => 3, 'stock' => 0, 'year' => 2026, 'is_active' => false, 'is_featured' => true,
            'is_in_showcase' => $selected, 'showcase_order' => $order]);
    }

    private function admin(): void
    {
        Role::firstOrCreate(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $user = User::factory()->create(); $user->assignRole('SUPER_ADMIN'); $this->actingAs($user, 'sanctum');
    }

    public function test_disabled_and_sold_out_products_remain_selected_and_available_to_choose(): void
    {
        $a = $this->product('a', true, 2); $b = $this->product('b', true, 1); $this->product('not-selected');
        $this->admin();
        $this->getJson('/api/admin/showcase')->assertOk()->assertJsonCount(3, 'all_products')
            ->assertJsonCount(2, 'showcase_items')->assertJsonPath('showcase_items.0.id', $b->id)
            ->assertJsonPath('showcase_items.1.id', $a->id);
        $this->getJson('/api/external/showcase')->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $b->id)->assertJsonPath('data.1.id', $a->id)
            ->assertJsonPath('data.0.can_purchase', false);
    }

    public function test_saving_selection_and_empty_selection_preserves_purchase_state(): void
    {
        $a = $this->product('a'); $b = $this->product('b'); $this->admin();
        $this->postJson('/api/admin/showcase', ['ordered_ids' => [$b->id, $a->id], 'badges' => [$b->id => 'PATRIMONIO']])
            ->assertOk()->assertJsonPath('showcase_items.0.id', $b->id)->assertJsonPath('showcase_items.0.showcase_badge', 'PATRIMONIO');
        $this->assertFalse($a->fresh()->is_active); $this->assertSame(0, $a->fresh()->stock);
        $this->postJson('/api/admin/showcase', ['ordered_ids' => [], 'badges' => []])->assertOk()->assertJsonCount(0, 'showcase_items');
        $this->assertSame(0, Product::where('is_in_showcase', true)->count());
        $this->getJson('/api/external/showcase')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/showcase')->assertJsonCount(2, 'all_products');
    }

    public function test_invalid_selection_and_customers_cannot_change_showcase(): void
    {
        $a = $this->product('a', true, 1);
        $this->actingAs(User::factory()->create(), 'sanctum')->getJson('/api/admin/showcase')->assertForbidden();
        $this->admin();
        $this->postJson('/api/admin/showcase', ['ordered_ids' => [$a->id, 99999]])->assertUnprocessable();
        $this->assertTrue($a->fresh()->is_in_showcase);
        $this->postJson('/api/admin/showcase', ['ordered_ids' => [$a->id, $a->id]])->assertUnprocessable();
    }

    public function test_defaults_can_be_selected_when_every_purchase_is_disabled(): void
    {
        for ($i = 0; $i < 5; $i++) $this->product('piece-'.$i);
        $this->admin();
        $this->postJson('/api/admin/showcase/reset-default')->assertOk()->assertJsonCount(4, 'showcase_items');
        $this->assertSame(0, Product::where('is_active', true)->count());
        $this->getJson('/api/external/showcase')->assertOk()->assertJsonCount(4, 'data');
    }
}
