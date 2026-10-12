<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PurchaseAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private function product(string $slug, bool $active = true, int $stock = 3): Product
    {
        $category = Category::firstOrCreate(['slug' => 'sellos'], ['name' => 'Sellos']);
        return Product::create(['slug' => $slug, 'name' => $slug, 'catalog_code' => $slug, 'category_id' => $category->id,
            'price' => 3, 'stock' => $stock, 'year' => 2026, 'is_active' => $active]);
    }

    private function admin(): void
    {
        Role::firstOrCreate(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('SUPER_ADMIN');
        $this->actingAs($user, 'sanctum');
    }

    private function order(array $items): array
    {
        return ['customer_name' => 'Ana', 'customer_email' => 'ana@example.test', 'shipping_address' => 'Calle 1',
            'city' => 'La Paz', 'department' => 'La Paz', 'payment_method' => 'QR_TRANSFER', 'items' => $items];
    }

    public function test_inactive_and_sold_out_pieces_are_visible_in_public_catalog_and_details(): void
    {
        $this->product('active');
        $inactive = $this->product('inactive', false);
        $soldOut = $this->product('sold-out', true, 0);
        $this->getJson('/api/products')->assertOk()->assertJsonCount(3, 'data');
        $this->getJson('/api/products?search=inactive')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.can_purchase', false);
        $this->getJson('/api/products/' . $inactive->slug)->assertOk()->assertJsonPath('data.purchase_status', 'disabled');
        $this->getJson('/api/products/' . $soldOut->slug)->assertOk()->assertJsonPath('data.purchase_status', 'sold_out');
    }

    public function test_selected_and_all_actions_are_reversible_and_preserve_inventory(): void
    {
        $a = $this->product('a'); $b = $this->product('b'); $c = $this->product('c', true, 0);
        $this->admin();
        Cache::put('public_catalog_default', 'stale');
        $this->patchJson('/api/admin/products/purchase-availability', ['scope' => 'selected', 'ids' => [$a->id], 'is_active' => false])
            ->assertOk()->assertJsonPath('updated', 1);
        $this->assertFalse($a->fresh()->is_active);
        $this->assertTrue($b->fresh()->is_active);
        $this->assertNull(Cache::get('public_catalog_default'));
        $this->patchJson('/api/admin/products/purchase-availability', ['scope' => 'all', 'is_active' => false])->assertOk();
        $this->assertSame(0, Product::where('is_active', true)->count());
        $this->patchJson('/api/admin/products/purchase-availability', ['scope' => 'all', 'is_active' => true])->assertOk();
        $this->assertSame(3, Product::where('is_active', true)->count());
        $this->assertSame(3, $a->fresh()->stock);
        $this->assertSame(0, $c->fresh()->stock);
        $this->assertFalse($c->fresh()->can_purchase);
        $this->assertDatabaseCount('products', 3);
        $this->assertDatabaseCount('audit_logs', 6);
    }

    public function test_unauthorized_users_and_invalid_selection_cannot_change_purchase_state(): void
    {
        $piece = $this->product('p');
        $this->actingAs(User::factory()->create(), 'sanctum')->patchJson('/api/admin/products/purchase-availability', ['scope' => 'all', 'is_active' => false])->assertForbidden();
        $this->admin();
        $this->patchJson('/api/admin/products/purchase-availability', ['scope' => 'selected', 'ids' => [$piece->id, 9999], 'is_active' => false])->assertUnprocessable();
        $this->assertTrue($piece->fresh()->is_active);
        $this->patchJson('/api/admin/products/purchase-availability', ['scope' => 'selected', 'ids' => [], 'is_active' => false])->assertUnprocessable();
    }

    public function test_orders_reject_disabled_sold_out_and_excess_quantities_without_partial_stock_changes(): void
    {
        $good = $this->product('good'); $disabled = $this->product('disabled', false); $empty = $this->product('empty', true, 0);
        foreach ([[$disabled, 1], [$empty, 1], [$good, 4]] as [$piece, $quantity]) {
            $this->postJson('/api/orders', $this->order([['product_id' => $piece->id, 'quantity' => $quantity]]))->assertUnprocessable();
        }
        $this->postJson('/api/orders', $this->order([['product_id' => $good->id, 'quantity' => 1], ['product_id' => $disabled->id, 'quantity' => 1]]))->assertUnprocessable();
        $this->assertSame(3, $good->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
        $this->postJson('/api/orders', $this->order([['product_id' => $good->id, 'quantity' => 3]]))->assertCreated();
        $this->assertSame(0, $good->fresh()->stock);
        $this->getJson('/api/products/good')->assertJsonPath('data.purchase_status', 'sold_out');
    }
}
