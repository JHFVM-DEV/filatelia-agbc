<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminProductImagesTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Role::create(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('SUPER_ADMIN');
        $this->category = Category::create(['name' => 'Sellos', 'slug' => 'sellos']);
        $this->actingAs($this->admin, 'sanctum');
    }

    private function payload(): array
    {
        return ['name' => 'Sello nuevo', 'catalog_code' => 'BO.AGBC-TEST', 'category_id' => $this->category->id,
            'price' => 3.8, 'stock' => 5, 'year' => 2026, 'condition' => 'MINT_NH', 'rarity' => 'RARE', 'certified' => '1'];
    }

    private function image(string $name): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jmK0AAAAASUVORK5CYII='));
    }

    public function test_create_uploads_both_sides_and_invalidates_catalog_cache(): void
    {
        Cache::put('public_catalog_default', 'old');
        $response = $this->post('/api/admin/products', [...$this->payload(),
            'front_image_file' => $this->image('front.png'), 'back_image_file' => $this->image('back.png')], ['Accept' => 'application/json'])->assertCreated();
        $front = $response->json('product.front_image');
        $back = $response->json('product.back_image');
        $this->assertStringStartsWith('/storage/product-images/', $front);
        Storage::disk('public')->assertExists(substr($front, strlen('/storage/')));
        Storage::disk('public')->assertExists(substr($back, strlen('/storage/')));
        $this->assertNotSame($front, $back);
        $this->assertNull(Cache::get('public_catalog_default'));
    }

    public function test_method_override_updates_images_and_preserves_stock_and_other_side(): void
    {
        $id = $this->postJson('/api/admin/products', $this->payload() + ['back_image' => '/images/back.png'])->assertCreated()->json('product.id');
        $product = Product::findOrFail($id);
        Cache::put('product_slug_' . $product->slug, 'old');
        $this->post('/api/admin/products/' . $id, ['_method' => 'PUT', 'front_image_file' => $this->image('replacement.png')], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('product.stock', 5)->assertJsonPath('product.back_image', '/images/back.png');
        $this->assertStringStartsWith('/storage/product-images/', $product->fresh()->front_image);
        $this->assertNull(Cache::get('product_slug_' . $product->slug));
    }

    public function test_invalid_and_oversized_files_and_duplicate_code_do_not_leave_files(): void
    {
        $this->post('/api/admin/products', $this->payload() + ['front_image_file' => UploadedFile::fake()->create('script.svg', 1, 'image/svg+xml')], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('front_image_file');
        $this->post('/api/admin/products', $this->payload() + ['front_image_file' => UploadedFile::fake()->create('huge.png', 5121, 'image/png')], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('front_image_file');
        $this->postJson('/api/admin/products', $this->payload())->assertCreated();
        $this->post('/api/admin/products', $this->payload() + ['front_image_file' => $this->image('front.png')], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('catalog_code');
        $this->assertCount(0, Storage::disk('public')->allFiles());
    }

    public function test_client_cannot_upload_files(): void
    {
        Role::create(['name' => 'CLIENTE', 'guard_name' => 'web']);
        $client = User::factory()->create();
        $client->assignRole('CLIENTE');
        $this->actingAs($client, 'sanctum')->post('/api/admin/products', $this->payload() + ['front_image_file' => $this->image('front.png')], ['Accept' => 'application/json'])->assertForbidden();
        $this->assertCount(0, Storage::disk('public')->allFiles());
    }

    public function test_admin_email_without_super_admin_role_does_not_grant_user_management(): void
    {
        Role::create(['name' => 'CLIENTE', 'guard_name' => 'web']);
        $client = User::factory()->create(['email' => 'admin@filatelia.bo']);
        $client->assignRole('CLIENTE');
        $this->actingAs($client, 'sanctum')->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_product_with_order_history_cannot_be_deleted_but_can_be_deactivated(): void
    {
        $id = $this->postJson('/api/admin/products', $this->payload())->json('product.id');
        $order = Order::create(['order_number' => 'HISTORY-1', 'customer_name' => 'Ana', 'customer_email' => 'ana@example.test',
            'shipping_address' => 'Calle 1', 'city' => 'La Paz', 'department' => 'La Paz', 'total_amount' => 3.8, 'status' => 'PENDING']);
        OrderItem::create(['order_id' => $order->id, 'product_id' => $id, 'product_name' => 'Sello nuevo', 'unit_price' => 3.8, 'quantity' => 1, 'subtotal' => 3.8]);
        $this->deleteJson('/api/admin/products/' . $id)->assertUnprocessable();
        $this->assertDatabaseCount('order_items', 1);
        $this->putJson('/api/admin/products/' . $id, ['is_active' => false])->assertOk()->assertJsonPath('product.is_active', false);
    }

    public function test_product_with_inventory_history_is_protected_and_reports_exclude_cancelled_revenue(): void
    {
        $id = $this->postJson('/api/admin/products', $this->payload())->json('product.id');
        InventoryMovement::create(['product_id' => $id, 'user_id' => $this->admin->id, 'type' => 'IN', 'quantity' => 5,
            'previous_stock' => 0, 'new_stock' => 5, 'department' => 'La Paz', 'reason' => 'Ingreso']);
        $this->deleteJson('/api/admin/products/' . $id)->assertUnprocessable();
        foreach (['PENDING' => 10, 'CANCELLED' => 100] as $status => $amount) {
            Order::create(['order_number' => $status, 'customer_name' => 'Ana', 'customer_email' => 'ana@example.test',
                'shipping_address' => 'Calle 1', 'city' => 'La Paz', 'department' => 'La Paz', 'total_amount' => $amount, 'status' => $status]);
        }
        $this->getJson('/api/admin/reports')->assertOk()->assertJsonPath('totalRevenue', 10)->assertJsonPath('avgTicket', 10)
            ->assertJsonPath('departmentBreakdown.0.orders_count', 1);
    }
}
