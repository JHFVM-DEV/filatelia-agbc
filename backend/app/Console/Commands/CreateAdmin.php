<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create';
    protected $description = 'Crear explícitamente una cuenta administrativa sin usuarios ni contraseñas de demostración';

    public function handle(): int
    {
        $role = $this->getDefinition()->hasOption('role') ? (string) $this->option('role') : 'SUPER_ADMIN';
        if (!in_array($role, ['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'CLIENTE'], true)) {
            $this->error('Rol inválido. Usa SUPER_ADMIN, ADMIN_PRODUCTOS_ALMACEN o CLIENTE.');
            return self::FAILURE;
        }
        $data = [
            'name' => trim((string) $this->ask('Nombre completo')),
            'email' => strtolower(trim((string) $this->ask('Correo electrónico'))),
            'password' => $this->secret('Contraseña'),
            'password_confirmation' => $this->secret('Confirmar contraseña'),
        ];
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);
        if ($validator->fails()) {
            $this->error($validator->errors()->first());
            return self::FAILURE;
        }
        DB::transaction(function () use ($data, $role) {
            $user = User::create(array_intersect_key($data, array_flip(['name', 'email', 'password'])));
            $user->assignRole(Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']));
            $user->forceFill(['email_verified_at' => now()])->save();
        });
        $this->info($role === 'SUPER_ADMIN' ? 'Cuenta administrativa creada correctamente.' : "Cuenta creada correctamente con el rol {$role}.");
        return self::SUCCESS;
    }
}
