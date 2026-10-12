# Revisión del panel administrativo — 12 de octubre de 2026

Se revisaron formularios y conexiones del panel, autorización del backend,
productos, categorías y emisiones, usuarios y permisos, pedidos, inventario,
despacho y envíos, informes, logs, vitrina e impresión de fichas. La suite de
pruebas verifica los endpoints de consulta y varias operaciones de cada módulo.
Esto no equivale a haber probado visualmente cada pantalla en el navegador.

## Corregido

- Alta y edición de piezas: carga de anverso y reverso con vista previa,
  validación de formato y límite de 2 MB. No se asigna la foto de otro sello
  cuando no se sube una imagen. Los formularios largos permiten desplazamiento.
- Guardado de imágenes: nombres generados por el servidor; no se permiten SVG
  ni archivos ejecutables. Los archivos recién subidos se eliminan si falla el guardado.
- Catálogo: los cambios en productos invalidan la caché pública de la lista
  y de la ficha, incluidos precio, stock, imagen y publicación.
- Historial: no se permite eliminar piezas asociadas a pedidos o movimientos
  de inventario. Se añadió el control para desactivarlas en el catálogo.
- Permisos: el correo institucional no otorga privilegios por sí solo; se
  utilizan el rol y los permisos asignados.
- Reportes: los pedidos cancelados no inflan el promedio ni la recaudación
  por departamento.
- QR y enlaces públicos: la ruta de la pieza abre su ficha en el catálogo;
  los rótulos ya impresos conservan sus enlaces.
- Producción: el destino del proxy de API y almacenamiento puede configurarse
  con `BACKEND_URL`.

## Mejoras siguientes

1. Añadir paginación del servidor a listados que actualmente descargan todos
   los registros, especialmente productos, pedidos, envíos y usuarios.
2. Unificar la comunicación de errores y expiración de sesión en todas las
   pantallas; aún hay módulos con `alert` y errores poco descriptivos.
3. Registrar ajustes rápidos de stock del listado de productos como movimientos
   de inventario con motivo y usuario, y usar incrementos atómicos para evitar
   perder cambios simultáneos. El módulo de inventario ya tiene transacciones.
4. Separar la elección de un código de seguimiento real de los códigos
   sugeridos aleatoriamente en la mesa de despacho.
5. Completar pruebas visuales en móvil, teclado y sesiones con permisos
   parciales, y definir una política para retirar imágenes antiguas sin borrar
   archivos compartidos ni imágenes relacionadas con el historial.

Despliegue: consultar `actualizar-produccion.md`.
