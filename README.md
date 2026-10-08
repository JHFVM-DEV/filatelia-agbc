# 🇧🇴 Filatelia Bolivia — Correos de Bolivia

Plataforma oficial de catalogación, peritaje numismático/filatélico, venta y custodia física de piezas postales conmemorativas y patrimoniales de Bolivia.

---

## 🏛️ Arquitectura del Sistema

* **Backend:** Laravel 11 (PHP 8.2+) con arquitectura REST API, autenticación Sanctum, auditoría de eventos y base de datos relacional **PostgreSQL**.
* **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS con renderizado optimizado, visor con lupa 10x y modo pantalla completa 100% HD.
* **Base de Datos:** PostgreSQL 14+ con migraciones estructuradas, transacciones ACID para control de stock en bóveda y telemetría de eventos.

---

## 🚀 Guía de Despliegue en Servidor de Producción

### 1. Requisitos Previos en el Servidor (Ubuntu / Debian / RHEL)
* **PHP:** >= 8.2 con extensiones `php-pgsql`, `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-gd`.
* **Composer:** >= 2.x
* **PostgreSQL:** >= 14
* **Node.js:** >= 20.x y `npm`
* **Servidor Web:** Nginx o Apache con soporte para proxy inverso.
* **Gestor de Procesos:** PM2 o `systemd` para mantener Next.js y Laravel ejecutándose.

---

### 2. Clonar el Repositorio
```bash
git clone https://github.com/JHFVM-DEV/filatelia-agbc.git
cd filatelia-agbc
```

---

### 3. Configuración y Puesta en Marcha del Backend (Laravel)

1. **Entrar al directorio backend e instalar dependencias:**
   ```bash
   cd backend
   composer install --no-dev --optimize-autoloader
   ```

2. **Configurar el archivo `.env`:**
   ```bash
   cp .env.example .env
   ```
   Abra `.env` y ajuste sus credenciales de PostgreSQL y dominio:
   ```ini
   APP_NAME="Filatelia Bolivia"
   APP_ENV=production
   APP_KEY=
   APP_DEBUG=false
   APP_URL=https://api.filatelia.agbc.gob.bo

   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=filatelia_db
   DB_USERNAME=postgres
   DB_PASSWORD=tu_password_seguro

   FRONTEND_URL=https://filatelia.agbc.gob.bo
   SANCTUM_STATEFUL_DOMAINS=filatelia.agbc.gob.bo
   ```

3. **Generar la clave de encriptación:**
   ```bash
   php artisan key:generate
   ```

4. **Crear la base de datos en PostgreSQL y ejecutar las migraciones:**
   ```bash
   # En PostgreSQL: CREATE DATABASE filatelia_db;
   php artisan migrate --force
   php artisan db:seed --force
   ```

5. **Enlazar el almacenamiento público y optimizar cachés:**
   ```bash
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

6. **Permisos de carpetas (Linux):**
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

---

### 4. Configuración y Puesta en Marcha del Frontend (Next.js)

1. **Entrar al directorio frontend e instalar dependencias:**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configurar el archivo de variables de entorno:**
   ```bash
   cp .env.example .env.production
   ```
   Indique la URL del backend en `.env.production`:
   ```ini
   NEXT_PUBLIC_API_URL=https://api.filatelia.agbc.gob.bo
   ```

3. **Compilar la aplicación para producción:**
   ```bash
   npm run build
   ```

4. **Iniciar el servicio con PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "filatelia-frontend" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```

---

### 5. Configuración de Nginx (Ejemplo de Producción)

```nginx
# FRONTEND (Next.js en puerto 3000)
server {
    listen 80;
    server_name filatelia.agbc.gob.bo;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# BACKEND API (Laravel en PHP-FPM o puerto 8000)
server {
    listen 80;
    server_name api.filatelia.agbc.gob.bo;
    root /var/www/filatelia-agbc/backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 🖼️ Gestión y Visualización de Imágenes Catalogadas

* **Imágenes Oficiales Precargadas:** El repositorio incluye las **43 fotografías oficiales de alta resolución** de los sellos postales, logos oficiales de Correos de Bolivia y banners en:
  * `frontend/public/images/stamps/`
  * `backend/public/images/stamps/`
* **Carga en PostgreSQL:** Al ejecutar `php artisan db:seed --force`, todas las piezas quedan registradas en la base de datos con sus rutas de imagen correspondientes (`/images/stamps/...`), visibles de forma instantánea en el catálogo público, el visor con lupa 10x y el modo pantalla completa 100% HD.
* **Nuevas imágenes subidas desde el panel:** El comando `php artisan storage:link` crea el enlace simbólico al disco público, permitiendo que cualquier imagen que el personal agregue desde el panel de administración (`/admin/piezas`) se almacene de forma persistente.

---

## 🔐 Credenciales y Roles Oficiales del Sistema

La plataforma opera bajo una arquitectura de **3 roles oficiales** (gestionados con Spatie Permissions y autenticación unificada):

1. **Super Administrador (`SUPER_ADMIN`):**
   * **Correo:** `admin@filatelia.bo`
   * **Contraseña:** `Admin12345!`
   * **Alcance:** Control total de la plataforma, auditoría ejecutiva, gestión de usuarios, roles, métricas globales y configuración del sistema.

2. **Encargado de Productos y Almacén (`ADMIN_PRODUCTOS_ALMACEN`):**
   * **Correo:** `almacen@filatelia.bo`
   * **Contraseña:** `Almacen12345!`
   * **Alcance:** Curaduría del catálogo filatélico oficial, control de existencias físicas en bóveda, registro de emisiones conmemorativas y despacho postal.

3. **Cliente / Coleccionista Oficial (`CLIENTE`):**
   * **Correo:** `coleccionista@filatelia.bo`
   * **Contraseña:** `Cliente12345!`
   * **Alcance:** Acceso al catálogo digital interactivo, visor de alta definición con lupa 10x, listas de deseos, adquisición filatélica y seguimiento de pedidos.

> Se recomienda cambiar las contraseñas predeterminadas tras la puesta en marcha inicial mediante el flujo oficial de inicio de sesión o restablecimiento de contraseña.

