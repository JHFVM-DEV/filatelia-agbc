-- PostgreSQL. Solo lectura: no elimina ni modifica registros.
-- Ejecutar en la base de producción antes de decidir qué retirar.
BEGIN TRANSACTION READ ONLY;

-- Candidatos por código histórico; cotejar también correo, notas y actividad real.
SELECT id, order_number, customer_name, customer_email, total_amount,
       status, tracking_code, special_notes, created_at
FROM orders
WHERE order_number IN (
    'ORD-2026-0101', 'ORD-2026-0102', 'ORD-2026-0103',
    'ORD-2026-0104', 'ORD-2026-0105', 'ORD-2026-0106',
    'BO-FIL-2026-ENR782', 'BO-FIL-2026-GLS491', 'BO-FIL-2026-DEL103',
    'BO-FIL-2026-KPEFX3'
)
ORDER BY order_number;

SELECT s.id, s.order_id, o.order_number, o.customer_email,
       s.tracking_code, s.status, s.notes
FROM shipments s
JOIN orders o ON o.id = s.order_id
WHERE o.order_number IN (
    'ORD-2026-0101', 'ORD-2026-0102', 'ORD-2026-0103',
    'ORD-2026-0104', 'ORD-2026-0105', 'ORD-2026-0106',
    'BO-FIL-2026-ENR782', 'BO-FIL-2026-GLS491', 'BO-FIL-2026-DEL103',
    'BO-FIL-2026-KPEFX3'
)
OR s.tracking_code IN (
    'BO-CORREOS-LPZ-001', 'BO-CORREOS-SCZ-002', 'BO-CORREOS-CBB-003',
    'BO-CORREOS-CHQ-004', 'BO-CORREOS-ORU-005',
    'BO-CORREOS-LPZ-7821', 'BO-CORREOS-SCZ-4910', 'BO-CORREOS-CBB-1035',
    'TRK-DV2VBXESQJ'
)
ORDER BY s.id;

SELECT id, ticket_code, customer_name, customer_email, order_id, subject,
       message, status, resolution_notes
FROM support_tickets
WHERE ticket_code IN ('TCK-2026-001', 'TCK-2026-002', 'TCK-2026-003');

SELECT id, product_id, user_id, type, quantity, previous_stock, new_stock,
       reason, notes, created_at
FROM inventory_movements
WHERE reason IN (
    'Ingreso inicial por decreto supremo de emisión',
    'Despacho por orden ORD-2026-0101'
);

-- Productos ficticios de versiones anteriores; verificar dependencias.
SELECT p.id, p.slug, p.name, p.stock,
       (SELECT count(*) FROM order_items i WHERE i.product_id = p.id) AS items,
       (SELECT count(*) FROM inventory_movements m WHERE m.product_id = p.id) AS movimientos,
       (SELECT count(*) FROM wishlists w WHERE w.product_id = p.id) AS favoritos,
       (SELECT count(*) FROM price_revaluations r WHERE r.product_id = p.id) AS revalorizaciones
FROM products p
WHERE p.slug IN (
    'condor-1866-10c-verde', 'bicentenario-hojita-bloque-gala',
    'fauna-andina-serie-completa-2024', 'fdc-bicentenario-sucre-2025',
    'clasificador-lujo-64-paginas'
);

SELECT e.id, e.slug, e.name,
       (SELECT count(*) FROM products p WHERE p.emission_id = e.id) AS productos
FROM emissions e
WHERE e.slug IN (
    'emision-bicentenario-bolivia-2025', 'fauna-andina-2024', 'condor-andes-1866'
);

-- Cuentas históricas: presencia no implica que deban eliminarse.
SELECT u.id, u.name, u.email,
       (SELECT count(*) FROM orders o WHERE o.user_id = u.id) AS pedidos
FROM users u
WHERE u.email IN (
    'filatelia@filatelia.bo', 'soporte@filatelia.bo',
    'jhefersonveizagamujica@gmail.com'
);

-- Comprobar las dependencias reales del servidor antes de cualquier limpieza.
SELECT conrelid::regclass AS tabla_dependiente,
       confrelid::regclass AS tabla_referenciada,
       pg_get_constraintdef(oid) AS restriccion
FROM pg_constraint
WHERE contype = 'f'
  AND confrelid IN ('orders'::regclass, 'products'::regclass,
                   'users'::regclass, 'emissions'::regclass)
ORDER BY 2, 1;

ROLLBACK;
