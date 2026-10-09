<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Emission;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminPanelApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('SUPER_ADMIN');
        $this->category = Category::create(['name' => 'Sellos', 'slug' => 'sellos']);
        $this->actingAs($this->admin, 'sanctum');
    }

    private function product(array $overrides = []): Product
    {
        return Product::create(array_merge([
            'name' => 'Energía Solar', 'slug' => 'energia-solar',
            'catalog_code' => 'BO-2012-ENER-SOL', 'category_id' => $this->category->id,
            'price' => 25, 'stock' => 6, 'year' => 2012, 'rarity' => 'RARE',
        ], $overrides));
    }

    private function order(array $overrides = []): Order
    {
        return Order::create(array_merge([
            'order_number' => 'ORD-2026-001', 'customer_name' => 'Ana Pérez',
            'customer_email' => 'ana@example.test', 'shipping_address' => 'Calle Prueba 1',
            'city' => 'La Paz', 'department' => 'La Paz', 'total_amount' => 25,
            'status' => 'PENDING',
        ], $overrides));
    }

    public function test_all_admin_read_endpoints_respond(): void
    {
        $paths = [
            'dashboard-stats', 'products', 'orders', 'shipments', 'users',
            'roles-permissions', 'my-permissions', 'inventory', 'dispatch-queue',
            'reports', 'system-health', 'logs', 'audit-logs', 'revaluations',
            'categories', 'emissions', 'api-tokens', 'api-tokens/docs', 'showcase',
        ];
        foreach ($paths as $path) {
            $this->getJson('/api/admin/' . $path)->assertOk()->assertJsonPath('success', true);
        }
    }

    public function test_product_search_by_code_name_and_numeric_year_with_rarity(): void
    {
        $product = $this->product();
        $this->product(['name' => 'Fauna', 'slug' => 'fauna', 'catalog_code' => 'FAUNA-2020', 'year' => 2020, 'rarity' => 'SCARCE']);
        foreach (['bo-2012-ener-sol', ' Solar ', '2012', '0'] as $search) {
            $this->getJson('/api/admin/products?' . http_build_query(['search' => $search, 'rarity' => 'RARE']))
                ->assertOk()->assertJsonCount(1, 'products')->assertJsonPath('products.0.id', $product->id);
        }
        $this->getJson('/api/admin/products?search=inexistente')->assertOk()->assertJsonCount(0, 'products');
        $this->getJson('/api/admin/products?search=2012&rarity=SCARCE')->assertOk()->assertJsonCount(0, 'products');
        $this->getJson('/api/admin/products?search=')->assertOk()->assertJsonCount(2, 'products');
    }

    public function test_product_search_casts_numeric_year_before_text_matching(): void
    {
        $this->product();
        \Illuminate\Support\Facades\DB::enableQueryLog();
        $this->getJson('/api/admin/products?search=2012')->assertOk()->assertJsonCount(1, 'products');
        $queries = \Illuminate\Support\Facades\DB::getQueryLog();
        \Illuminate\Support\Facades\DB::disableQueryLog();
        $productQuery = collect($queries)->first(fn ($query) => str_contains($query['query'], 'CAST(year AS TEXT)'));
        $this->assertNotNull($productQuery, 'Numeric years must be cast before LIKE to support PostgreSQL.');
    }

    public function test_orders_search_and_status_work_together(): void
    {
        $order = $this->order(['tracking_code' => 'VAL-LP-0042']);
        foreach (['ord-2026', 'ana', 'ANA@EXAMPLE.TEST', 'val-lp'] as $search) {
            $this->getJson('/api/admin/orders?' . http_build_query(['search' => $search, 'status' => 'PENDING']))
                ->assertOk()->assertJsonPath('orders.0.id', $order->id);
        }
        $this->getJson('/api/admin/orders?search=ana&status=DELIVERED')->assertOk()->assertJsonCount(0, 'orders');
    }

    public function test_product_creation_validates_category_and_saves(): void
    {
        $payload = ['name' => 'Nuevo sello', 'catalog_code' => 'NUEVO-2026', 'price' => 10,
            'stock' => 2, 'year' => 2026, 'condition' => 'MINT_NH', 'rarity' => 'RARE'];
        $this->postJson('/api/admin/products', $payload)->assertUnprocessable()->assertJsonValidationErrors('category_id');
        $response = $this->postJson('/api/admin/products', $payload + ['category_id' => $this->category->id])->assertCreated();
        $id = $response->json('product.id');
        $this->putJson('/api/admin/products/' . $id, ['stock' => 3, 'price' => 12])->assertOk()->assertJsonPath('product.stock', 3);
        $this->putJson('/api/admin/products/' . $id, ['stock' => -1])->assertUnprocessable();
    }

    public function test_emission_delete_route_and_associated_product_protection(): void
    {
        $emission = Emission::create(['name' => 'Prueba', 'slug' => 'prueba', 'year' => 2026]);
        $product = $this->product(['emission_id' => $emission->id]);
        $this->deleteJson('/api/admin/emissions/' . $emission->id)->assertUnprocessable();
        $product->update(['emission_id' => null]);
        $this->deleteJson('/api/admin/emissions/' . $emission->id)->assertOk();
        $this->assertDatabaseMissing('emissions', ['id' => $emission->id]);
    }

    public function test_shipping_and_delivery_keep_the_order_in_sync(): void
    {
        $order = $this->order();
        $response = $this->patchJson('/api/admin/orders/' . $order->id . '/status', ['status' => 'SHIPPED'])->assertOk();
        $shipment = $response->json('order.shipment');
        $this->assertNotEmpty($shipment['tracking_code']);
        $this->assertSame('La Paz', $shipment['destination_department']);
        $this->patchJson('/api/admin/shipments/' . $shipment['id'] . '/status', ['status' => 'DELIVERED'])->assertOk();
        $this->assertSame('DELIVERED', $order->fresh()->status);
        $this->patchJson('/api/admin/orders/' . $order->id . '/status', ['status' => 'SHIPPED'])->assertOk();
        $this->assertSame('IN_TRANSIT', $order->fresh()->shipment->status);
        $this->assertNull($order->fresh()->shipment->delivered_at);
        $this->patchJson('/api/admin/orders/' . $order->id . '/status', ['status' => 'INVALID'])->assertUnprocessable();
    }

    public function test_repeating_dispatch_does_not_duplicate_shipments(): void
    {
        $order = $this->order();
        $payload = ['order_id' => $order->id, 'carrier' => 'Correos', 'tracking_code' => 'VAL-TEST-001'];
        $this->postJson('/api/admin/dispatch-queue/confirm', $payload)->assertOk();
        $this->postJson('/api/admin/dispatch-queue/confirm', $payload)->assertOk();
        $this->assertDatabaseCount('shipments', 1);
        $anotherOrder = $this->order(['order_number' => 'ORD-2026-002']);
        $payload['order_id'] = $anotherOrder->id;
        $this->postJson('/api/admin/dispatch-queue/confirm', $payload)->assertUnprocessable();
        $this->assertSame('PENDING', $anotherOrder->fresh()->status);
    }

    public function test_inventory_rejects_excess_outflow_and_allows_zero_adjustment(): void
    {
        $product = $this->product();
        $payload = ['product_id' => $product->id, 'reason' => 'Conteo físico'];
        $this->postJson('/api/admin/inventory/adjust', $payload + ['type' => 'OUT', 'quantity' => 7])->assertUnprocessable();
        $this->assertSame(6, $product->fresh()->stock);
        $this->assertDatabaseCount('inventory_movements', 0);
        $this->postJson('/api/admin/inventory/adjust', $payload + ['type' => 'ADJUST', 'quantity' => 0])->assertOk();
        $this->assertSame(0, $product->fresh()->stock);
    }

    public function test_empty_dashboard_reports_zero_instead_of_example_data(): void
    {
        $data = $this->getJson('/api/admin/dashboard-stats')->assertOk()->json();
        $this->assertEquals(0, array_sum(array_column($data['revenue_timeline'], 'total')));
        $this->assertEquals(0, array_sum(array_column($data['department_distribution'], 'count')));
    }

    public function test_clients_cannot_access_administration(): void
    {
        Role::create(['name' => 'CLIENTE', 'guard_name' => 'web']);
        $client = User::factory()->create();
        $client->assignRole('CLIENTE');
        $this->actingAs($client, 'sanctum');
        foreach (['products', 'orders', 'inventory', 'users', 'roles-permissions', 'showcase', 'api-tokens'] as $path) {
            $this->getJson('/api/admin/' . $path)->assertForbidden();
        }
    }

    public function test_revoking_all_warehouse_permissions_stays_revoked(): void
    {
        $this->getJson('/api/admin/roles-permissions')->assertOk();
        $this->postJson('/api/admin/roles-permissions', [])->assertUnprocessable();
        $warehouse = User::factory()->create();
        $warehouse->assignRole('ADMIN_PRODUCTOS_ALMACEN');
        $this->postJson('/api/admin/roles-permissions', ['matrix' => []])->assertOk();
        $this->getJson('/api/admin/roles-permissions')->assertOk()
            ->assertJsonPath('matrix.Productos.ADMIN_PRODUCTOS_ALMACEN', false);
        $this->actingAs($warehouse, 'sanctum');
        $this->getJson('/api/admin/my-permissions')->assertOk()->assertJsonCount(0, 'permissions');
        $this->getJson('/api/admin/products')->assertForbidden();
    }

    public function test_categories_users_and_emissions_can_be_created_and_edited(): void
    {
        Role::create(['name' => 'CLIENTE', 'guard_name' => 'web']);
        $user = $this->postJson('/api/admin/users', [
            'name' => 'Operador', 'email' => 'operador@example.test', 'password' => 'Prueba123!', 'role' => 'CLIENTE',
        ])->assertOk()->json('user.id');
        $this->putJson('/api/admin/users/' . $user, ['name' => 'Operador actualizado'])->assertOk();
        $category = $this->postJson('/api/admin/categories', ['name' => 'Fauna', 'slug' => 'fauna'])->assertOk()->json('category.id');
        $this->putJson('/api/admin/categories/' . $category, ['name' => 'Fauna actualizada'])->assertOk();
        $emission = $this->postJson('/api/admin/emissions', ['name' => 'Aniversario', 'year' => 2026])->assertOk()->json('emission.id');
        $this->putJson('/api/admin/emissions/' . $emission, ['year' => 2025])->assertOk();
    }
}
