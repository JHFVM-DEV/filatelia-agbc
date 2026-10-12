<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Emission;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OriginalCatalogSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_contains_catalog_and_configuration_without_demo_activity(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->assertDatabaseCount('products', 48);
        $this->assertDatabaseCount('categories', 6);
        $this->assertDatabaseCount('emissions', 5);
        $this->assertDatabaseCount('users', 3);
        foreach (['orders', 'order_items', 'shipments', 'support_tickets', 'inventory_movements'] as $table) {
            $this->assertSame(0, DB::table($table)->count(), $table);
        }
        $this->assertTrue(Role::where('name', 'SUPER_ADMIN')->exists());
        $this->assertTrue(Role::where('name', 'ADMIN_PRODUCTOS_ALMACEN')->exists());
        $this->assertTrue(Role::where('name', 'CLIENTE')->exists());
        $this->assertSame(0, (int) Product::sum('stock'));
        $this->assertSame(0, Emission::whereNotNull('official_decree')->count());
        $this->assertSame(0, Emission::whereNotNull('issue_date')->count());
        $this->assertFalse(Product::where('slug', 'condor-1866-10c-verde')->exists());
        $this->assertSame('3.80', Product::where('catalog_code', 'BO.AGBC-1')->firstOrFail()->price);
        $this->assertSame('3.00', Product::where('catalog_code', 'BO.AGBC-41')->firstOrFail()->price);
        $this->seed(DatabaseSeeder::class);
        $this->assertDatabaseCount('products', 48);
        $this->assertDatabaseCount('users', 3);
    }

    public function test_reseeding_preserves_existing_accounts_inventory_and_product_metadata(): void
    {
        $category = Category::create(['slug' => 'mi-categoria', 'name' => 'Mi categoría']);
        $user = User::factory()->create();
        $role = Role::create(['name' => 'ROL_EXISTENTE', 'guard_name' => 'web']);
        $user->assignRole($role);
        $product = Product::create([
            'slug' => 'correo-aereo-50-aniversario-fab-1994', 'name' => 'Nombre verificado en mi catálogo',
            'catalog_code' => 'CODIGO-ANTERIOR', 'category_id' => $category->id, 'price' => 3.8,
            'stock' => 37, 'year' => 1994, 'front_image' => '/storage/imagen-real.png', 'is_active' => false,
        ]);
        $this->seed(DatabaseSeeder::class);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => $product->name, 'stock' => 37,
            'front_image' => '/storage/imagen-real.png', 'is_active' => false, 'category_id' => $category->id]);
        $this->assertDatabaseCount('users', 4);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => $user->email]);
        $this->assertTrue($user->fresh()->hasRole('ROL_EXISTENTE'));
        $this->assertSame('BO.AGBC-1', $product->fresh()->catalog_code);
    }

    public function test_explicit_admin_creation_uses_entered_credentials_and_does_not_overwrite_accounts(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->artisan('admin:create')
            ->expectsQuestion('Nombre completo', 'Responsable real')
            ->expectsQuestion('Correo electrónico', 'responsable@example.test')
            ->expectsQuestion('Contraseña', 'Password123!')
            ->expectsQuestion('Confirmar contraseña', 'Password123!')
            ->expectsOutput('Cuenta administrativa creada correctamente.')->assertExitCode(0);
        $user = User::where('email', 'responsable@example.test')->firstOrFail();
        $this->assertTrue($user->hasRole('SUPER_ADMIN'));
        $this->assertNotNull($user->email_verified_at);
        $password = $user->password;
        $this->artisan('admin:create')
            ->expectsQuestion('Nombre completo', 'Otro nombre')
            ->expectsQuestion('Correo electrónico', 'responsable@example.test')
            ->expectsQuestion('Contraseña', 'DifferentPassword123!')
            ->expectsQuestion('Confirmar contraseña', 'DifferentPassword123!')
            ->assertExitCode(1);
        $this->assertDatabaseCount('users', 4);
        $this->assertSame($password, $user->fresh()->password);
    }

    public function test_production_test_accounts_have_the_selected_roles_and_invalid_roles_are_rejected(): void
    {
        $this->seed(DatabaseSeeder::class);
        foreach (['ADMIN_PRODUCTOS_ALMACEN' => 'almacen@example.test', 'CLIENTE' => 'cliente@example.test'] as $role => $email) {
            $this->artisan('user:create', ['--role' => $role])
                ->expectsQuestion('Nombre completo', 'Cuenta de pruebas')
                ->expectsQuestion('Correo electrónico', $email)
                ->expectsQuestion('Contraseña', 'Password123!')
                ->expectsQuestion('Confirmar contraseña', 'Password123!')
                ->expectsOutput("Cuenta creada correctamente con el rol {$role}.")->assertExitCode(0);
            $user = User::where('email', $email)->firstOrFail();
            $this->assertTrue($user->hasRole($role));
            $this->assertFalse($user->hasRole('SUPER_ADMIN'));
            $this->assertNotNull($user->email_verified_at);
        }
        $this->artisan('user:create', ['--role' => 'NO_EXISTE'])
            ->expectsOutput('Rol inválido. Usa SUPER_ADMIN, ADMIN_PRODUCTOS_ALMACEN o CLIENTE.')->assertExitCode(1);
        $this->assertDatabaseCount('users', 5);
    }

    public function test_initial_accounts_keep_original_credentials_and_do_not_reset_existing_passwords(): void
    {
        $this->seed(DatabaseSeeder::class);
        foreach ([
            'admin@filatelia.bo' => ['Admin12345!', 'SUPER_ADMIN'],
            'almacen@filatelia.bo' => ['Almacen12345!', 'ADMIN_PRODUCTOS_ALMACEN'],
            'coleccionista@filatelia.bo' => ['Cliente12345!', 'CLIENTE'],
        ] as $email => [$password, $role]) {
            $user = User::where('email', $email)->firstOrFail();
            $this->assertTrue(\Illuminate\Support\Facades\Hash::check($password, $user->password));
            $this->assertTrue($user->hasRole($role));
            $this->assertNotNull($user->email_verified_at);
        }
        $admin = User::where('email', 'admin@filatelia.bo')->firstOrFail();
        $admin->update(['password' => 'ChangedPassword123!']);
        $hash = $admin->fresh()->password;
        $this->seed(DatabaseSeeder::class);
        $this->assertSame($hash, $admin->fresh()->password);
        $this->assertDatabaseCount('users', 3);
    }
}
