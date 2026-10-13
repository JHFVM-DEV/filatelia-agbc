# Actualizar una instalación existente

Esta guía conserva usuarios, pedidos, inventario y archivos. No usar
`migrate:fresh` ni `db:wipe`. Para actualizar precios usar el actualizador
específico; el `DatabaseSeeder` completo también inicializa categorías, emisiones
y piezas del catálogo. Ya no genera actividad de demostración. No reemplazar
`.env` ni regenerar `APP_KEY` en una instalación existente.

## 1. Preparar y publicar

Guardar un respaldo de PostgreSQL y de `backend/storage/app/public`. Publicar
los cambios en el repositorio o mediante el mecanismo de despliegue del servidor.
En el servidor, actualizar el código de la rama que se usa en producción.
Los cambios de la base local no se transfieren automáticamente al servidor.

## 2. Backend

Desde `backend`:

```sh
composer install --no-dev --optimize-autoloader
php artisan migrate --path=database/migrations/2026_10_12_120000_add_customer_details_to_users.php --force
php artisan migrate --path=database/migrations/2026_10_12_180000_create_site_analytics.php --force
php artisan migrate --path=database/migrations/2026_10_13_090000_allow_anonymous_site_events.php --force
php artisan db:seed --class=DatabaseSeeder --force
php artisan catalog:update-prices
php artisan catalog:update-prices --apply
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

La migración agrega los campos de contacto y dirección. Si ya se ejecutó, no
los vuelve a crear. La segunda migración habilita las métricas web y la relación
anónima de visitas con pedidos. Los informes empiezan a registrar visitas con
esta versión; consultar [Métricas web y negocio](metricas-web.md).
El primer comando de precios muestra la comparación; el
segundo aplica los precios, códigos y valores faciales de las piezas existentes
y guarda un respaldo en `storage/app/private/catalog-prices`.
El seeder limpio inicializa roles, permisos y piezas originales que falten;
crea las tres cuentas iniciales autorizadas cuando faltan, sin operaciones ficticias, y conserva las existencias de las
piezas presentes. Las piezas que falten se crean con stock cero.

Revisar `APP_URL` y `FRONTEND_URL` con los dominios HTTPS reales. Conservar las
credenciales de PostgreSQL y la clave existentes. PHP debe poder escribir en
`storage` y `bootstrap/cache`; el servidor debe servir `public/storage`.
Las imágenes admitidas son JPG, PNG y WebP de hasta 2 MB por lado. PHP debe
admitir `upload_max_filesize` de al menos 2M y `post_max_size` de al menos 8M.
Si hay Nginx, configurar `client_max_body_size 8m` o superior para esta aplicación.
Las instalaciones que intercambian releases deben conservar un almacenamiento
compartido para que las imágenes no se pierdan al publicar la siguiente versión.

## 3. Frontend

Configurar `BACKEND_URL` con el origen real de Laravel, sin agregar `/api` al
final. Puede ser la URL interna si Next.js llega al backend por la red interna.
El frontend reenviará `/api` y `/storage` a ese origen. Si se usa
`NEXT_PUBLIC_API_URL` para acceder a la API directamente desde el navegador,
debe tener HTTPS y CORS configurado; no debe apuntar al propio frontend porque
generaría un bucle en el proxy.

Desde `frontend`:

```sh
npm ci
npm run build
```

Si aparece un error interno de Turbopack al procesar CSS (observado en Windows),
la compilación alternativa es `npm run build -- --webpack`. La descarga de las
fuentes existentes requiere acceso a Google Fonts durante la compilación.

Después, reiniciar el proceso Next.js usando el gestor que ya tiene el servidor.
Si sigue la configuración PM2 del README, el nombre configurado es
`filatelia-frontend`:

```sh
pm2 restart filatelia-frontend --update-env
```

Reiniciar o recargar PHP-FPM si el servidor conserva código antiguo mediante
OPcache. No crear otro proceso Next.js encima del existente.

## 4. Verificar

El `DatabaseSeeder` crea automáticamente las cuentas iniciales solicitadas:

| Rol | Correo | Contraseña inicial |
| --- | --- | --- |
| Administrador | admin@filatelia.bo | Admin12345! |
| Almacén | almacen@filatelia.bo | Almacen12345! |
| Cliente | coleccionista@filatelia.bo | Cliente12345! |

Se crean verificadas únicamente si no existen. Si una cuenta ya existe, se
conservan su contraseña, nombre y roles. No es necesario ejecutar los comandos
de creación manual. Estos siguen disponibles para crear otras cuentas con
credenciales elegidas de forma interactiva.

- Crear una cuenta de prueba: país, teléfono y dirección se deben guardar y
  aparecer en el perfil.
- Comprobar un precio conocido, por ejemplo Paujil: Bs. 3,00.
- Crear una pieza de prueba con imagen y comprobar que se ve en el catálogo.
- Abrir un rótulo QR: debe mostrar la ficha de la pieza en el catálogo.
- Con almacén, comprobar productos e inventario y que no puede gestionar usuarios
  o permisos. Con cliente, comprobar que no puede entrar al panel administrativo.

El actualizador no crea piezas ni modifica sus existencias. El seeder limpio sí
puede incorporar BO.AGBC-11, 13, 15, 17 y 18 si faltan, con stock cero. BO.AGBC-44
sigue pendiente de identificación y no se crea.

## Inicialización del catálogo sin datos de demostración

Si se desea inicializar el catálogo original en una instalación nueva:

```sh
php artisan db:seed --class=DatabaseSeeder --force
```

Este comando crea las tres cuentas iniciales anteriores si faltan. En una base
existente se conservan sus usuarios y contraseñas.
El catálogo agrega piezas ausentes con stock cero y no sobrescribe el inventario
de las piezas existentes. Los precios y códigos se sincronizan con la tabla AGBC.
Esta limpieza del seeder no borra demostraciones que ya existan en la base;
su retirada debe distinguirlas de pedidos, clientes e inventario reales.

Para detectar y retirar registros de versiones anteriores, seguir la
[guía de limpieza de datos de demostración](limpiar-datos-demostracion.md).
Incluye una consulta PostgreSQL de solo lectura y un procedimiento con respaldo
y ensayo que conserva las cuentas iniciales y el catálogo original.
