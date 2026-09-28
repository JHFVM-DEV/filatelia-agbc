<?php

namespace App\Filament\Pages;

use BackedEnum;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionPage extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedKey;

    protected static ?string $navigationLabel = 'Permisos & Roles';

    protected static ?string $title = 'Matriz Institucional de Permisos y Control de Acceso';

    protected static \UnitEnum|string|null $navigationGroup = 'Administración y Seguridad';

    protected static ?int $navigationSort = 2;

    protected string $view = 'filament.pages.role-permission-page';

    public $matrix = [];

    public static function canAccess(): bool
    {
        return auth()->user()?->hasRole('SUPER_ADMIN') ?? false;
    }

    public function mount(): void
    {
        $modules = $this->getModulesList();

        // Ensure permissions exist in database
        foreach ($modules as $mod) {
            Permission::firstOrCreate(['name' => $mod, 'guard_name' => 'web']);
        }

        $almacenRole = Role::findByName('ADMIN_PRODUCTOS_ALMACEN', 'web');
        $almacenPermissions = $almacenRole ? $almacenRole->permissions->pluck('name')->flip()->map(fn () => true)->toArray() : [];

        foreach ($modules as $mod) {
            $this->matrix[$mod]['SUPER_ADMIN'] = true;
            $this->matrix[$mod]['ADMIN_PRODUCTOS_ALMACEN'] = isset($almacenPermissions[$mod]);
        }
    }

    public function togglePermission(string $module, string $role): void
    {
        if ($role === 'SUPER_ADMIN') {
            // Super Admin always has full access
            $this->matrix[$module][$role] = true;
            return;
        }

        $this->matrix[$module][$role] = !($this->matrix[$module][$role] ?? false);

        Notification::make()
            ->title('Permiso Modificado')
            ->body("Permiso para '{$module}' en rol '{$role}' actualizado.")
            ->success()
            ->send();
    }

    public function saveMatrix(): void
    {
        $almacenRole = Role::findByName('ADMIN_PRODUCTOS_ALMACEN', 'web');
        if ($almacenRole) {
            $allowedForAlmacen = [];
            foreach ($this->getModulesList() as $module) {
                if (!empty($this->matrix[$module]['ADMIN_PRODUCTOS_ALMACEN'])) {
                    $allowedForAlmacen[] = $module;
                }
            }
            $almacenRole->syncPermissions($allowedForAlmacen);
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        }

        Notification::make()
            ->title('Matriz de Permisos Guardada')
            ->body('Las políticas de acceso han sido sincronizadas en la base de datos.')
            ->success()
            ->send();
    }

    public function getModulesList(): array
    {
        return [
            'Emisiones',
            'Productos',
            'Pedidos',
            'Inventario',
            'Despacho',
            'Envíos',
            'Soporte',
            'Usuarios',
            'Reportes',
            'Ver Tienda',
            'Notificaciones',
            'Permisos',
            'Monitoreo Pulse',
            'Visor de Logs',
        ];
    }
}
