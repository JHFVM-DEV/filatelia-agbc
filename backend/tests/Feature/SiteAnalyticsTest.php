<?php

namespace Tests\Feature;

use App\Http\Controllers\Api\AnalyticsController;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SiteAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private function event(array $extra = []): array
    {
        return array_merge(['event_id' => (string) Str::uuid(), 'visitor_id' => (string) Str::uuid(),
            'session_id' => (string) Str::uuid(), 'event_type' => 'page_view', 'path' => '/catalogo', 'device' => 'desktop'], $extra);
    }

    private function admin(): void
    {
        Role::firstOrCreate(['name' => 'SUPER_ADMIN', 'guard_name' => 'web']);
        $user = User::factory()->create(); $user->assignRole('SUPER_ADMIN'); $this->actingAs($user, 'sanctum');
    }

    public function test_record_is_anonymous_idempotent_and_excludes_private_pages_and_bots(): void
    {
        $event = $this->event();
        $this->postJson('/api/analytics/events', $event)->assertNoContent();
        $this->postJson('/api/analytics/events', $event)->assertNoContent();
        $this->assertDatabaseCount('site_events', 1);
        $this->assertDatabaseHas('site_events', ['visitor_hash' => AnalyticsController::sessionHash($event['visitor_id'])]);
        $this->postJson('/api/analytics/events', $this->event(['path' => '/admin/piezas']))->assertNoContent();
        $this->withHeader('User-Agent', 'Googlebot')->postJson('/api/analytics/events', $this->event())->assertNoContent();
        $this->assertDatabaseCount('site_events', 1);
        $this->postJson('/api/analytics/events', $this->event(['path' => '/?email=ana@example.test']))->assertUnprocessable();
    }

    public function test_product_event_requires_a_real_piece_and_derives_its_category(): void
    {
        $category = Category::create(['slug' => 'fauna', 'name' => 'Fauna']);
        Product::create(['slug' => 'paujil', 'name' => 'Paujil', 'catalog_code' => 'BO.AGBC-41', 'category_id' => $category->id, 'price' => 3, 'stock' => 3, 'year' => 2017]);
        $this->postJson('/api/analytics/events', $this->event(['event_type' => 'product_view']))->assertUnprocessable();
        $this->postJson('/api/analytics/events', $this->event(['event_type' => 'product_view', 'product_slug' => 'paujil']))->assertNoContent();
        $this->assertDatabaseHas('site_events', ['category_slug' => 'fauna', 'product_slug' => 'paujil']);
    }

    public function test_reports_require_staff_permission_and_validate_ranges(): void
    {
        $this->getJson('/api/admin/analytics')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum')->getJson('/api/admin/analytics')->assertForbidden();
        $this->admin();
        $this->getJson('/api/admin/analytics?from=2020-01-01&to=2026-10-12')->assertUnprocessable();
        $this->getJson('/api/admin/analytics?from=2026-10-12&to=2026-10-11')->assertUnprocessable();
        $this->getJson('/api/admin/analytics?from=2026-10-12&to=2026-10-12')->assertOk()
            ->assertJsonPath('data.kpis.page_views', 0)->assertJsonPath('data.kpis.conversion_percent', 0)
            ->assertJsonPath('data.last_visit', null)->assertJsonCount(1, 'data.timeline');
    }

    public function test_report_uses_bolivian_day_boundaries_and_real_order_conversion(): void
    {
        $this->travelTo(now('UTC')->setDateTime(2026, 10, 12, 15, 0, 0));
        $session = (string) Str::uuid();
        $a = $this->event(['session_id' => $session]);
        $b = $this->event();
        foreach ([[$a, '2026-10-12 04:01:00'], [$a, '2026-10-12 05:00:00'], [$b, '2026-10-13 03:59:00'], [$b, '2026-10-12 03:59:00']] as [$event, $time]) {
            $this->postJson('/api/analytics/events', array_merge($event, ['event_id' => (string) Str::uuid()]))->assertNoContent();
            DB::table('site_events')->where('id', DB::table('site_events')->max('id'))->update(['occurred_at' => $time]);
        }
        $this->postJson('/api/analytics/events', $this->event(['session_id' => $session, 'visitor_id' => $a['visitor_id'], 'event_type' => 'checkout_started']))->assertNoContent();
        foreach ([['PAYMENT_VERIFIED', $session, 20], ['CANCELLED', $b['session_id'], 100], ['VAULT_VERIFIED', null, 10]] as [$status, $id, $value]) {
            Order::create(['order_number' => (string) Str::uuid(), 'customer_name' => 'Ana', 'customer_email' => 'ana@example.test',
                'shipping_address' => 'Calle 1', 'city' => 'La Paz', 'department' => 'La Paz', 'payment_method' => 'QR_TRANSFER',
                'total_amount' => $value, 'status' => $status, 'analytics_session_hash' => $id ? AnalyticsController::sessionHash($id) : null]);
        }
        $this->admin();
        $this->getJson('/api/admin/analytics?from=2026-10-12&to=2026-10-12')->assertOk()
            ->assertJsonPath('data.kpis.page_views', 3)->assertJsonPath('data.kpis.sessions', 2)
            ->assertJsonPath('data.kpis.conversion_percent', 50)->assertJsonPath('data.kpis.orders', 2)
            ->assertJsonPath('data.kpis.cancelled_orders', 1)->assertJsonPath('data.kpis.order_value', 30)
            ->assertJsonPath('data.kpis.verified_order_value', 20)->assertJsonPath('data.timeline.0.views', 3)
            ->assertJsonPath('data.pages.0.path', '/catalogo')->assertJsonPath('data.totals.page_views', 4);
    }

    public function test_order_records_the_hashed_browser_session(): void
    {
        $category = Category::create(['slug' => 'sellos', 'name' => 'Sellos']);
        $piece = Product::create(['slug' => 'sello', 'name' => 'Sello', 'catalog_code' => 'A', 'category_id' => $category->id, 'price' => 3, 'stock' => 3, 'year' => 2026, 'is_active' => true]);
        $session = (string) Str::uuid();
        $this->postJson('/api/orders', ['customer_name' => 'Ana', 'customer_email' => 'ana@example.test', 'shipping_address' => 'Calle 1',
            'city' => 'La Paz', 'department' => 'La Paz', 'payment_method' => 'QR_TRANSFER', 'analytics_session' => $session,
            'items' => [['product_id' => $piece->id, 'quantity' => 1]]])->assertCreated();
        $this->assertDatabaseHas('orders', ['analytics_session_hash' => AnalyticsController::sessionHash($session)]);
    }
}
