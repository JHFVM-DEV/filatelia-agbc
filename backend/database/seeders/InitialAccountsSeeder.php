<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class InitialAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['email' => 'admin@filatelia.bo', 'name' => 'Super Admin (Director General)', 'password' => 'Admin12345!', 'role' => 'SUPER_ADMIN'],
            ['email' => 'almacen@filatelia.bo', 'name' => 'Encargado de Almacén y Productos', 'password' => 'Almacen12345!', 'role' => 'ADMIN_PRODUCTOS_ALMACEN'],
            ['email' => 'coleccionista@filatelia.bo', 'name' => 'Dr. Fernando Arze (Coleccionista)', 'password' => 'Cliente12345!', 'role' => 'CLIENTE'],
        ];
        foreach ($accounts as $account) {
            $user = User::firstOrCreate(['email' => $account['email']], [
                'name' => $account['name'], 'password' => $account['password'],
            ]);
            if ($user->wasRecentlyCreated) {
                $user->assignRole(Role::firstOrCreate(['name' => $account['role'], 'guard_name' => 'web']));
                $user->forceFill(['email_verified_at' => now()])->save();
            }
        }
    }
}
