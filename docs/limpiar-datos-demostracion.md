# Retirar datos de demostración existentes en producción

El seeder actual no crea pedidos, envíos, tickets ni movimientos ficticios.
Actualizar el código y ejecutar `DatabaseSeeder` no elimina los registros que
crearon versiones anteriores. No usar `migrate:fresh`, `db:wipe`, `TRUNCATE` ni
vaciar tablas para limpiarlos.

## Hallazgos del repositorio

La revisión del seeder histórico del commit `94868e4` y del código actual encontró:

| Tipo | Identificación histórica | Tratamiento |
| --- | --- | --- |
| Seis pedidos de la captura | `ORD-2026-0101` a `ORD-2026-0106` | Cotejar código, correo y notas antes de retirar |
| Tres pedidos de simulación | `BO-FIL-2026-ENR782`, `BO-FIL-2026-GLS491`, `BO-FIL-2026-DEL103` | Confirmar origen; pertenecían a `jhefersonveizagamujica@gmail.com` |
| Un pedido existente modificado por la simulación | `BO-FIL-2026-KPEFX3` | No asumir que es ficticio: el seeder modificó su estado y envío, no lo creó |
| Envíos de los pedidos anteriores | Guías incluidas en la consulta de auditoría | Retirar únicamente los ligados a pedidos confirmados ficticios |
| Tres tickets | `TCK-2026-001`, `TCK-2026-002`, `TCK-2026-003` | Cotejar correo y texto; el seeder utilizó IDs de pedido fijos 1, 2 y 3 |
| Dos movimientos de inventario | Motivos incluidos en la consulta | Cotejar notas y cantidades; conservar existencias reales |
| Cinco productos antiguos de ejemplo | Slugs incluidos en la consulta | Revisar relaciones antes de eliminar |
| Tres emisiones antiguas de ejemplo | Slugs incluidos en la consulta | Conservar si están asociadas a catálogo real |
| Cuentas históricas adicionales | Correos incluidos en la consulta | Auditar; su existencia no autoriza borrar usuarios ni sus compras |

Las firmas de los seis pedidos iniciales son:

| Pedido | Correo histórico |
| --- | --- |
| ORD-2026-0101 | cmesa@historiabolivia.org |
| ORD-2026-0102 | roberto.justiniano@empresa.bo |
| ORD-2026-0103 | elena.torrico@medicina.bo |
| ORD-2026-0104 | coleccionista@filatelia.bo |
| ORD-2026-0105 | mvaca@tarijapatrimonio.org |
| ORD-2026-0106 | pbeltran@cultura.gob.bo |

Su nota original era `Manipular exclusivamente con guantes de algodón. Bóveda
Central Correos.` Los importes y estados pueden haber cambiado; no identificarlos
solo por monto, estado, prefijo de código o ID numérico.

Los tickets originales trataban sobre autenticidad del tríptico de arte sacro,
horario de entrega en Santa Cruz y embalaje glassine, respectivamente. Sus
correos eran los de los pedidos 0101, 0102 y 0103.

Los movimientos originales registraban una entrada de 10 unidades, de 0 a 10,
con nota `Custodia en Bóveda A1 - Caja de Seguridad Oficial.`, y una salida de
una unidad, de 10 a 9, con nota `Salida para embalaje en valija asegurada.`
Ese seeder creaba las filas del historial sin descontar el stock del producto:
eliminar el historial no implica sumar unidades al stock actual.

## 1. Respaldar y consultar

Crear un respaldo completo con el procedimiento habitual del servidor, comprobar
que se puede restaurar en una base separada y guardar la lista de registros que
se van a retirar. Mantener el respaldo y los resultados fuera del repositorio:
contienen datos de clientes.

Ejecutar [auditar-datos-demostracion.sql](auditar-datos-demostracion.sql) contra
PostgreSQL de producción. Es una transacción de solo lectura. Por ejemplo, con
las variables de conexión del servidor ya configuradas, desde la raíz del repo:

```sh
psql -X -v ON_ERROR_STOP=1 -f docs/auditar-datos-demostracion.sql
```

La consulta detecta candidatos, no certifica que sean ficticios. Revisar pagos,
entregas, cambios posteriores y relaciones antes de confirmar cada fila. Esta
revisión del repositorio no consulta la base de producción; allí pueden existir
otras pruebas manuales sin las firmas históricas conocidas.

## 2. Limpiar únicamente lo confirmado

Probar primero sobre una copia restaurada. Preparar listas explícitas de IDs
confirmados por tabla y realizar la operación durante una pausa de escrituras.
Este ejemplo solo selecciona el pedido 0101 si conserva su firma original;
debe adaptarse a cada registro revisado. Termina con `ROLLBACK` para ensayar:

```sql
BEGIN;

SELECT id, order_number, customer_email, special_notes
FROM orders
WHERE order_number = 'ORD-2026-0101'
  AND customer_email = 'cmesa@historiabolivia.org'
  AND special_notes = 'Manipular exclusivamente con guantes de algodón. Bóveda Central Correos.'
FOR UPDATE;

DELETE FROM orders
WHERE order_number = 'ORD-2026-0101'
  AND customer_email = 'cmesa@historiabolivia.org'
  AND special_notes = 'Manipular exclusivamente con guantes de algodón. Bóveda Central Correos.'
RETURNING id, order_number;

ROLLBACK;
```

Con el esquema del repositorio, borrar un pedido elimina en cascada sus
`order_items` y `shipments`. Los tickets relacionados quedan con `order_id`
nulo: retirar los tickets ficticios por sus propios IDs y firmas, no todos los
tickets de un pedido. Revisar las restricciones mostradas por la auditoría por
si el servidor tiene otras relaciones.

Para aplicar la limpieza revisada, cambiar el `ROLLBACK` del ensayo por `COMMIT`
solo después de validar la lista y el resultado en la copia. No ejecutar borrados
amplios por correo, porque una cuenta de prueba también puede tener compras reales.

Retirar movimientos ficticios de manera separada; no reajustar automáticamente
existencias. No borrar sellos originales aunque aparezcan en pedidos de prueba.
Eliminar productos o emisiones antiguos únicamente después de revisar sus
dependencias: varias relaciones de productos tienen borrado en cascada.

La migración histórica
`2026_10_09_120000_purge_fictitious_example_products_from_database.php` ya retiraba
cinco productos ficticios y podía reasignar sus pedidos/movimientos a un sello
real. Su ausencia actual no demuestra que los pedidos ficticios hayan desaparecido.
No volver a ejecutar esa migración para intentar limpiar pedidos.

## 3. Conservar y verificar

Conservar las tres cuentas iniciales autorizadas (`admin@filatelia.bo`,
`almacen@filatelia.bo`, `coleccionista@filatelia.bo`) con sus credenciales existentes.
Conservar catálogo original, precios AGBC, existencias, selección de vitrina,
usuarios reales y métricas de visitas. Los ejemplos de la documentación API y
las fábricas utilizadas por pruebas no son registros de producción.

Repetir la consulta de auditoría y comprobar pedidos, envíos, soporte, historial
de inventario y totales del panel. Las métricas comerciales deben recalcularse
sin los pedidos retirados. Documentar los IDs eliminados y conservar el respaldo.
