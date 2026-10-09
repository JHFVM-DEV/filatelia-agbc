<?php

namespace App\Services;

class ApiDocumentationService
{
    /**
     * Lista completa de permisos / scopes disponibles para emisión de API Keys
     */
    public static function getAvailableScopes(): array
    {
        return [
            [
                'category' => 'Seguridad & Acceso Maestro',
                'key' => '*',
                'label' => 'Acceso Total Institucional (*)',
                'description' => 'Otorga autorización y control irrestricto sobre todos los módulos y endpoints de la plataforma.',
            ],
            [
                'category' => 'Catálogo & Filatelia',
                'key' => 'catalogo:read',
                'label' => 'Lectura de Catálogo y Piezas',
                'description' => 'Consulta de estampillas, sellos conmemorativos, fichas técnicas, precios e inventario público.',
            ],
            [
                'category' => 'Catálogo & Filatelia',
                'key' => 'catalogo:write',
                'label' => 'Gestión de Piezas Filatélicas',
                'description' => 'Creación, actualización de precios/estado y baja de piezas filatélicas.',
            ],
            [
                'category' => 'Catálogo & Filatelia',
                'key' => 'categorias:read',
                'label' => 'Consulta de Categorías',
                'description' => 'Lectura de clasificaciones temáticas (Fauna, Flora, Historia, Hitos Nacionales).',
            ],
            [
                'category' => 'Catálogo & Filatelia',
                'key' => 'categorias:write',
                'label' => 'Gestión de Categorías',
                'description' => 'Creación y mantenimiento de categorías del acervo filatélico.',
            ],
            [
                'category' => 'Catálogo & Filatelia',
                'key' => 'emisiones:read',
                'label' => 'Consulta de Emisiones',
                'description' => 'Acceso a series de emisión, resoluciones postales, años y tirajes conmemorativos.',
            ],
            [
                'category' => 'Catálogo & Filatelia',
                'key' => 'emisiones:write',
                'label' => 'Gestión de Emisiones',
                'description' => 'Alta y catalogación de emisiones oficiales aprobadas por la Dirección Postal.',
            ],
            [
                'category' => 'Ventas & Coleccionistas',
                'key' => 'pedidos:read',
                'label' => 'Consulta de Pedidos y Órdenes',
                'description' => 'Acceso a órdenes de compra, datos de coleccionistas, importes y comprobantes.',
            ],
            [
                'category' => 'Ventas & Coleccionistas',
                'key' => 'pedidos:write',
                'label' => 'Actualización de Pedidos',
                'description' => 'Cambio de estado de pagos, confirmación de transacciones y notas de custodia.',
            ],
            [
                'category' => 'Bóveda & Logística',
                'key' => 'inventario:read',
                'label' => 'Consulta de Bóveda e Inventario',
                'description' => 'Verificación de existencias físicas en custodia, condición de conservación y ubicación.',
            ],
            [
                'category' => 'Bóveda & Logística',
                'key' => 'inventario:write',
                'label' => 'Ajustes de Bóveda y Movimientos',
                'description' => 'Registro de ingresos oficiales, arqueos, traslados y mermas autorizadas.',
            ],
            [
                'category' => 'Bóveda & Logística',
                'key' => 'despacho:manage',
                'label' => 'Mesa de Despacho y Empaque Glassine',
                'description' => 'Gestión de cola de empaque protector, control de sellado y despacho.',
            ],
            [
                'category' => 'Bóveda & Logística',
                'key' => 'envios:read',
                'label' => 'Consulta de Valijas y Envíos',
                'description' => 'Monitoreo de guías de rastreo, despachos departamentales y estado de entrega.',
            ],
            [
                'category' => 'Bóveda & Logística',
                'key' => 'envios:write',
                'label' => 'Gestión y Asignación de Guías Postales',
                'description' => 'Creación y actualización de guías de seguimiento, transportistas y actas.',
            ],
            [
                'category' => 'Auditoría & Reportes',
                'key' => 'reportes:read',
                'label' => 'Reportes Financieros y Balances',
                'description' => 'Extracción de cifras de recaudación, balances de arqueo y tasación soberana de bóveda.',
            ],
            [
                'category' => 'Auditoría & Reportes',
                'key' => 'telemetria:read',
                'label' => 'Monitoreo Pulse y Servidor',
                'description' => 'Indicadores de salud, latencia, conexiones de base de datos y memoria.',
            ],
            [
                'category' => 'Auditoría & Reportes',
                'key' => 'logs:read',
                'label' => 'Visor de Logs y Auditoría',
                'description' => 'Acceso a trazas de seguridad, transacciones registradas y eventos del sistema.',
            ],
            [
                'category' => 'Administración & Seguridad',
                'key' => 'usuarios:read',
                'label' => 'Consulta de Funcionarios y Cuentas',
                'description' => 'Listado de personal institucional y coleccionistas registrados.',
            ],
            [
                'category' => 'Administración & Seguridad',
                'key' => 'usuarios:write',
                'label' => 'Gestión de Funcionarios y Cuentas',
                'description' => 'Creación, actualización y asignación de roles a funcionarios del sistema.',
            ],
        ];
    }

    /**
     * Especificación estructurada de endpoints para visor interactivo y consumo externo
     */
    public static function getEndpointsDoc(): array
    {
        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';

        return [
            [
                'group' => 'Catálogo & Filatelia',
                'endpoints' => [
                    [
                        'method' => 'GET',
                        'path' => '/external/products',
                        'full_url' => "{$baseUrl}/external/products",
                        'title' => 'Vitrina Postal & Tarjetas para Portal Externo',
                        'description' => 'Endpoint especializado para la página principal corporativa o portales asociados. Devuelve sellos con URLs absolutas directas para imágenes (image_url), insignia de categoría (badge), resumen historiográfico, precio en Bolivianos y enlace de redirección a la tienda.',
                        'required_scopes' => ['catalogo:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [
                            'featured' => 'Filtrar piezas destacadas (true/false, default: true)',
                            'limit' => 'Cantidad de tarjetas a obtener (default: 4, máx: 50)',
                            'category' => 'Filtrar por slug de categoría (opcional)',
                            'search' => 'Término de búsqueda libre (opcional)',
                        ],
                        'response_sample' => [
                            'success' => true,
                            'count' => 4,
                            'target_component' => 'Vitrina Postal de Página Principal',
                            'data' => [
                                [
                                    'id' => 1,
                                    'name' => 'Primera Emisión Cóndor de los Andes 1866',
                                    'slug' => 'condor-de-los-andes-1866',
                                    'catalog_code' => 'BO-1866-001',
                                    'badge' => 'HISTORIA POSTAL',
                                    'image_url' => "{$baseUrl}/images/hero-philately.jpg",
                                    'front_image_url' => "{$baseUrl}/images/hero-philately.jpg",
                                    'back_image_url' => null,
                                    'price' => 150.00,
                                    'price_formatted' => 'Bs. 150.00',
                                    'currency' => 'BOB',
                                    'short_description' => 'Primera serie postal oficial de Bolivia con grabado en acero.',
                                    'year' => 1866,
                                    'country' => 'Bolivia',
                                    'condition' => 'MINT NH — Goma Intacta Sin Charnela',
                                    'rarity' => '👑 Pieza de Museo',
                                    'stock' => 5,
                                    'is_in_stock' => true,
                                    'store_url' => 'http://localhost:3000/catalogo/condor-de-los-andes-1866',
                                    'add_to_cart_url' => 'http://localhost:3000/catalogo/condor-de-los-andes-1866?action=buy',
                                ],
                            ],
                            'integration_mapping' => [
                                'card_image' => 'item.image_url (URL absoluta y directa para la etiqueta <img>)',
                                'card_badge' => 'item.badge (Texto de categoría superior: ej. HISTORIA POSTAL)',
                                'card_title' => 'item.name (Título oficial del sello)',
                                'card_description' => 'item.short_description (Reseña histórica resumida)',
                                'card_price' => 'item.price_formatted (Precio con moneda en Bs.)',
                                'button_redirect' => 'item.store_url (Enlace directo a la pieza en la tienda para comprar)',
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/external/products?featured=true&limit=4\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/products',
                        'full_url' => "{$baseUrl}/products",
                        'title' => 'Listar Piezas Filatélicas',
                        'description' => 'Retorna el catálogo público de piezas y sellos filatélicos disponibles para colección, incluyendo URLs absolutas de imágenes (image_url, front_image_url).',
                        'required_scopes' => ['catalogo:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [
                            'category' => 'ID o slug de categoría (opcional)',
                            'emission_id' => 'ID de emisión conmemorativa (opcional)',
                            'search' => 'Término de búsqueda (opcional)',
                        ],
                        'response_sample' => [
                            'success' => true,
                            'data' => [
                                [
                                    'id' => 1,
                                    'name' => 'Sello Bicentenario de Bolivia 2025',
                                    'slug' => 'sello-bicentenario-bolivia-2025',
                                    'catalog_code' => 'BO-2025-001',
                                    'price' => '35.00',
                                    'price_formatted' => 'Bs. 35.00',
                                    'stock' => 120,
                                    'category' => 'Historia Nacional',
                                    'year' => 2025,
                                    'image_url' => "{$baseUrl}/images/hero-philately.jpg",
                                    'front_image_url' => "{$baseUrl}/images/hero-philately.jpg",
                                    'store_url' => 'http://localhost:3000/catalogo/sello-bicentenario-bolivia-2025',
                                ],
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/products\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/products/{slug}',
                        'full_url' => "{$baseUrl}/products/{slug}",
                        'title' => 'Detalle de Pieza Filatélica',
                        'description' => 'Obtiene la ficha técnica oficial, especificaciones de papel, dentado y tiraje de una pieza.',
                        'required_scopes' => ['catalogo:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'product' => [
                                'id' => 1,
                                'slug' => 'sello-bicentenario-bolivia-2025',
                                'name' => 'Sello Bicentenario de Bolivia 2025',
                                'description' => 'Edición especial conmemorativa del Bicentenario de la República.',
                                'dentado' => '13.5 x 14',
                                'tiraje' => '50,000 ejemplares',
                                'price' => '35.00',
                                'stock' => 120,
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/products/sello-bicentenario-bolivia-2025\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/categories',
                        'full_url' => "{$baseUrl}/categories",
                        'title' => 'Listar Categorías y Series',
                        'description' => 'Consulta todas las ramas temáticas del catálogo filatélico.',
                        'required_scopes' => ['catalogo:read', 'categorias:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'data' => [
                                ['id' => 1, 'name' => 'Fauna y Flora Andina', 'slug' => 'fauna-y-flora-andina', 'products_count' => 14],
                                ['id' => 2, 'name' => 'Héroes y Próceres', 'slug' => 'heroes-y-proceres', 'products_count' => 8],
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/categories\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/emissions',
                        'full_url' => "{$baseUrl}/emissions",
                        'title' => 'Listar Emisiones Conmemorativas',
                        'description' => 'Retorna el catálogo histórico de emisiones postales aprobadas.',
                        'required_scopes' => ['catalogo:read', 'emisiones:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'data' => [
                                ['id' => 1, 'name' => 'Emisión Bicentenario 2025', 'year' => 2025, 'description' => 'Decreto Supremo de Emisión 5122'],
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/emissions\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                ],
            ],
            [
                'group' => 'Ventas & Coleccionistas',
                'endpoints' => [
                    [
                        'method' => 'GET',
                        'path' => '/admin/orders',
                        'full_url' => "{$baseUrl}/admin/orders",
                        'title' => 'Listar Órdenes y Pedidos',
                        'description' => 'Consulta todas las compras realizadas por coleccionistas, montos, pasarelas y estados de entrega.',
                        'required_scopes' => ['pedidos:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [
                            'status' => 'Filtro por estado: PENDING, PAID, PREPARING, SHIPPED, DELIVERED, CANCELLED',
                        ],
                        'response_sample' => [
                            'success' => true,
                            'orders' => [
                                [
                                    'id' => 101,
                                    'order_number' => 'ORD-2026-0042',
                                    'user_name' => 'Carlos Villegas',
                                    'total_amount' => '175.00',
                                    'status' => 'PAID',
                                    'department' => 'La Paz',
                                    'created_at' => '2026-09-20T14:30:00Z',
                                ],
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/admin/orders\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'PATCH',
                        'path' => '/admin/orders/{id}/status',
                        'full_url' => "{$baseUrl}/admin/orders/{id}/status",
                        'title' => 'Actualizar Estado de Pedido',
                        'description' => 'Modifica el estado del pedido postal y genera la trazabilidad del acta de custodia.',
                        'required_scopes' => ['pedidos:write', '*'],
                        'headers' => [
                            'Content-Type' => 'application/json',
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'body_sample' => [
                            'status' => 'PREPARING',
                        ],
                        'response_sample' => [
                            'success' => true,
                            'message' => 'Estado de pedido actualizado a PREPARING exitosamente.',
                            'order' => ['id' => 101, 'status' => 'PREPARING'],
                        ],
                        'curl_sample' => "curl -X PATCH \"{$baseUrl}/admin/orders/101/status\" \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\" \\\n  -d '{\"status\":\"PREPARING\"}'",
                    ],
                ],
            ],
            [
                'group' => 'Bóveda & Logística',
                'endpoints' => [
                    [
                        'method' => 'GET',
                        'path' => '/admin/inventory',
                        'full_url' => "{$baseUrl}/admin/inventory",
                        'title' => 'Consultar Existencias en Bóveda',
                        'description' => 'Retorna la lista de existencias resguardadas en bóveda central y movimientos recientes.',
                        'required_scopes' => ['inventario:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'products' => [
                                ['id' => 1, 'name' => 'Sello Bicentenario', 'stock' => 120, 'price' => '35.00'],
                            ],
                            'recent_movements' => [
                                ['id' => 5, 'type' => 'INGRESO', 'quantity' => 50, 'reason' => 'Recepción de Pliegos Casa de Moneda'],
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/admin/inventory\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'POST',
                        'path' => '/admin/inventory/adjust',
                        'full_url' => "{$baseUrl}/admin/inventory/adjust",
                        'title' => 'Registrar Ajuste / Movimiento de Bóveda',
                        'description' => 'Asienta un movimiento oficial de inventario en bóveda (Ingreso, Egreso o Traslado).',
                        'required_scopes' => ['inventario:write', '*'],
                        'headers' => [
                            'Content-Type' => 'application/json',
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'body_sample' => [
                            'product_id' => 1,
                            'type' => 'INGRESO',
                            'quantity' => 25,
                            'reason' => 'Arqueo de bóveda y recepción de lote oficial.',
                        ],
                        'response_sample' => [
                            'success' => true,
                            'message' => 'Movimiento de bóveda asentado correctamente.',
                            'new_stock' => 145,
                        ],
                        'curl_sample' => "curl -X POST \"{$baseUrl}/admin/inventory/adjust\" \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\" \\\n  -d '{\"product_id\":1,\"type\":\"INGRESO\",\"quantity\":25,\"reason\":\"Arqueo oficial\"}'",
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/admin/shipments',
                        'full_url' => "{$baseUrl}/admin/shipments",
                        'title' => 'Listar Envíos y Valijas Postales',
                        'description' => 'Consulta despachos logísticos, guías de seguimiento y estados de transporte postal.',
                        'required_scopes' => ['envios:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'shipments' => [
                                [
                                    'id' => 12,
                                    'order_id' => 101,
                                    'tracking_number' => 'CP-BO-2026-99381',
                                    'status' => 'IN_TRANSIT',
                                    'carrier' => 'Correos de Bolivia - Valija Expresa',
                                    'destination_city' => 'Cochabamba',
                                ],
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/admin/shipments\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                ],
            ],
            [
                'group' => 'Auditoría & Rendimiento',
                'endpoints' => [
                    [
                        'method' => 'GET',
                        'path' => '/admin/reports',
                        'full_url' => "{$baseUrl}/admin/reports",
                        'title' => 'Reporte Consolidado de Recaudación y Tasación',
                        'description' => 'Métricas clave de recaudación monetaria por pasarelas, órdenes y tasación de activos de bóveda.',
                        'required_scopes' => ['reportes:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'stats' => [
                                'total_revenue' => 45890.50,
                                'vault_valuation' => 184500.00,
                                'total_orders' => 312,
                                'avg_ticket' => 147.08,
                            ],
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/admin/reports\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                    [
                        'method' => 'GET',
                        'path' => '/admin/system-health',
                        'full_url' => "{$baseUrl}/admin/system-health",
                        'title' => 'Telemetría Pulse del Servidor',
                        'description' => 'Indicadores en tiempo real de uso de CPU, memoria, almacenamiento y estado de la base de datos.',
                        'required_scopes' => ['telemetria:read', '*'],
                        'headers' => [
                            'Accept' => 'application/json',
                            'Authorization' => 'Bearer <API_TOKEN>',
                        ],
                        'query_params' => [],
                        'response_sample' => [
                            'success' => true,
                            'status' => 'HEALTHY',
                            'database' => 'CONNECTED',
                            'memory_usage_mb' => 28.4,
                            'php_version' => '8.2',
                        ],
                        'curl_sample' => "curl -X GET \"{$baseUrl}/admin/system-health\" \\\n  -H \"Accept: application/json\" \\\n  -H \"Authorization: Bearer <TU_API_TOKEN>\"",
                    ],
                ],
            ],
        ];
    }

    /**
     * Genera la colección completa de Postman v2.1 (opcionalmente con el token de la clave preconfigurado)
     */
    public static function generatePostmanCollection(?string $token = null, ?string $apiName = null): array
    {
        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';
        $docs = self::getEndpointsDoc();
        $tokenPlaceholder = $token ?: 'PEGA_AQUI_TU_API_TOKEN';
        $collectionName = $apiName 
            ? "Filatelia Bolivia - API: {$apiName}"
            : 'Filatelia Bolivia - API Institucional Oficial';

        $items = [];
        foreach ($docs as $group) {
            $groupItems = [];
            foreach ($group['endpoints'] as $ep) {
                $urlParts = explode('/', ltrim($ep['path'], '/'));
                
                $request = [
                    'name' => $ep['title'],
                    'request' => [
                        'method' => $ep['method'],
                        'header' => [
                            [
                                'key' => 'Accept',
                                'value' => 'application/json',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'Authorization',
                                'value' => 'Bearer {{api_token}}',
                                'type' => 'text',
                            ],
                        ],
                        'url' => [
                            'raw' => '{{baseUrl}}' . $ep['path'],
                            'host' => ['{{baseUrl}}'],
                            'path' => $urlParts,
                        ],
                        'description' => $ep['description'] . "\n\n**Permisos requeridos:** `" . implode('`, `', $ep['required_scopes']) . "`",
                    ],
                    'response' => [],
                ];

                if (!empty($ep['body_sample'])) {
                    $request['request']['header'][] = [
                        'key' => 'Content-Type',
                        'value' => 'application/json',
                        'type' => 'text',
                    ];
                    $request['request']['body'] = [
                        'mode' => 'raw',
                        'raw' => json_encode($ep['body_sample'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        'options' => [
                            'raw' => [
                                'language' => 'json',
                            ],
                        ],
                    ];
                }

                $groupItems[] = $request;
            }

            $items[] = [
                'name' => $group['group'],
                'item' => $groupItems,
            ];
        }

        return [
            'info' => [
                '_postman_id' => 'filatelia-bolivia-api-collection',
                'name' => $collectionName,
                'description' => 'Colección oficial de endpoints REST para la integración externa y gestión de coleccionismo filatélico del Estado Plurinacional de Bolivia.',
                'schema' => 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            ],
            'variable' => [
                [
                    'key' => 'baseUrl',
                    'value' => $baseUrl,
                    'type' => 'string',
                ],
                [
                    'key' => 'api_token',
                    'value' => $tokenPlaceholder,
                    'type' => 'string',
                ],
            ],
            'item' => $items,
        ];
    }

    /**
     * Genera la especificación OpenAPI 3.0.3 (Swagger)
     */
    public static function generateOpenApiSpec(): array
    {
        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';
        $docs = self::getEndpointsDoc();

        $paths = [];
        foreach ($docs as $group) {
            foreach ($group['endpoints'] as $ep) {
                $path = $ep['path'];
                $method = strtolower($ep['method']);

                $operation = [
                    'tags' => [$group['group']],
                    'summary' => $ep['title'],
                    'description' => $ep['description'] . " Permisos requeridos: " . implode(', ', $ep['required_scopes']),
                    'operationId' => strtolower($ep['method']) . '_' . str_replace(['/', '{', '}'], ['_', '', ''], $path),
                    'security' => [
                        ['BearerAuth' => []],
                    ],
                    'responses' => [
                        '200' => [
                            'description' => 'Operación exitosa',
                            'content' => [
                                'application/json' => [
                                    'example' => $ep['response_sample'],
                                ],
                            ],
                        ],
                        '401' => [
                            'description' => 'No autenticado o token inválido',
                        ],
                        '403' => [
                            'description' => 'Permisos insuficientes para esta operación',
                        ],
                    ],
                ];

                if (!empty($ep['body_sample'])) {
                    $operation['requestBody'] = [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'example' => $ep['body_sample'],
                            ],
                        ],
                    ];
                }

                $paths[$path][$method] = $operation;
            }
        }

        return [
            'openapi' => '3.0.3',
            'info' => [
                'title' => 'API Institucional Filatelia Bolivia',
                'description' => 'Servicios Web e Interfaz de Integración Oficial para la Bóveda Filatélica de Correos de Bolivia.',
                'version' => '1.0.0',
                'contact' => [
                    'name' => 'Dirección de Tecnología & Seguridad Institucional',
                    'email' => 'admin@filatelia.bo',
                ],
            ],
            'servers' => [
                [
                    'url' => $baseUrl,
                    'description' => 'Servidor de Producción / Staging Local',
                ],
            ],
            'paths' => $paths,
            'components' => [
                'securitySchemes' => [
                    'BearerAuth' => [
                        'type' => 'http',
                        'scheme' => 'bearer',
                        'bearerFormat' => 'SanctumToken',
                        'description' => 'Ingrese el API Token emitido en el panel administrativo.',
                    ],
                ],
            ],
        ];
    }

    /**
     * Genera la documentación técnica completa en formato Markdown
     */
    public static function generateMarkdownDoc(?string $token = null, ?string $apiName = null): string
    {
        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';
        $scopes = self::getAvailableScopes();
        $docs = self::getEndpointsDoc();
        $displayToken = $token ?: '<TU_API_TOKEN>';

        $title = $apiName 
            ? "# Manual Técnico de Integración — API: {$apiName}\n\n"
            : "# Manual Técnico de Integración API — Filatelia Bolivia\n\n";

        $md = $title;
        $md .= "**Entidad:** Correos de Bolivia &bull; Dirección Filatélica Institucional\n";
        $md .= "**Versión:** 1.0.0 | **Protocolo:** REST / JSON | **Autenticación:** Laravel Sanctum Bearer Token\n\n";
        $md .= "---\n\n";
        $md .= "## 1. Introducción y Seguridad\n\n";
        $md .= "La API de Filatelia Bolivia proporciona acceso programático seguro para consultar el catálogo de piezas históricas, gestionar pedidos postales, monitorear el inventario de bóveda y consultar el seguimiento logístico.\n\n";
        $md .= "### Autenticación\n\n";
        $md .= "Todas las peticiones a endpoints restringidos deben incluir el token de autenticación en la cabecera HTTP `Authorization` con el prefijo `Bearer`:\n\n";
        $md .= "```http\nAuthorization: Bearer {$displayToken}\nAccept: application/json\n```\n\n";
        if ($token) {
            $md .= "> **Credencial Asignada:** Este manual ha sido emitido con la API Key activa `{$displayToken}` preconfigurada en todos los ejemplos cURL.\n\n";
        }
        $md .= "> **Importante:** Conserve sus credenciales en un lugar seguro. No las exponga en repositorios públicos ni código del lado del cliente.\n\n";

        $md .= "## 2. Matriz de Permisos (*Scopes*)\n\n";
        $md .= "| Permiso (Scope) | Categoría | Descripción |\n";
        $md .= "| :--- | :--- | :--- |\n";
        foreach ($scopes as $s) {
            $md .= "| `{$s['key']}` | {$s['category']} | {$s['description']} |\n";
        }
        $md .= "\n---\n\n";

        $md .= "## 3. Catálogo de Endpoints\n\n";
        foreach ($docs as $group) {
            $md .= "### " . $group['group'] . "\n\n";
            foreach ($group['endpoints'] as $ep) {
                $md .= "#### `{$ep['method']}` `{$ep['path']}` — " . $ep['title'] . "\n\n";
                $md .= $ep['description'] . "\n\n";
                $md .= "- **URL Completa:** `{$ep['full_url']}`\n";
                $md .= "- **Permisos Requeridos:** `" . implode('`, `', $ep['required_scopes']) . "`\n\n";
                
                $md .= "**Ejemplo cURL:**\n\n";
                $md .= "```bash\n" . $ep['curl_sample'] . "\n```\n\n";

                if (!empty($ep['body_sample'])) {
                    $md .= "**Cuerpo de la Petición (JSON):**\n\n";
                    $md .= "```json\n" . json_encode($ep['body_sample'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n```\n\n";
                }

                $md .= "**Respuesta de Ejemplo (200 OK):**\n\n";
                $md .= "```json\n" . json_encode($ep['response_sample'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n```\n\n";
                $md .= "---\n\n";
            }
        }

        $md .= "## 4. Códigos de Respuesta HTTP\n\n";
        $md .= "| Código | Significado | Explicación |\n";
        $md .= "| :--- | :--- | :--- |\n";
        $md .= "| `200 OK` | Éxito | La solicitud se procesó correctamente. |\n";
        $md .= "| `201 Created` | Creado | El recurso fue creado satisfactoriamente. |\n";
        $md .= "| `400 Bad Request` | Petición Inválida | Parámetros faltantes o formato erróneo. |\n";
        $md .= "| `401 Unauthorized` | No Autorizado | Token ausente, revocado o expirado. |\n";
        $md .= "| `403 Forbidden` | Prohibido | El token no cuenta con los scopes necesarios. |\n";
        $md .= "| `404 Not Found` | No Encontrado | El recurso solicitado no existe. |\n";
        $md .= "| `500 Server Error` | Error de Servidor | Fallo interno en la ejecución del servicio. |\n\n";

        return $md;
    }

    /**
     * Genera el informe técnico formal en formato Word (.doc / HTML compatible con Microsoft Word)
     */
    public static function generateWordReport(?string $token = null, ?string $apiName = null, ?array $tokenData = null): string
    {
        $baseUrl = config('app.url', 'http://localhost:8000') . '/api';
        $scopes = self::getAvailableScopes();
        $docs = self::getEndpointsDoc();
        $dateFormatted = date('d/m/Y');
        $displayToken = $token ?: 'AUTORIZACION_BEARER_TOKEN_OFICIAL';
        $apiSubject = $apiName ? "API: {$apiName}" : "Servicios Centrales de Filatelia Bolivia";
        $docCode = "INF-DGTIC-FIL-" . date('Y') . "-" . str_pad($tokenData['id'] ?? rand(10, 99), 3, '0', STR_PAD_LEFT);

        ob_start();
        ?>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Informe Técnico Oficial - Arquitectura e Integración API</title>
            <!--[if gte mso 9]>
            <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                    <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                @page {
                    size: 8.5in 11.0in;
                    margin: 1.0in 1.0in 1.0in 1.0in;
                    mso-header-margin: 0.5in;
                    mso-footer-margin: 0.5in;
                }
                body {
                    font-family: 'Calibri', 'Arial', sans-serif;
                    font-size: 11pt;
                    color: #1e293b;
                    line-height: 1.5;
                }
                .header-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 25pt;
                    border-bottom: 2pt solid #102542;
                    padding-bottom: 8pt;
                }
                .title-cover {
                    font-size: 20pt;
                    font-weight: bold;
                    color: #102542;
                    text-align: center;
                    margin-top: 40pt;
                    margin-bottom: 10pt;
                    line-height: 1.2;
                }
                .subtitle-cover {
                    font-size: 13pt;
                    color: #475569;
                    text-align: center;
                    margin-bottom: 40pt;
                }
                .meta-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30pt;
                    margin-bottom: 40pt;
                }
                .meta-table th, .meta-table td {
                    border: 1pt solid #cbd5e1;
                    padding: 8pt 10pt;
                    font-size: 10pt;
                }
                .meta-table th {
                    background-color: #102542;
                    color: #ffffff;
                    text-align: left;
                    font-weight: bold;
                }
                .meta-table td.label {
                    background-color: #f8fafc;
                    font-weight: bold;
                    width: 30%;
                    color: #102542;
                }
                h1 {
                    font-size: 15pt;
                    font-weight: bold;
                    color: #102542;
                    border-bottom: 1.5pt solid #102542;
                    padding-bottom: 4pt;
                    margin-top: 25pt;
                    margin-bottom: 12pt;
                }
                h2 {
                    font-size: 12.5pt;
                    font-weight: bold;
                    color: #2C63AC;
                    margin-top: 18pt;
                    margin-bottom: 8pt;
                }
                h3 {
                    font-size: 11pt;
                    font-weight: bold;
                    color: #334155;
                    margin-top: 14pt;
                    margin-bottom: 6pt;
                }
                p, li {
                    font-size: 10.5pt;
                    text-align: justify;
                    margin-bottom: 8pt;
                }
                .code-box {
                    background-color: #f1f5f9;
                    border: 1pt solid #cbd5e1;
                    border-left: 3pt solid #102542;
                    padding: 8pt 12pt;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 9.5pt;
                    color: #0f172a;
                    margin: 10pt 0;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
                .badge {
                    display: inline-block;
                    padding: 2pt 6pt;
                    font-size: 8.5pt;
                    font-weight: bold;
                    border-radius: 3pt;
                    color: #ffffff;
                }
                .badge-get { background-color: #2563EB; }
                .badge-post { background-color: #059669; }
                .badge-patch { background-color: #D97706; }
                .badge-delete { background-color: #DC2626; }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12pt 0;
                    font-size: 9.5pt;
                }
                .data-table th, .data-table td {
                    border: 1pt solid #cbd5e1;
                    padding: 6pt 8pt;
                }
                .data-table th {
                    background-color: #2C63AC;
                    color: #ffffff;
                    font-weight: bold;
                    text-align: left;
                }
                .data-table tr:nth-child(even) td {
                    background-color: #f8fafc;
                }
                .callout-box {
                    background-color: #f0fdf4;
                    border: 1pt solid #bbf7d0;
                    border-left: 4pt solid #16a34a;
                    padding: 10pt;
                    margin: 12pt 0;
                    font-size: 10pt;
                }
                .callout-warning {
                    background-color: #fffbeb;
                    border: 1pt solid #fef3c7;
                    border-left: 4pt solid #d97706;
                    padding: 10pt;
                    margin: 12pt 0;
                    font-size: 10pt;
                }
                .signature-table {
                    width: 100%;
                    margin-top: 50pt;
                    border-collapse: collapse;
                }
                .signature-cell {
                    width: 33.33%;
                    text-align: center;
                    padding: 15pt;
                    vertical-align: bottom;
                }
                .signature-line {
                    border-top: 1pt solid #475569;
                    margin: 40pt 15pt 6pt 15pt;
                }
                .page-break {
                    page-break-before: always;
                    mso-break-type: page;
                }
            </style>
        </head>
        <body>
            <!-- CARÁTULA FORMAL DEL INFORME -->
            <table class="header-table">
                <tr>
                    <td style="width: 70%; vertical-align: middle;">
                        <span style="font-size: 11pt; font-weight: bold; color: #D97706; text-transform: uppercase;">
                            Estado Plurinacional de Bolivia &bull; Correos de Bolivia
                        </span><br/>
                        <span style="font-size: 9pt; color: #475569; font-weight: bold;">
                            DIRECCIÓN GENERAL DE TECNOLOGÍAS DE INFORMACIÓN Y COMUNICACIÓN (DGTIC)
                        </span><br/>
                        <span style="font-size: 8.5pt; color: #64748b;">
                            Subdirección de Seguridad de la Información & Custodia Filatélica
                        </span>
                    </td>
                    <td style="width: 30%; text-align: right; vertical-align: middle;">
                        <div style="font-size: 9pt; font-weight: bold; color: #102542; background: #f1f5f9; padding: 4pt 8pt; border: 1pt solid #cbd5e1; border-radius: 4pt; display: inline-block;">
                            <?= htmlspecialchars($docCode) ?>
                        </div>
                    </td>
                </tr>
            </table>

            <div class="title-cover">
                INFORME TÉCNICO DE ARQUITECTURA E INTEGRACIÓN DE INTERFACES API REST
            </div>
            <div class="subtitle-cover">
                ESPECIFICACIÓN FORMAL DE PROTOCOLOS, MATRIZ CRIPTOGRÁFICA DE ACCESO (SANCTUM) Y GUÍA DE INTEROPERABILIDAD INSTITUCIONAL
            </div>

            <!-- TABLA DE CONTROL DEL DOCUMENTO -->
            <table class="meta-table">
                <tr>
                    <th colspan="2">1. FICHA TÉCNICA Y CONTROL DEL DOCUMENTO</th>
                </tr>
                <tr>
                    <td class="label">CÓDIGO OFICIAL:</td>
                    <td><strong><?= htmlspecialchars($docCode) ?></strong></td>
                </tr>
                <tr>
                    <td class="label">OBJETO DE EVALUACIÓN:</td>
                    <td><?= htmlspecialchars($apiSubject) ?></td>
                </tr>
                <tr>
                    <td class="label">VERSIÓN DE LA PLATAFORMA:</td>
                    <td>v1.2.0 (Entorno Oficial de Producción / Staging)</td>
                </tr>
                <tr>
                    <td class="label">CLASIFICACIÓN DE SEGURIDAD:</td>
                    <td><strong style="color: #991B1B;">USO OFICIAL RESTRINGIDO — EXCLUSIVO SUPER ADMINISTRADOR</strong></td>
                </tr>
                <tr>
                    <td class="label">FECHA DE EMISIÓN:</td>
                    <td><?= htmlspecialchars($dateFormatted) ?></td>
                </tr>
                <tr>
                    <td class="label">ESTÁNDAR CRIPTOGRÁFICO:</td>
                    <td>Laravel Sanctum (SHA-256 Hashed Tokens / AES-256-CBC At-Rest Encryption)</td>
                </tr>
                <tr>
                    <td class="label">URL BASE DE SERVICIO:</td>
                    <td><code><?= htmlspecialchars($baseUrl) ?></code></td>
                </tr>
                <?php if ($token): ?>
                <tr>
                    <td class="label">API TOKEN CONFIGURADO:</td>
                    <td><code style="color: #047857; font-weight: bold;"><?= htmlspecialchars($displayToken) ?></code></td>
                </tr>
                <?php endif; ?>
            </table>

            <div style="margin-top: 30pt; text-align: center; color: #64748b; font-size: 9pt;">
                Documento emitido electrónicamente con validez legal e institucional para procesos de homologación tecnológica.
            </div>

            <br clear="all" style="page-break-before:always" />

            <!-- SECCIÓN 1: ANTECEDENTES Y RESUMEN EJECUTIVO -->
            <h1>1. RESUMEN EJECUTIVO Y OBJETIVOS</h1>
            <p>
                El presente informe técnico tiene por finalidad documentar formalmente la arquitectura, protocolos de transporte, 
                modelos de datos y mecanismos criptográficos de autorización que gobiernan los servicios web (API REST) de la plataforma 
                <strong>Filatelia Bolivia</strong>, dependiente de la entidad postal oficial del Estado Plurinacional de Bolivia.
            </p>
            <p>
                La implementación de estas interfaces de programación permite la interoperabilidad controlada y segura entre la 
                bóveda central de custodia de piezas históricas y los sistemas externos, tales como portales institucionales de difusión, 
                módulos aduaneros de exportación de sellos y pasarelas de seguimiento logístico postal.
            </p>

            <div class="callout-box">
                <strong>Directriz de Seguridad Informática:</strong> El acceso a la creación, administración, visualización en texto plano y revocación de llaves de acceso (API Keys) está reservado con estricta exclusividad a la <strong>Dirección General (Super Administrador)</strong>, conforme a los principios de mínimo privilegio y auditoría en caliente.
            </div>

            <!-- SECCIÓN 2: ARQUITECTURA Y ESPECIFICACIONES DE RED -->
            <h1>2. ARQUITECTURA DE SERVICIOS Y PROTOCOLOS</h1>
            <p>
                Los servicios expuestos operan bajo el estándar de diseño <strong>RESTful</strong>, garantizando interoperabilidad mediante las siguientes pautas de ingeniería:
            </p>
            <ul>
                <li><strong>Protocolo de Transporte:</strong> HTTPS obligatorio con cifrado TLS 1.3 / TLS 1.2 para el canal en tránsito.</li>
                <li><strong>Codificación de Carga Útil:</strong> JSON (RFC 8259) con codificación UTF-8.</li>
                <li><strong>Control de Concurrencia y Caché:</strong> Implementación de políticas de caché en memoria para catálogos públicos y validación transaccional ACID para movimientos de bóveda e inventario.</li>
                <li><strong>Mecanismo de Autorización:</strong> Cabecera estándar HTTP <code>Authorization: Bearer &lt;API_TOKEN&gt;</code>.</li>
            </ul>

            <div class="code-box">
GET /api/products HTTP/1.1
Host: <?= htmlspecialchars(parse_url($baseUrl, PHP_URL_HOST) ?: 'localhost') ?> 
Accept: application/json
Authorization: Bearer <?= htmlspecialchars($displayToken) ?>
            </div>

            <!-- SECCIÓN 3: MECANISMO DE AUTENTICACIÓN SANCTUM -->
            <h1>3. ESPECIFICACIÓN DE AUTENTICACIÓN CRIPTOGRÁFICA</h1>
            <p>
                El sistema de seguridad implementa <strong>Laravel Sanctum</strong> para la generación y validación de tokens de acceso personal (*Personal Access Tokens*). El ciclo de vida criptográfico cumple con los siguientes requerimientos:
            </p>
            <ol>
                <li><strong>Generación de Entropía:</strong> Al emitir una clave, se crea un string pseudoaleatorio criptográficamente seguro de 40 caracteres, dotado de un prefijo de identidad única.</li>
                <li><strong>Almacenamiento Hashed:</strong> En la base de datos se almacena el resumen criptográfico calculado mediante el algoritmo <strong>SHA-256</strong>.</li>
                <li><strong>Custodia Reversible Institucional:</strong> Con el propósito de permitir la auditoría y recuperación administrativa exclusiva por el Super Administrador, el token se resguarda cifrado mediante el algoritmo simétrico <strong>AES-256-CBC</strong> respaldado por la llave maestra de la aplicación (<code>APP_KEY</code>).</li>
                <li><strong>Validación de Trazabilidad:</strong> Cada petición válida actualiza de forma automática el timestamp <code>last_used_at</code>, permitiendo identificar credenciales inactivas o posibles desvíos de uso.</li>
            </ol>

            <br clear="all" style="page-break-before:always" />

            <!-- SECCIÓN 4: MATRIZ DE SCOPES -->
            <h1>4. MATRIZ DE PERMISOS GRANULARES (*SCOPES*)</h1>
            <p>
                Cada API Key posee un vector de capacidades (*abilities*) definido en el momento de su emisión. A continuación se desglosan los 19 permisos que componen la matriz de control de acceso institucional:
            </p>

            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Clave Técnica (*Scope*)</th>
                        <th style="width: 20%;">Categoría</th>
                        <th style="width: 15%;">Operación</th>
                        <th style="width: 40%;">Descripción y Alcance</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($scopes as $s): ?>
                        <tr>
                            <td><code><?= htmlspecialchars($s['key']) ?></code></td>
                            <td><?= htmlspecialchars($s['category']) ?></td>
                            <td>
                                <?php if (str_contains($s['key'], 'write') || str_contains($s['key'], 'manage') || $s['key'] === '*'): ?>
                                    <span style="color: #991B1B; font-weight: bold;">Escritura / Control</span>
                                <?php else: ?>
                                    <span style="color: #065F46; font-weight: bold;">Lectura Segura</span>
                                <?php endif; ?>
                            </td>
                            <td><?= htmlspecialchars($s['description']) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <!-- SECCIÓN 5: CATÁLOGO DE ENDPOINTS -->
            <h1>5. CATÁLOGO OFICIAL DE ENDPOINTS REST</h1>
            <p>
                A continuación se especifica la firma técnica de los principales servicios REST provistos por la plataforma:
            </p>

            <?php foreach ($docs as $group): ?>
                <h2>5.<?= rand(1, 9) ?>. Módulo: <?= htmlspecialchars($group['group']) ?></h2>

                <?php foreach ($group['endpoints'] as $ep): ?>
                    <div style="border: 1pt solid #cbd5e1; padding: 10pt; margin-bottom: 12pt; background-color: #fafafa;">
                        <div style="margin-bottom: 6pt;">
                            <?php 
                                $badgeClass = match($ep['method']) {
                                    'GET' => 'badge-get',
                                    'POST' => 'badge-post',
                                    'PATCH' => 'badge-patch',
                                    'DELETE' => 'badge-delete',
                                    default => 'badge-get',
                                };
                            ?>
                            <span class="badge <?= $badgeClass ?>"><?= $ep['method'] ?></span>
                            <strong style="font-size: 11pt; color: #102542; margin-left: 6pt; font-family: monospace;"><?= htmlspecialchars($ep['path']) ?></strong>
                        </div>
                        <p style="margin-bottom: 4pt;"><strong>Descripción:</strong> <?= htmlspecialchars($ep['description']) ?></p>
                        <p style="margin-bottom: 4pt; font-size: 9pt;">
                            <strong>Permisos requeridos:</strong> 
                            <code><?= htmlspecialchars(implode(', ', $ep['required_scopes'])) ?></code>
                        </p>

                        <div style="font-size: 8.5pt; font-weight: bold; color: #475569; margin-top: 6pt;">COMANDO cURL DE PRUEBA:</div>
                        <div class="code-box"><?= htmlspecialchars(str_replace('<TU_API_TOKEN>', $displayToken, $ep['curl_sample'])) ?></div>

                        <?php if (!empty($ep['body_sample'])): ?>
                            <div style="font-size: 8.5pt; font-weight: bold; color: #475569; margin-top: 6pt;">CUERPO DE LA SOLICITUD (REQUEST BODY):</div>
                            <div class="code-box"><?= htmlspecialchars(json_encode($ep['body_sample'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) ?></div>
                        <?php endif; ?>

                        <div style="font-size: 8.5pt; font-weight: bold; color: #475569; margin-top: 6pt;">RESPUESTA DE EJEMPLO (RESPONSE 200 OK):</div>
                        <div class="code-box"><?= htmlspecialchars(json_encode($ep['response_sample'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) ?></div>
                    </div>
                <?php endforeach; ?>
            <?php endforeach; ?>

            <br clear="all" style="page-break-before:always" />

            <!-- SECCIÓN 6: GUÍA DE INTEGRACIÓN PARA EL PORTAL WEB PRINCIPAL -->
            <h1>6. GUÍA DE INTEGRACIÓN EXTERNA: PORTAL PRINCIPAL</h1>
            <p>
                Para el caso específico de consumo desde la página principal de Correos de Bolivia o portales turísticos/culturales que exhiben sellos y colecciones destacadas (conforme al diseño maquetado de vitrina filatélica), se dispone del endpoint especializado <code>GET /api/external/products</code> (o <code>/api/external/showcase</code>), que entrega URLs absolutas de imagen y todos los datos requeridos por la tarjeta visual:
            </p>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Elemento Visual de la Tarjeta</th>
                        <th>Campo del Objeto JSON (API)</th>
                        <th>Tipo de Dato</th>
                        <th>Destino y Utilidad en el Maquetado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Insignia / Badge Superior</strong></td>
                        <td><code>item.badge</code></td>
                        <td>String</td>
                        <td>Etiqueta temática (ej. <em>HISTORIA POSTAL</em>)</td>
                    </tr>
                    <tr>
                        <td><strong>Imagen del Sello Filatélico</strong></td>
                        <td><code>item.image_url</code></td>
                        <td>URL Absoluta</td>
                        <td>Se inserta directo en <code>&lt;img src="${item.image_url}" /&gt;</code> sin enlaces rotos</td>
                    </tr>
                    <tr>
                        <td><strong>Título de la Pieza</strong></td>
                        <td><code>item.name</code></td>
                        <td>String</td>
                        <td>Encabezado principal del artículo filatélico</td>
                    </tr>
                    <tr>
                        <td><strong>Descripción Resumida</strong></td>
                        <td><code>item.short_description</code></td>
                        <td>String</td>
                        <td>Texto descriptivo adaptado al espacio de la tarjeta</td>
                    </tr>
                    <tr>
                        <td><strong>Precio Oficial Formateado</strong></td>
                        <td><code>item.price_formatted</code></td>
                        <td>String</td>
                        <td>Muestra el monto con símbolo monetario (ej. <code>Bs. 150.00</code>)</td>
                    </tr>
                    <tr>
                        <td><strong>Botón de Compra / Redirección</strong></td>
                        <td><code>item.store_url</code></td>
                        <td>URL Absoluta</td>
                        <td>Enlace directo a la pieza en la tienda para añadir al carrito y comprar</td>
                    </tr>
                </tbody>
            </table>

            <h2>6.1. Implementación en JavaScript (Fetch API Asíncrono)</h2>
            <div class="code-box">
// Código de integración oficial para la página principal corporativa
async function sincronizarVitrinaPostal() {
    const ENDPOINT = "<?= htmlspecialchars($baseUrl) ?>/external/products?featured=true&limit=4";
    const API_TOKEN = "<?= htmlspecialchars($displayToken) ?>";

    try {
        const respuesta = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}` // Requiere scope 'catalogo:read'
            }
        });

        if (!respuesta.ok) throw new Error("Fallo en la comunicación con el servidor postal");

        const resultado = await respuesta.json();
        const piezas = resultado.data || [];

        console.log(`Se recibieron ${piezas.length} piezas oficiales listas para mostrar.`);

        // Renderizado dinámico de tarjetas:
        const contenedor = document.getElementById('vitrina-sellos-container');
        if (contenedor) {
            contenedor.innerHTML = piezas.map(item => `
                <div class="tarjeta-filatelica">
                    <span class="badge-categoria">${item.badge}</span>
                    <img src="${item.image_url}" alt="${item.name}" class="imagen-sello" />
                    <h3 class="titulo-sello">${item.name}</h3>
                    <p class="descripcion-sello">${item.short_description}</p>
                    <div class="precio-sello">${item.price_formatted}</div>
                    <a href="${item.store_url}" class="btn-comprar">Añadir al carrito</a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error("Error en la interoperabilidad filatélica:", error);
    }
}
            </div>

            <!-- SECCIÓN 7: POLÍTICAS DE AUDITORÍA Y REVOCACIÓN -->
            <h1>7. AUDITORÍA, RATE LIMITING Y CONTINGENCIA</h1>
            <p>
                En cumplimiento con las normas gubernamentales de seguridad de la información (COMODATO / AGETIC / DGTIC), se imponen las siguientes condiciones obligatorias a todos los sistemas integradores:
            </p>
            <ul>
                <li><strong>Vigencia y Rotación:</strong> Se recomienda no emitir tokens permanentes salvo para servicios de backend a backend de alta criticidad; para portales web se sugiere rotación trimestral (90 días).</li>
                <li><strong>Revocación Inmediata:</strong> El Super Administrador puede revocar cualquier clave en tiempo real desde el panel, invalidando el acceso de forma instantánea sin reiniciar el servidor.</li>
                <li><strong>Monitoreo de Excepciones:</strong> Toda petición que reciba código <code>401 Unauthorized</code> o <code>403 Forbidden</code> queda registrada en el visor de logs del sistema para detección de anomalías.</li>
            </ul>

            <br clear="all" style="page-break-before:always" />

            <!-- SECCIÓN 8: DICTAMEN Y FIRMAS FORMALES -->
            <h1>8. DICTAMEN TÉCNICO Y FIRMAS DE APROBACIÓN</h1>
            <p>
                Se dictamina que las especificaciones de interfaz REST detalladas en el presente instrumento técnico satisfacen los requerimientos de seguridad, fiabilidad, rendimiento y consistencia documental del Estado Plurinacional de Bolivia.
            </p>

            <table class="signature-table">
                <tr>
                    <td class="signature-cell">
                        <div class="signature-line"></div>
                        <strong>Ing. Responsable de Desarrollo</strong><br/>
                        <span style="font-size: 8.5pt; color: #64748b;">Área de Ingeniería de Software & APIs</span><br/>
                        <span style="font-size: 8pt; color: #94a3b8;">Correos de Bolivia</span>
                    </td>
                    <td class="signature-cell">
                        <div class="signature-line"></div>
                        <strong>Responsable de Seguridad</strong><br/>
                        <span style="font-size: 8.5pt; color: #64748b;">Auditoría de Sistemas Criptográficos</span><br/>
                        <span style="font-size: 8pt; color: #94a3b8;">DGTIC Institucional</span>
                    </td>
                    <td class="signature-cell">
                        <div class="signature-line"></div>
                        <strong>Super Administrador</strong><br/>
                        <span style="font-size: 8.5pt; color: #64748b;">Dirección General de Filatelia</span><br/>
                        <span style="font-size: 8pt; color: #94a3b8;">Autoridad Certificadora</span>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 40pt; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1pt solid #e2e8f0; padding-top: 8pt;">
                Documento Técnico Institucional Oficial &bull; Registro Criptográfico N° <?= htmlspecialchars($docCode) ?> &bull; La Paz, Bolivia
            </div>
        </body>
        </html>
        <?php
        return ob_get_clean();
    }
}

