<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilamentModulesAndRolesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function getUserWithRole(string $roleName): User
    {
        return User::role($roleName)->first();
    }

    public function test_super_admin_can_access_all_15_modules(): void
    {
        $admin = $this->getUserWithRole('SUPER_ADMIN');

        // Dashboard
        $this->actingAs($admin)->get('/admin')->assertStatus(200);

        // Recursos y Páginas de los 15 Módulos
        $modules = [
            '/admin/emissions',
            '/admin/products',
            '/admin/categories',
            '/admin/orders',
            '/admin/inventory-page',
            '/admin/dispatch-page',
            '/admin/shipments',
            '/admin/support-tickets',
            '/admin/users',
            '/admin/reports-page',
            '/admin/role-permission-page',
            '/admin/system-health-page',
            '/admin/log-viewer-page',
        ];

        foreach ($modules as $url) {
            $resp = $this->actingAs($admin)->get($url);
            $this->assertEquals(
                200, 
                $resp->status(), 
                "Fallo de acceso para Super Admin en {$url} con status {$resp->status()}"
            );
        }
    }

    public function test_admin_filatelia_dashboard_and_modules(): void
    {
        $user = $this->getUserWithRole('ADMIN_FILATELIA');

        // Dashboard
        $resp = $this->actingAs($user)->get('/admin');
        $resp->assertStatus(200);

        // Módulos filatélicos permitidos
        $this->actingAs($user)->get('/admin/emissions')->assertStatus(200);
        $this->actingAs($user)->get('/admin/products')->assertStatus(200);
        $this->actingAs($user)->get('/admin/categories')->assertStatus(200);
        $this->actingAs($user)->get('/admin/orders')->assertStatus(200);
        $this->actingAs($user)->get('/admin/inventory-page')->assertStatus(200);
        $this->actingAs($user)->get('/admin/reports-page')->assertStatus(200);
    }

    public function test_almacen_dashboard_and_modules(): void
    {
        $user = $this->getUserWithRole('ALMACEN');

        // Dashboard
        $resp = $this->actingAs($user)->get('/admin');
        $resp->assertStatus(200);

        // Módulos de almacén y despacho permitidos
        $this->actingAs($user)->get('/admin/products')->assertStatus(200);
        $this->actingAs($user)->get('/admin/orders')->assertStatus(200);
        $this->actingAs($user)->get('/admin/inventory-page')->assertStatus(200);
        $this->actingAs($user)->get('/admin/dispatch-page')->assertStatus(200);
        $this->actingAs($user)->get('/admin/shipments')->assertStatus(200);
    }

    public function test_atencion_dashboard_and_modules(): void
    {
        $user = $this->getUserWithRole('ATENCION');

        // Dashboard
        $resp = $this->actingAs($user)->get('/admin');
        $resp->assertStatus(200);

        // Módulos de soporte y atención permitidos
        $this->actingAs($user)->get('/admin/orders')->assertStatus(200);
        $this->actingAs($user)->get('/admin/support-tickets')->assertStatus(200);
    }
}
