<?php

namespace App\Console\Commands;

class CreateUser extends CreateAdmin
{
    protected $signature = 'user:create {--role=CLIENTE : SUPER_ADMIN, ADMIN_PRODUCTOS_ALMACEN o CLIENTE}';
    protected $description = 'Crear una cuenta con el rol elegido y credenciales introducidas de forma interactiva';
}
