# Precios del catálogo AGBC

`catalog_prices.php` contiene los 48 precios y códigos corregidos facilitados el
9 de octubre de 2026. Los importes son los valores del sello indicados por el usuario.

La correspondencia se hace por el slug existente, conservando el identificador,
las existencias, el estado de publicación y la información de custodia. Los
precios de pedidos anteriores no se recalculan. Las piezas ausentes se informan
y no se crean durante esta actualización.

Desde el directorio `backend`, con la conexión de la base que se desea actualizar:

```sh
php artisan catalog:update-prices
php artisan catalog:update-prices --apply
```

La primera ejecución muestra la comparación sin guardar cambios. La segunda
guarda los valores anteriores en `storage/app/private/catalog-prices`, aplica los
cambios en una transacción y elimina las entradas de caché del catálogo afectado.
También se puede ejecutar únicamente `CatalogPriceSeeder`:

```sh
php artisan db:seed --class=CatalogPriceSeeder --force
```

No ejecutar el seeder completo para actualizar precios en una base en uso:
incluye usuarios, inventarios y pedidos de demostración.

## Correspondencias pendientes

El catálogo original de 43 productos tiene 42 coincidencias con la tabla.
Estas cinco piezas no estaban registradas individualmente:

- BO.AGBC-11: Abolición del Pongueaje, Bs. 1,90.
- BO.AGBC-13: CEFILCO, homenaje CFC, Bs. 3,50.
- BO.AGBC-15: Cámara de Industria, Bs. 9,00.
- BO.AGBC-17: Epifanía, Bs. 6,50.
- BO.AGBC-18: Sagrada Familia, Bs. 3,50.

En los datos semilla se incorporan con stock cero y sin publicación hasta
confirmar el inventario. Las imágenes disponibles son las de sus conjuntos.

BO.AGBC-44, «100 años Amigos de la Ciudad», Bs. 50,00, no tiene una correspondencia
confirmada. Su slug permanece nulo y se omite. La imagen del producto
`150-anos-primer-sello-postal-boliviano-2017` muestra «150 años» y Bs. 5,00;
es otra emisión y conserva los datos originales, sin asignarle BO.AGBC-44.

La base configurada localmente es PostgreSQL en 127.0.0.1:5432. Tras reinstalar
PostgreSQL, se aplicaron los precios y códigos a las 42 piezas coincidentes el
9 de octubre de 2026. La segunda comparación confirmó cero cambios pendientes
para esas piezas. Las seis piezas ausentes indicadas arriba no se crearon en la
base existente. Se guardó un respaldo de los valores anteriores en
`storage/app/private/catalog-prices`.
