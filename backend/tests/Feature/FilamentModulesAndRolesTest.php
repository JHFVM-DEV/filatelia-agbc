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

    public function test_warehouse_can_access_its_modules_and_not_security(): void
    {
        $user = $this->getUserWithRole('ADMIN_PRODUCTOS_ALMACEN');
        $this->actingAs($user)->get('/admin')->assertOk();
        foreach (['products', 'orders', 'inventory-page', 'dispatch-page', 'shipments', 'reports-page'] as $module) {
            $this->actingAs($user)->get('/admin/' . $module)->assertOk();
        }
        foreach (['role-permission-page', 'system-health-page', 'log-viewer-page'] as $module) {
            $this->actingAs($user)->get('/admin/' . $module)->assertForbidden();
        }
    }

    public function test_client_cannot_access_the_admin_panel(): void
    {
        $user = $this->getUserWithRole('CLIENTE');
        $this->actingAs($user)->get('/admin')->assertForbidden();
    }
}