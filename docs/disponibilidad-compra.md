# Disponibilidad de compra

En el panel, abrir **Bóveda & Logística → Disponibilidad de compra**.

- Cambiar una pieza mediante su botón Habilitar/Deshabilitar.
- Marcar varias piezas y aplicar la acción a la selección.
- Habilitar o deshabilitar todas las piezas del sistema, con confirmación.
  Esta acción incluye las piezas ocultas por los filtros de la pantalla.
- Buscar por nombre/código y filtrar piezas habilitadas, deshabilitadas o agotadas.

Las piezas se mantienen visibles en el catálogo, sus fichas y la vitrina externa.
Se utiliza `is_active` para habilitar la compra, no para ocultar la ficha.
Un stock de cero muestra **AGOTADO**. Un stock positivo con compra deshabilitada
muestra únicamente el botón **No disponible**, sin banner adicional. Habilitar todo no modifica el inventario ni
permite comprar piezas agotadas.

El catálogo, la ficha y el carrito bloquean la adquisición según estos estados.
El servidor vuelve a validar disponibilidad y stock al registrar el pedido,
dentro de una transacción con bloqueo de productos. No se generan compras de
demostración al recibir errores del servidor o quedarse sin conexión.
Las acciones masivas se registran en la auditoría y requieren permiso de Productos.

La selección de **Vitrina Correos Market** es independiente de la compra: todas
las piezas pueden seleccionarse, incluidas las deshabilitadas y agotadas.
El endpoint `/api/external/showcase` respeta la selección y el orden guardados,
sin agregar piezas para completar cuatro. Guardar una selección vacía deja la
vitrina vacía. No se modifican los precios, las existencias ni la habilitación de compra.

## Producción

Publicar los cambios de backend y frontend, actualizar la caché de rutas de
Laravel y recompilar/reiniciar Next.js según la guía de actualización. No se
necesita una nueva migración: se reutilizan `is_active` y `stock`.
Para retirar la lista pública anterior de la caché después del despliegue:

```sh
php artisan cache:forget public_catalog_default
php artisan route:cache
```

Una página ya abierta necesita recargarse para ver cambios hechos por otro
administrador. El servidor valida el estado actual incluso si el carrito del
cliente conserva información anterior.
