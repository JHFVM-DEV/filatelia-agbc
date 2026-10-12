# Métricas web y negocio

Disponible en el panel administrativo, **Reportes & Auditoría → Métricas web y negocio** (`/admin/metricas`). El administrador principal y los roles con permiso **Reportes** pueden consultar el panel. Los clientes no tienen acceso.

Permite elegir fechas (hasta 366 días), consultar 7, 30 o 90 días, actualizar y exportar CSV. Todas las fechas de los informes usan el horario de Bolivia.

- Visitas: sesiones anónimas, separadas después de 30 minutos sin acciones. Páginas vistas: aperturas de páginas públicas y cambios de pieza/categoría en los enlaces del catálogo. No cuenta los cambios automáticos del carrusel.
- Navegadores únicos: identificadores aleatorios persistidos en el navegador; no representan personas identificadas. Borrar el almacenamiento o cambiar de navegador puede contar otro visitante.
- Última visita, inicio del registro y acumulado de visitas/páginas, además de sesiones con actividad en los últimos cinco minutos.
- Evolución diaria y comparación de páginas vistas con el período anterior de igual duración.
- Diez páginas, categorías y sellos más consultados. Las categorías cuentan selecciones del filtro del catálogo; los sellos cuentan aperturas de su ficha técnica.
- Origen de visitas: dominio del referente, sin URL completa. Una visita directa o sin referente no identifica el origen. Dispositivos estimados por ancho de pantalla e idioma del navegador.
- Recorrido de compra: sesiones que consultan fichas, agregan al carrito, inician compra o crean pedidos. Son acciones independientes; no se exige una secuencia estricta.
- Conversión: sesiones del período que tienen un pedido real no cancelado, dividido por sesiones registradas del período. Pedidos sin sesión de seguimiento no se atribuyen al embudo.
- Valor de pedidos: total de pedidos no cancelados creados durante el período. Valor con pago verificado: pedidos en PAYMENT_VERIFIED, VAULT_PREPARATION, PACKED_GLASSINE, SHIPPED o DELIVERED. No sustituye una conciliación bancaria; VAULT_VERIFIED no cuenta como pago confirmado.
- Clientes nuevos, pedidos cancelados, páginas por sesión, sesiones de una página y duración observada entre primera y última acción. Una sesión de una sola acción registra cero segundos; no se mide el tiempo real de lectura.

Los informes empiezan cuando esta versión registra eventos. No reconstruyen visitas históricas. No almacenan IP, correo ni parámetros de búsqueda en la tabla de eventos. Excluyen rutas administrativas/API/autenticación y agentes identificados como robots. El navegador respeta Do Not Track y Global Privacy Control. Bloqueadores, visitas sin JavaScript y conexiones fallidas pueden reducir el registro.

La identificación se guarda como hash con la APP_KEY existente. No regenerar la clave. Los eventos son observaciones del navegador y no una medición antifraude certificada. No se implementa geolocalización ni seguimiento de posiciones en buscadores; requieren otra fuente de datos.

## Publicación

Actualizar backend y frontend y ejecutar desde `backend`:

```sh
php artisan migrate --path=database/migrations/2026_10_12_180000_create_site_analytics.php --force
```

Después, actualizar la caché de rutas y compilar/reiniciar el frontend siguiendo [la guía de producción](actualizar-produccion.md). La migración crea la tabla de eventos y una columna opcional en pedidos; conserva los datos existentes. No ejecutar `migrate:fresh`.

Para verificar: visitar la página pública, seleccionar una categoría y abrir una ficha. Entrar como administrador y consultar el período actual; deben aparecer la página, la categoría y el sello visitados. Las métricas se actualizan con **Consultar**, no automáticamente.
