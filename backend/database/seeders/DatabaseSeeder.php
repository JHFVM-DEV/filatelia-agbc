<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Emission;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Únicamente los 3 Roles Oficiales
        $superAdminRole = Role::firstOrCreate(['name' => 'SUPER_ADMIN']);
        $almacenRole    = Role::firstOrCreate(['name' => 'ADMIN_PRODUCTOS_ALMACEN']);
        $clientRole     = Role::firstOrCreate(['name' => 'CLIENTE']);

        foreach (\App\Http\Controllers\Api\AdminController::MODULES as $module) {
            Permission::firstOrCreate(['name' => $module, 'guard_name' => 'web']);
        }
        $superAdminRole->syncPermissions(\App\Http\Controllers\Api\AdminController::MODULES);
        if ($almacenRole->wasRecentlyCreated) {
            $almacenRole->syncPermissions([
                'Emisiones', 'Productos', 'Categorías', 'Pedidos',
                'Inventario', 'Despacho', 'Envíos', 'Reportes',
            ]);
        }

        // Eliminar roles y asignaciones obsoletas
        Role::whereNotIn('name', ['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'CLIENTE'])->delete();

        // 2. Usuarios Base para los 3 Roles Oficiales
        // Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@filatelia.bo'],
            [
                'name' => 'Super Admin (Director General)',
                'password' => Hash::make('Admin12345!'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles([$superAdminRole]);

        // Encargado de Almacén y Productos
        $almacen = User::firstOrCreate(
            ['email' => 'almacen@filatelia.bo'],
            [
                'name' => 'Encargado de Almacén y Productos',
                'password' => Hash::make('Almacen12345!'),
                'email_verified_at' => now(),
            ]
        );
        $almacen->syncRoles([$almacenRole]);

        // Cliente / Coleccionista
        $cliente = User::firstOrCreate(
            ['email' => 'coleccionista@filatelia.bo'],
            [
                'name' => 'Dr. Fernando Arze (Coleccionista)',
                'password' => Hash::make('Cliente12345!'),
                'email_verified_at' => now(),
            ]
        );
        $cliente->syncRoles([$clientRole]);

        // Remover usuarios de roles eliminados si existen
        User::whereIn('email', ['filatelia@filatelia.bo', 'soporte@filatelia.bo'])->delete();

        // 3. Categorías Filatélicas
        $catSellos = Category::firstOrCreate(
            ['slug' => 'sellos-y-series'],
            [
                'name' => 'Sellos y Series Oficiales',
                'description' => 'Sellos individuales y series conmemorativas emitidas por el servicio postal oficial.',
                'image' => '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png',
                'sort_order' => 1,
            ]
        );

        $catBloques = Category::firstOrCreate(
            ['slug' => 'hojitas-bloque'],
            [
                'name' => 'Hojitas Bloque & Souvenir Sheets',
                'description' => 'Ediciones especiales numeradas y láminas conmemorativas para vitrinas de honor.',
                'image' => '/images/stamps/sello-bicentenario-batalla-de-la-tablada-2017.png',
                'sort_order' => 2,
            ]
        );

        $catFDC = Category::firstOrCreate(
            ['slug' => 'sobres-primer-dia'],
            [
                'name' => 'Sobres Primer Día (FDC)',
                'description' => 'Piezas históricas con matasellos ceremonial exclusivo del día de emisión.',
                'image' => '/images/stamps/sello-campana-de-la-libertad-sucre-2009.png',
                'sort_order' => 3,
            ]
        );

        $catAccesorios = Category::firstOrCreate(
            ['slug' => 'accesorios-filatelicos'],
            [
                'name' => 'Accesorios y Archivo de Conservación',
                'description' => 'Material especializado libre de ácido, lupas de peritaje y pinzas alemanas.',
                'image' => '/images/stamps/sello-att-soberania-postal-y-telecomunicaciones-2015.png',
                'sort_order' => 4,
            ]
        );

        $catFaunaFlora = Category::firstOrCreate(
            ['slug' => 'fauna-y-flora'],
            [
                'name' => 'Flora, Fauna y Biodiversidad',
                'description' => 'Especies protegidas, ornitología andino-amazónica y riquezas botánicas de Bolivia.',
                'image' => '/images/stamps/sello-trogon-melanurus-ave-pando-2007.png',
                'sort_order' => 5,
            ]
        );

        $catDipticos = Category::firstOrCreate(
            ['slug' => 'dipticos-y-tripticos'],
            [
                'name' => 'Dípticos y Trípticos Conmemorativos',
                'description' => 'Paneles dobles y triples de arte sacro, historia sindical e industria nacional.',
                'image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'sort_order' => 6,
            ]
        );


        // 4. Emisiones Oficiales
        $emisionBicentenario = Emission::firstOrCreate(
            ['slug' => 'emision-bicentenario-bolivia-2025'],
            [
                'name' => 'Emisión Conmemorativa Bicentenario de Bolivia (1825-2025)',
                'year' => 2025,
                'issue_date' => '2025-08-06',
                'description' => 'Serie de gala en honor a los 200 años de la fundación de la República.',
                'official_decree' => 'D.S. 4920-2025',
            ]
        );

        $emisionFauna = Emission::firstOrCreate(
            ['slug' => 'fauna-andina-2024'],
            [
                'name' => 'Flora & Fauna Andina en Peligro de Conservación',
                'year' => 2024,
                'issue_date' => '2024-05-18',
                'description' => 'Homenaje a la biodiversidad del Altiplano y Yungas bolivianos.',
                'official_decree' => 'R.M. 082/2024',
            ]
        );

        $emisionClasica = Emission::firstOrCreate(
            ['slug' => 'condor-andes-1866'],
            [
                'name' => 'Emisión Clásica Cóndor de Los Andes (1866)',
                'year' => 1866,
                'issue_date' => '1866-10-01',
                'description' => 'La primera emisión postal soberana de Bolivia, grabada por Reuschel en París.',
                'official_decree' => 'Decreto Supremo Melgarejo 1866',
            ]
        );

        $emisionHistoria = Emission::firstOrCreate(
            ['slug' => 'patrimonio-historico-efemerides'],
            [
                'name' => 'Patrimonio Histórico y Efemérides Nacionales',
                'year' => 2017,
                'issue_date' => '2017-08-06',
                'description' => 'Homenaje a los próceres, batallas libertarias y símbolos sagrados de la nación.',
                'official_decree' => 'D.S. Oficial Correos de Bolivia',
            ]
        );

        $emisionFaunaFlora = Emission::firstOrCreate(
            ['slug' => 'biodiversidad-fauna-flora-boliviana'],
            [
                'name' => 'Flora, Fauna y Riqueza Botánica Boliviana',
                'year' => 2017,
                'issue_date' => '2017-03-20',
                'description' => 'Especies de fauna en peligro de extinción y frutos emblemáticos de los 9 departamentos.',
                'official_decree' => 'D.S. 29799 y Resoluciones Ministeriales',
            ]
        );

        $emisionSoberania = Emission::firstOrCreate(
            ['slug' => 'soberania-hidrica-recursos-naturales'],
            [
                'name' => 'Soberanía Hídrica y Recursos Naturales',
                'year' => 2016,
                'issue_date' => '2016-10-15',
                'description' => 'Preservación de las aguas manantiales del Silala y soberanía de los recursos naturales.',
                'official_decree' => 'D.S. DireSilala',
            ]
        );

        $emisionCultura = Emission::firstOrCreate(
            ['slug' => 'cultura-arte-sacro-navidad'],
            [
                'name' => 'Cultura, Arte Sacro, Folclore y Navidad',
                'year' => 2022,
                'issue_date' => '2022-12-01',
                'description' => 'Patrimonio de la Humanidad de Oruro, pinturas de arte sacro virreinal y tradiciones navideñas.',
                'official_decree' => 'R.M. Culturas y Correos',
            ]
        );

        $emisionDesarrollo = Emission::firstOrCreate(
            ['slug' => 'desarrollo-educacion-ciencia-bolivia'],
            [
                'name' => 'Educación, Ciencia y Desarrollo Nacional',
                'year' => 2017,
                'issue_date' => '2017-05-15',
                'description' => 'Centenarios educativos, aeronáutica, desarrollo industrial y medios pedagógicos.',
                'official_decree' => 'D.S. Conmemorativo',
            ]
        );


        // 5. Eliminar productos de ejemplo / ficticios iniciales si existieran
        Product::whereIn('slug', [
            'condor-1866-10c-verde',
            'bicentenario-hojita-bloque-gala',
            'fauna-andina-serie-completa-2024',
            'fdc-bicentenario-sucre-2025',
            'clasificador-lujo-64-paginas',
        ])->delete();

        // Colección Oficial de Sellos de Bolivia (48 piezas catalogadas - BO.AGBC-1 a BO.AGBC-48)
        Product::updateOrCreate(
            ['slug' => 'correo-aereo-50-aniversario-fab-1994'],
            [
                'name' => 'Correo Aéreo Histórico — 50 Aniversario de la Fuerza Aérea Boliviana (FAB)',
                'catalog_code' => 'BO.AGBC-1',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 3.80,
                'face_value' => 'Bs 3.80',
                'year' => 1994,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 12,
                'perforation' => '12 x 12',
                'printing_technique' => 'Litografía a color por La Papelera S.A. 1994',
                'paper_type' => 'Papel de seguridad nacional 1994',
                'gum_condition' => 'Goma original de época intacta',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-50-aniversario-fuerza-aerea-boliviana-fab-1994.png',
                'back_image' => '/images/stamps/sello-50-aniversario-fuerza-aerea-boliviana-fab-1994.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Aeronave de transporte bimotor sobrevolando los nevados escarpados de la Cordillera Real de los Andes, en homenaje al medio siglo de la aviación militar boliviana.',
                'historical_context' => 'Emisión oficial de correo aéreo impresa en los talleres de La Papelera S.A. en La Paz.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'iv-centenario-orden-franciscana-tarija-2006'],
            [
                'name' => 'IV Centenario de la Orden Franciscana en Tarija — Basílica Menor de San Francisco',
                'catalog_code' => 'BO.AGBC-2',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 19,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset de precisión arquitectónica con dorados cálidos',
                'paper_type' => 'Papel filatélico estucado de seguridad',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-iv-centenario-orden-franciscana-tarija-2006.png',
                'back_image' => '/images/stamps/sello-iv-centenario-orden-franciscana-tarija-2006.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Vista en perspectiva del majestuoso altar mayor tallado en cedro y nave central de la Basílica de San Francisco de Tarija, baluarte misionero de la cuenca del Plata.',
                'historical_context' => 'Conmemoración de los 400 años del establecimiento de los frailes menores franciscanos en los valles tarijeños.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'navidad-adhesion-pastores-2006'],
            [
                'name' => 'Pintura Colonial de Gala — Navidad Boliviana 2006 (Adhesión de los Pastores)',
                'catalog_code' => 'BO.AGBC-3',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 20,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía sobre lienzo al óleo virreinal',
                'paper_type' => 'Papel filatélico estucado',
                'gum_condition' => 'Goma original mate',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-navidad-adhesion-pastores-2006.png',
                'back_image' => '/images/stamps/sello-navidad-adhesion-pastores-2006.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Reproducción del óleo virreinal de la Natividad con ángeles celestiales, la Virgen María y los pastores en adoración ante el Niño Jesús.',
                'historical_context' => 'Emisión navideña oficial de Correos de Bolivia impresa por Ind. Lara Bisch S.A. en 2006.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'centenario-fni-mineria-oruro-2006'],
            [
                'name' => 'Centenario de la Facultad Nacional de Ingeniería (FNI Oruro 1906 - 2006)',
                'catalog_code' => 'BO.AGBC-4',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 15,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset duotono sepia y dorado conmemorativo',
                'paper_type' => 'Papel estucado de seguridad',
                'gum_condition' => 'Goma original mate',
                'dimensions' => '42 x 30 mm',
                'front_image' => '/images/stamps/sello-centenario-fni-mineria-oruro-2006.png',
                'back_image' => '/images/stamps/sello-centenario-fni-mineria-oruro-2006.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Fachada del ',
                'historical_context' => 'Celebración de los 100 años de la FNI de la Universidad Técnica de Oruro (UTO).',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'fauna-domestica-perro-criollo-2006'],
            [
                'name' => 'Fauna Doméstica de Bolivia — El Perro Criollo Boliviano (2006)',
                'catalog_code' => 'BO.AGBC-5',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 20,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía sobre fondo azul cielo límpido',
                'paper_type' => 'Papel satinado libre de ácido',
                'gum_condition' => 'Goma original Never Hinged',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-fauna-domestica-perro-criollo-2006.png',
                'back_image' => '/images/stamps/sello-fauna-domestica-perro-criollo-2006.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Simpático y noble perro criollo de pelaje dorado y mirada leal, compañero inseparable de los hogares en pueblos, comunidades andinas y ciudades bolivianas.',
                'historical_context' => 'Serie especial de Correos de Bolivia en reconocimiento al bienestar animal y los fieles amigos de cuatro patas.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'centenario-fundacion-puerto-bahia-cobija-2006'],
            [
                'name' => 'Centenario de Puerto Bahía (Cobija - Pando) — Puente de la Amistad Bolivia-Brasil',
                'catalog_code' => 'BO.AGBC-6',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 18,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía sobre fotografía de ingeniería vial',
                'paper_type' => 'Papel tizado postal de seguridad',
                'gum_condition' => 'Goma original mate intacta',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-centenario-fundacion-puerto-bahia-cobija-2006.png',
                'back_image' => '/images/stamps/sello-centenario-fundacion-puerto-bahia-cobija-2006.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Vista del Puente Internacional de la Amistad sobre el río Acre, que une a Cobija con Brasiliaéia y Epitaciolândia, conmemorando los 100 años de la fundación de Cobija (antiguo Puerto Bahía, 1906).',
                'historical_context' => 'Homenaje a los exploradores y pioneros del Acre y a la defensa del territorio amazónico de Bolivia.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'centenario-scouts-de-bolivia-2007'],
            [
                'name' => 'Centenario del Movimiento Scout Mundial — Asociación de Scouts de Bolivia (1907 - 2007)',
                'catalog_code' => 'BO.AGBC-7',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 8.50,
                'face_value' => 'Bs 8.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 21,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía sobre insignia de la flor de lis',
                'paper_type' => 'Papel estucado de seguridad',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-centenario-asociacion-scouts-de-bolivia-2007.png',
                'back_image' => '/images/stamps/sello-centenario-asociacion-scouts-de-bolivia-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Emisión conmemorativa por los 100 años del campamento de Brownsea fundado por Baden-Powell, destacando el pañuelo y la flor de lis de los Scouts de Bolivia.',
                'historical_context' => 'Serie conmemorativa mundial unida a la red internacional de coleccionistas scouts IFSCO.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'creacion-primera-bandera-boliviana-2006'],
            [
                'name' => 'Patrimonio Patrio — Creación de la Primera Bandera Boliviana (1825)',
                'catalog_code' => 'BO.AGBC-8',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 16,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía sobre fotografía patrimonial',
                'paper_type' => 'Papel de seguridad filatélico',
                'gum_condition' => 'Goma original Never Hinged',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-creacion-primera-bandera-boliviana-2006.png',
                'back_image' => '/images/stamps/sello-creacion-primera-bandera-boliviana-2006.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Muestra la Primera Bandera Nacional (verde, rojo, verde con 5 estrellas doradas de hojas de laurel) ondeando majestuosamente en el Salón de la Independencia de la Casa de la Libertad en Sucre.',
                'historical_context' => 'Homenaje al decreto dictado por la Asamblea General Deliberante el 17 de agosto de 1825.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'buho-real-andino-bubo-virginianus-2007'],
            [
                'name' => 'Aves Rapaces de Bolivia — Búho Real Andino (Bubo virginianus)',
                'catalog_code' => 'BO.AGBC-9',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 6.50,
                'face_value' => 'Bs 6.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 26,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset policromía en alta resolución',
                'paper_type' => 'Papel satinado libre de ácido',
                'gum_condition' => 'Goma original',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-buho-real-andino-bubo-virginianus-2007.png',
                'back_image' => '/images/stamps/sello-buho-real-andino-bubo-virginianus-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Retrato frontal del gran búho cornudo andino (Bubo virginianus) con su imponente mirada ámbar y plumaje críptico adaptado a los valles y alturas de la cordillera.',
                'historical_context' => 'Fotografía tomada en su hábitat natural por el conservacionista Hermes Justiniano.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => '50-anos-abolicion-pongueaje-mita-1995'],
            [
                'name' => '50 Años de la Abolición del Pongueaje y Mitaje (1945 - 1995) — Sello 2.90 Bs',
                'catalog_code' => 'BO.AGBC-10',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 2.90,
                'face_value' => 'Bs 2.90',
                'year' => 1995,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 7,
                'perforation' => '12.5 x 12.5 dentado clásico',
                'printing_technique' => 'Offset policromado por Industrias Offset Color S.R.L.',
                'paper_type' => 'Papel filatélico sin filigrana 1995',
                'gum_condition' => 'Goma virgen de época',
                'dimensions' => '74 x 36 mm (Díptico unido)',
                'front_image' => '/images/stamps/sello-50-anos-abolicion-pongueaje-y-mita-1995.png',
                'back_image' => '/images/stamps/sello-50-anos-abolicion-pongueaje-y-mita-1995.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Pieza histórica que rinde tributo al Primer Congreso Indigenal de 1945 y a los decretos del presidente mártir Gualberto Villarroel aboliendo la servidumbre feudal en el campo boliviano.',
                'historical_context' => 'Impreso en 1995 por Industrias Offset Color S.R.L. conmemorando los 50 años de los históricos decretos de mayo de 1945.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => '50-anos-abolicion-pongueaje-mitaje-1995-190'],
            [
                'name' => '50 Años de la Abolición del Pongueaje y Mitaje (1945 - 1995) — Sello 1.90 Bs',
                'catalog_code' => 'BO.AGBC-11',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 1.90,
                'face_value' => 'Bs 1.90',
                'year' => 1995,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 0,
                'perforation' => '12.5 x 12.5 dentado clásico',
                'printing_technique' => 'Offset policromado por Industrias Offset Color S.R.L.',
                'paper_type' => 'Papel filatélico sin filigrana 1995',
                'gum_condition' => 'Goma virgen de época',
                'dimensions' => '74 x 36 mm (Díptico unido)',
                'front_image' => '/images/stamps/sello-50-anos-abolicion-pongueaje-y-mita-1995.png',
                'back_image' => '/images/stamps/sello-50-anos-abolicion-pongueaje-y-mita-1995.png',
                'is_featured' => false,
                'is_active' => false,
                'description' => 'Sello conmemorativo de 1.90 Bs que ilustra la abolición del pongueaje campesino y la reivindicación de las comunidades originarias del Decreto Histórico de 1945.',
                'historical_context' => 'Impreso en 1995 por Industrias Offset Color S.R.L. conmemorando los 50 años de los históricos decretos de mayo de 1945.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'bodas-de-oro-cefilco-cochabamba-2007'],
            [
                'name' => 'Díptico Bodas de Oro CEFILCO — Centro Filatélico Cochabamba (1957 - 2007) 6.00 Bs',
                'catalog_code' => 'BO.AGBC-12',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 6.00,
                'face_value' => 'Bs 6.00',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 11,
                'perforation' => '13.5 x 13.5 continuo',
                'printing_technique' => 'Offset a todo color con fotografía panorámica de Cochabamba',
                'paper_type' => 'Papel couché filatélico brillante',
                'gum_condition' => 'Goma mate original intacta',
                'dimensions' => '80 x 32 mm',
                'front_image' => '/images/stamps/sello-bodas-de-oro-cefilco-cochabamba-2007.png',
                'back_image' => '/images/stamps/sello-bodas-de-oro-cefilco-cochabamba-2007.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Díptico conmemorativo del medio siglo del Centro Filatélico Cochabamba, retratando el monumento al Cristo de la Concordia, la Catedral Metropolitana y el monumento a las Heroínas de la Coronilla.',
                'historical_context' => 'Homenaje a los 50 años de difusión del coleccionismo y la investigación filatélica en el valle cochabambino.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'cefilco-homenaje-cfc-cochabamba-2007'],
            [
                'name' => 'Díptico Bodas de Oro CEFILCO — Homenaje Centro Filatélico Cochabamba 3.50 Bs',
                'catalog_code' => 'BO.AGBC-13',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 3.50,
                'face_value' => 'Bs 3.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 0,
                'perforation' => '13.5 x 13.5 continuo',
                'printing_technique' => 'Offset a todo color con fotografía panorámica de Cochabamba',
                'paper_type' => 'Papel couché filatélico brillante',
                'gum_condition' => 'Goma mate original intacta',
                'dimensions' => '80 x 32 mm',
                'front_image' => '/images/stamps/sello-bodas-de-oro-cefilco-cochabamba-2007.png',
                'back_image' => '/images/stamps/sello-bodas-de-oro-cefilco-cochabamba-2007.png',
                'is_featured' => false,
                'is_active' => false,
                'description' => 'Homenaje de 3.50 Bs al Centro Filatélico Cochabamba (CFC), destacando el patrimonio epistolar y la tradición coleccionista del valle boliviano.',
                'historical_context' => 'Homenaje a los 50 años de difusión del coleccionismo y la investigación filatélica en el valle cochabambino.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'camara-nacional-industrias-75-anos-2007'],
            [
                'name' => '75 Años Cámara Nacional de Industrias — Desarrollo Nacional 12.00 Bs',
                'catalog_code' => 'BO.AGBC-14',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 12.00,
                'face_value' => 'Bs 12.00',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 10,
                'perforation' => '14 x 14 peine continuo',
                'printing_technique' => 'Offset polícromo sobre diseño conceptual metalmecánico y mapa nacional',
                'paper_type' => 'Papel satinado de seguridad CNI',
                'gum_condition' => 'Goma virgen intacta',
                'dimensions' => '80 x 32 mm (Díptico unido)',
                'front_image' => '/images/stamps/sello-camara-nacional-de-industrias-75-anos-2007.png',
                'back_image' => '/images/stamps/sello-camara-nacional-de-industrias-75-anos-2007.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Pareja conmemorativa unida que celebra las bodas de diamante de la industria manufacturera boliviana, con el sello distintivo ',
                'historical_context' => 'Diseño conjunto de Jackeline Arteaga y Guido Mallia impreso por Ind. Lara Bisch S.A.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'camara-nacional-industrias-75-anos-2007-9bs'],
            [
                'name' => '75 Años Cámara Nacional de Industrias — Promoviendo la Producción 9.00 Bs',
                'catalog_code' => 'BO.AGBC-15',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 9.00,
                'face_value' => 'Bs 9.00',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 0,
                'perforation' => '14 x 14 peine continuo',
                'printing_technique' => 'Offset polícromo sobre diseño conceptual metalmecánico y mapa nacional',
                'paper_type' => 'Papel satinado de seguridad CNI',
                'gum_condition' => 'Goma virgen intacta',
                'dimensions' => '80 x 32 mm (Díptico unido)',
                'front_image' => '/images/stamps/sello-camara-nacional-de-industrias-75-anos-2007.png',
                'back_image' => '/images/stamps/sello-camara-nacional-de-industrias-75-anos-2007.png',
                'is_featured' => false,
                'is_active' => false,
                'description' => 'Sello de 9.00 Bs de la Cámara Nacional de Industrias (CNI), promoviendo la producción nacional manufacturera y el empleo en Bolivia.',
                'historical_context' => 'Diseño conjunto de Jackeline Arteaga y Guido Mallia impreso por Ind. Lara Bisch S.A.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'navidad-arte-sacro-triptico-2007'],
            [
                'name' => 'Tríptico Arte Sacro — Adoración de los Pastores (Navidad 2007) 4.00 Bs',
                'catalog_code' => 'BO.AGBC-16',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 4.00,
                'face_value' => 'Bs 4.00',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 6,
                'perforation' => '13.5 x 13.5 peine',
                'printing_technique' => 'Offset polícromo de alta resolución sobre arte barroco virreinal',
                'paper_type' => 'Papel tizado postal de seguridad 102g',
                'gum_condition' => 'Goma original vegetal intacta',
                'dimensions' => '105 x 45 mm (Tríptico completo)',
                'front_image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'back_image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Excepcional tríptico conmemorativo de Arte Sacro navideño que reúne tres obras maestras pictóricas: Adoración de los Pastores (Pieter Aertsen), Epifanía (Gregorio Gamarra) y la Sagrada Familia (Luca Cambiaso).',
                'historical_context' => 'Emisión navideña oficial de Correos de Bolivia que rescata el acervo pictórico colonial y virreinal conservado en los museos nacionales.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'navidad-arte-sacro-epifania-2007'],
            [
                'name' => 'Tríptico Arte Sacro — Epifanía (Navidad 2007) 6.50 Bs',
                'catalog_code' => 'BO.AGBC-17',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 6.50,
                'face_value' => 'Bs 6.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 0,
                'perforation' => '13.5 x 13.5 peine',
                'printing_technique' => 'Offset polícromo de alta resolución sobre arte barroco virreinal',
                'paper_type' => 'Papel tizado postal de seguridad 102g',
                'gum_condition' => 'Goma original vegetal intacta',
                'dimensions' => '105 x 45 mm (Tríptico completo)',
                'front_image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'back_image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'is_featured' => false,
                'is_active' => false,
                'description' => 'Sello de 6.50 Bs representando la ',
                'historical_context' => 'Emisión navideña oficial de Correos de Bolivia que rescata el acervo pictórico colonial y virreinal conservado en los museos nacionales.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'navidad-arte-sacro-sagrada-familia-2007'],
            [
                'name' => 'Tríptico Arte Sacro — Sagrada Familia (Navidad 2007) 3.50 Bs',
                'catalog_code' => 'BO.AGBC-18',
                'category_id' => $catDipticos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 3.50,
                'face_value' => 'Bs 3.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 0,
                'perforation' => '13.5 x 13.5 peine',
                'printing_technique' => 'Offset polícromo de alta resolución sobre arte barroco virreinal',
                'paper_type' => 'Papel tizado postal de seguridad 102g',
                'gum_condition' => 'Goma original vegetal intacta',
                'dimensions' => '105 x 45 mm (Tríptico completo)',
                'front_image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'back_image' => '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
                'is_featured' => false,
                'is_active' => false,
                'description' => 'Sello de 3.50 Bs representando a la ',
                'historical_context' => 'Emisión navideña oficial de Correos de Bolivia que rescata el acervo pictórico colonial y virreinal conservado en los museos nacionales.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'conjefamer-xlvii-fuerzas-aereas-2007'],
            [
                'name' => 'Cooperación Hemisférica — XLVII CONJEFAMER Santa Cruz de la Sierra (2007)',
                'catalog_code' => 'BO.AGBC-19',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 10.50,
                'face_value' => 'Bs 10.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 17,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset polícromo con orla de banderas americanas',
                'paper_type' => 'Papel tizado de seguridad',
                'gum_condition' => 'Goma original',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-conjefamer-xlvii-fuerzas-aereas-2007.png',
                'back_image' => '/images/stamps/sello-conjefamer-xlvii-fuerzas-aereas-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Emisión oficial conmemorativa de la 47ª Conferencia de Jefes de las Fuerzas Aéreas Americanas celebrada en Santa Cruz de la Sierra, con el escudo del cóndor aéreo boliviano y pabellones continentales.',
                'historical_context' => 'Diseño de Lima Chuquimia impreso por Ind. Lara Bisch S.A. para el servicio aeropostal boliviano.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'colibri-cometa-sappho-sparganurus-potosi-2007'],
            [
                'name' => 'Fauna Silvestre de Potosí — Cernícalo Americano (Falco sparverius)',
                'catalog_code' => 'BO.AGBC-20',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 6.50,
                'face_value' => 'Bs 6.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 23,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía de precisión con reflejos metálicos',
                'paper_type' => 'Papel couché postal 105g',
                'gum_condition' => 'Goma original mate Never Hinged',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-colibri-cometa-sappho-sparganurus-potosi-2007.png',
                'back_image' => '/images/stamps/sello-colibri-cometa-sappho-sparganurus-potosi-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Hermoso ejemplar de Falco sparverius (Cernícalo Americano) posado sobre una rama en los paisajes montañosos del departamento de Potosí. Fotografía de Hermes Justiniano.',
                'historical_context' => 'Emisión oficial de Correos de Bolivia dedicada a la conservación y protección de la fauna silvestre altoandina.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'trogon-melanurus-ave-pando-2007'],
            [
                'name' => 'Fauna de la Amazonía — Ave Trogon melanurus (Pando)',
                'catalog_code' => 'BO.AGBC-21',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 6.50,
                'face_value' => 'Bs 6.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 25,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset a seis tintas con pigmentos resistentes a la luz',
                'paper_type' => 'Papel couché filatélico 105g',
                'gum_condition' => 'Goma original mate intacta',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-trogon-melanurus-ave-pando-2007.png',
                'back_image' => '/images/stamps/sello-trogon-melanurus-ave-pando-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Soberbio ejemplar macho de Trogon melanurus posado en la espesura del bosque húmedo pandino, mostrando su vientre escarlata y dorso esmeralda. Fotografía del afamado conservacionista Hermes Justiniano.',
                'historical_context' => 'Serie oficial Correos de Bolivia dedicada a la biodiversidad alada del norte amazónico.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'ciguenuela-cuellinegra-himantopus-mexicanus-2007'],
            [
                'name' => 'Aves Acuáticas de los Salares — Cigüeñuela Cuellinegra (Himantopus mexicanus)',
                'catalog_code' => 'BO.AGBC-22',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 6.50,
                'face_value' => 'Bs 6.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 21,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía sobre foto de campo',
                'paper_type' => 'Papel filatélico satinado',
                'gum_condition' => 'Goma mate original',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-ciguenuela-cuellinegra-himantopus-mexicanus-2007.png',
                'back_image' => '/images/stamps/sello-ciguenuela-cuellinegra-himantopus-mexicanus-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Elegante ave limícola de larguísimas patas rojas vadeando las orillas salinas del lago Uru Uru y Poopó. Fotografía de Hermes Justiniano.',
                'historical_context' => 'Serie oficial dedicada a la avifauna de los humedales Ramsar del Altiplano boliviano.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'valle-de-zongo-paisajes-la-paz-2007'],
            [
                'name' => 'Paisajes Naturales de Bolivia — Valle de Zongo (La Paz)',
                'catalog_code' => 'BO.AGBC-23',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionSoberania->id,
                'price' => 5.50,
                'face_value' => 'Bs 5.50',
                'year' => 2007,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 24,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía de paisaje',
                'paper_type' => 'Papel engomado de seguridad',
                'gum_condition' => 'Goma original',
                'dimensions' => '40 x 32 mm',
                'front_image' => '/images/stamps/sello-valle-de-zongo-paisajes-de-la-paz-2007.png',
                'back_image' => '/images/stamps/sello-valle-de-zongo-paisajes-de-la-paz-2007.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Panorámica de los imponentes cañones y cascadas del Valle de Zongo, donde las nieves del Huayna Potosí descienden hacia los valles templados y yungas paceños.',
                'historical_context' => 'Emisión oficial de Correos de Bolivia para promover el ecoturismo y la preservación de cuencas hidrológicas.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'campana-de-la-libertad-sucre-2009'],
            [
                'name' => 'Bicentenario de la Gesta Libertaria — Campana de la Libertad (Sucre 1809 - 2009)',
                'catalog_code' => 'BO.AGBC-24',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 5.50,
                'face_value' => 'Bs 5.50',
                'year' => 2009,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 20,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía nocturna de alta gama con foco luminoso',
                'paper_type' => 'Papel engomado de seguridad 105g',
                'gum_condition' => 'Goma original mate perfecta',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-campana-de-la-libertad-sucre-2009.png',
                'back_image' => '/images/stamps/sello-campana-de-la-libertad-sucre-2009.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Impactante fotografía nocturna iluminada de la histórica torre y campanario de la Basílica de San Francisco de Chuquisaca, cuyo repique el 25 de mayo de 1809 dio inicio a la independencia de América.',
                'historical_context' => 'Emitida por Correos de Bolivia anticipando las magnas celebraciones del Bicentenario del Primer Grito Libertario de Charcas.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'frutas-mango-boliviano-2012'],
            [
                'name' => 'Frutas Nativas y Tropicales — Mango Criollo de los Valles Calientes (D.S. 29799)',
                'catalog_code' => 'BO.AGBC-25',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 5.50,
                'face_value' => 'Bs 5.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'COMMON',
                'certified' => true,
                'stock' => 32,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía botánica',
                'paper_type' => 'Papel satinado libre de ácido',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-frutas-mango-boliviano-2012.png',
                'back_image' => '/images/stamps/sello-frutas-mango-boliviano-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Fruto maduro de mango con sus tonalidades rojizas y doradas, representativo de los valles templados y la cuenca amazónica de Bolivia. Fotografía de Eusebio Apaza.',
                'historical_context' => 'Serie oficial autorizada bajo el Decreto Supremo 29799 para promover los frutos de la tierra boliviana.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'frutas-nativas-papaya-tropical-2011'],
            [
                'name' => 'Frutas Nativas de Bolivia — Papaya Tropical de los Valles (D.S. 29799)',
                'catalog_code' => 'BO.AGBC-26',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 7.50,
                'face_value' => 'Bs 7.50',
                'year' => 2011,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 22,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía con barniz de brillo',
                'paper_type' => 'Papel tizado mate de seguridad',
                'gum_condition' => 'Goma intacta',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-frutas-papaya-tropical-2011.png',
                'back_image' => '/images/stamps/sello-frutas-papaya-tropical-2011.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Retrato de frutas tropicales de Bolivia mostrando la pulpa brillante y las semillas características de la papaya andina y amazónica. Fotografía de Eusebio Apaza.',
                'historical_context' => 'Serie oficial destinada al franqueo aéreo internacional autorizada bajo el Decreto Supremo 29799.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'frutas-platano-boliviano-2012'],
            [
                'name' => 'Frutas Tropicales de Bolivia — Plátano de los Llanos y Yungas (D.S. 29799)',
                'catalog_code' => 'BO.AGBC-27',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 10.50,
                'face_value' => 'Bs 10.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'COMMON',
                'certified' => true,
                'stock' => 35,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset policromía con barniz UV protector',
                'paper_type' => 'Papel engomado de seguridad',
                'gum_condition' => 'Goma original',
                'dimensions' => '40 x 32 mm',
                'front_image' => '/images/stamps/sello-frutas-platano-boliviano-2012.png',
                'back_image' => '/images/stamps/sello-frutas-platano-boliviano-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Racimo maduro de plátanos bolivianos cultivados en las llanuras fértiles de Chapare y el trópico oriental.',
                'historical_context' => 'Parte de la serie agrícola boliviana amparada en el Decreto Supremo 29799.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'frutas-nativas-naranja-boliviana-2012'],
            [
                'name' => 'Frutas Nativas y Cítricos de los Yungas — Naranja Boliviana (D.S. 29799)',
                'catalog_code' => 'BO.AGBC-28',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 1.50,
                'face_value' => 'Bs 1.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 30,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía con barniz UV de protección',
                'paper_type' => 'Papel satinado libre de ácido 105g',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-frutas-naranjas-bolivianas-2012.png',
                'back_image' => '/images/stamps/sello-frutas-naranjas-bolivianas-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Sello que rinde homenaje a la riqueza citrícola de las fértiles regiones de los Yungas y valles bolivianos. Fotografía botánica de alta resolución capturada por Eusebio Apaza.',
                'historical_context' => 'Parte de la emblemática serie agronómica autorizada por el D.S. 29799 para promover la soberanía alimentaria y agrícola nacional.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'campana-filatelica-feliz-sello-postal-2001'],
            [
                'name' => 'Campaña Filatélica Juvenil — Estoy feliz porque soy un sello postal (2001)',
                'catalog_code' => 'BO.AGBC-29',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 2.50,
                'face_value' => 'Bs 2.50',
                'year' => 2001,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 16,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset monocromo en verde selva esmeralda',
                'paper_type' => 'Papel de seguridad filatélico',
                'gum_condition' => 'Goma virgen de época',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-campana-infantil-feliz-porque-soy-un-sello-2001.png',
                'back_image' => '/images/stamps/sello-campana-infantil-feliz-porque-soy-un-sello-2001.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Divertida y memorable viñeta postal donde un sello animado sonríe relajado en su charnela de colección, diseñada por el estudio VISUALL para promover la afición filatélica entre niños y jóvenes.',
                'historical_context' => 'Campaña pedagógica impulsada por la Empresa de Correos de Bolivia a principios del milenio.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'energia-solar-energia-sostenible-2012'],
            [
                'name' => 'Energías Renovables — Generación de Energía Solar Fotovoltaica (2012)',
                'catalog_code' => 'BO.AGBC-30',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 3.50,
                'face_value' => 'Bs 3.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 25,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía sobre paisaje del nevado Illimani y comunidades rurales',
                'paper_type' => 'Papel de seguridad ecológico',
                'gum_condition' => 'Goma original',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-energia-solar-ano-internacional-energia-sostenible-2012.png',
                'back_image' => '/images/stamps/sello-energia-solar-ano-internacional-energia-sostenible-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Sello que conmemora el Año Internacional de la Energía Sostenible para Todos, ilustrando un panel solar comunitario en vivienda rural del Altiplano frente a la cordillera.',
                'historical_context' => 'Proclamación de la Asamblea General de la ONU para universalizar las energías limpias.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'revolucion-educativa-escuela-warisata-2012'],
            [
                'name' => 'Revolución Educativa — Escuela Indígena de Warisata y Ley Avelino Siñani (2012)',
                'catalog_code' => 'BO.AGBC-31',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 2.50,
                'face_value' => 'Bs 2.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 25,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset en viraje sepia histórico y detalles tricolor por Artes Gráficas Sagitario S.R.L.',
                'paper_type' => 'Papel mate de seguridad postal',
                'gum_condition' => 'Goma original mate',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-revolucion-educativa-escuela-warisata-2012.png',
                'back_image' => '/images/stamps/sello-revolucion-educativa-escuela-warisata-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Fotografía histórica de los fundadores comunarios, ancianos amautas y maestros de la Escuela-Ayllu de Warisata (1931), cuna de la educación productiva y comunitaria en los Andes.',
                'historical_context' => 'Promulgación de la Ley de Educación No. 070 y homenaje a Elizardo Pérez y Avelino Siñani.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'navidad-cefilco-arbol-infantil-2012'],
            [
                'name' => 'Navidad 2012 CEFILCO — Concurso Infantil de Arte Postal (Árbol y Pesebre)',
                'catalog_code' => 'BO.AGBC-32',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 2.50,
                'face_value' => 'Bs 2.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 28,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset a todo color sobre acuarela infantil',
                'paper_type' => 'Papel engomado de seguridad',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '34 x 40 mm',
                'front_image' => '/images/stamps/sello-navidad-cefilco-arbol-infantil-2012.png',
                'back_image' => '/images/stamps/sello-navidad-cefilco-arbol-infantil-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Obra ganadora del Certamen Navideño Juvenil de Cochabamba pintada por la niña Stefany Gissell Robles (11 años), mostrando un abeto con esferas vivas y el pesebre en su tronco.',
                'historical_context' => 'Edición impulsada por el Centro Filatélico Cochabamba para incentivar el coleccionismo en nuevas generaciones.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'mmaya-octubre-agua-y-vida-2012'],
            [
                'name' => 'Preservación Ambiental — Octubre, Mes del Agua y de la Vida (MMAyA)',
                'catalog_code' => 'BO.AGBC-33',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionSoberania->id,
                'price' => 10.50,
                'face_value' => 'Bs 10.50',
                'year' => 2012,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 22,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset cuatricromía brillante',
                'paper_type' => 'Papel ecológico de seguridad',
                'gum_condition' => 'Goma original',
                'dimensions' => '40 x 32 mm',
                'front_image' => '/images/stamps/sello-mmaya-octubre-agua-y-vida-2012.png',
                'back_image' => '/images/stamps/sello-mmaya-octubre-agua-y-vida-2012.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Sello institucional del Ministerio de Medio Ambiente y Agua de Bolivia destacando los humedales amazónicos y pantanales del oriente bajo la consigna constitucional de acceso universal al agua dulce.',
                'historical_context' => 'Conmemoración del mes del agua y fortalecimiento de las áreas protegidas bolivianas.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'carnaval-de-oruro-morenada-zona-norte-2006'],
            [
                'name' => 'Obra Maestra Oral e Intangible — Carnaval de Oruro (Morenada Zona Norte)',
                'catalog_code' => 'BO.AGBC-34',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 10.50,
                'face_value' => 'Bs 10.50',
                'year' => 2006,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 15,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset de alto contraste cromático sobre fotografía folclórica',
                'paper_type' => 'Papel couché brillante 110g',
                'gum_condition' => 'Goma original mate perfecta',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-carnaval-de-oruro-morenada-zona-norte-2006.png',
                'back_image' => '/images/stamps/sello-carnaval-de-oruro-morenada-zona-norte-2006.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Danzante de la Centenaria Morenada ',
                'historical_context' => 'Celebración de la declaratoria del Carnaval de Oruro por la UNESCO como Obra Maestra del Patrimonio Oral e Intangible de la Humanidad.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'att-soberania-postal-telecomunicaciones-2015'],
            [
                'name' => 'Soberanía Postal y Telecomunicaciones ATT — Patrimonio de Bolivia (D.S. 29799)',
                'catalog_code' => 'BO.AGBC-35',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 1.50,
                'face_value' => 'Bs 1.50',
                'year' => 2015,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 25,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset litográfico cuatricromía',
                'paper_type' => 'Papel engomado fosforescente de seguridad',
                'gum_condition' => 'Goma sintética PVA impecable',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-att-soberania-postal-y-telecomunicaciones-2015.png',
                'back_image' => '/images/stamps/sello-att-soberania-postal-y-telecomunicaciones-2015.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Diseño heráldico y geográfico que integra el mapa de Bolivia envuelto en la bandera tricolor y la wiphala, con estampas del Jaguar amazónico, el lago Titicaca, el Cristo de la Concordia y las misiones chiquitanas.',
                'historical_context' => 'Emisión conjunta con la Autoridad de Regulación y Fiscalización de Telecomunicaciones y Transportes (ATT) respaldada por el D.S. 29799.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'sesquicentenario-mariscal-andres-santa-cruz-2015'],
            [
                'name' => 'Sesquicentenario de la Muerte del Mcal. Andrés de Santa Cruz y Calahumana (1792 - 1865)',
                'catalog_code' => 'BO.AGBC-36',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 2.00,
                'face_value' => 'Bs 2.00',
                'year' => 2015,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 19,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset de gala sobre fondo carmesí con filigranas doradas',
                'paper_type' => 'Papel couché de seguridad filatélico',
                'gum_condition' => 'Goma original Never Hinged',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-sesquicentenario-mariscal-andres-santa-cruz-2015.png',
                'back_image' => '/images/stamps/sello-sesquicentenario-mariscal-andres-santa-cruz-2015.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Retrato de Estado del Gran Mariscal de Zepita y Protector de la Confederación Perú-Boliviana, organizador de la República y de los Códigos Santa Cruz.',
                'historical_context' => 'Emisión conmemorativa por los 150 años de su fallecimiento en Versalles, Francia (1865).',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'manantiales-del-silala-potosi-18bs-2016'],
            [
                'name' => 'Soberanía Hídrica — Manantiales del Silala (Potosí) 18.00 Bs',
                'catalog_code' => 'BO.AGBC-37',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionSoberania->id,
                'price' => 18.00,
                'face_value' => 'Bs 18.00',
                'year' => 2016,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 18,
                'perforation' => '14 x 14 micro-perforado',
                'printing_technique' => 'Offset policromía en alta fidelidad fotográfica',
                'paper_type' => 'Papel de seguridad con fibras ópticas invisibles',
                'gum_condition' => 'Goma virgen Never Hinged',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-manantiales-del-silala-potosi-18bs-2016.png',
                'back_image' => '/images/stamps/sello-manantiales-del-silala-potosi-18bs-2016.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Emisión postal que documenta los afloramientos y humedales de los manantiales del Silala en el departamento de Potosí, pieza clave en la defensa jurídica y soberana de los recursos hídricos.',
                'historical_context' => 'Coordinada con DireSilala (Dirección Estratégica de Reivindicación de los Manantiales del Silala) en 2016.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'manantiales-del-silala-potosi-14bs-2016'],
            [
                'name' => 'Manantiales del Silala — Soberanía Hídrica Potosí 14.00 Bs',
                'catalog_code' => 'BO.AGBC-38',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionSoberania->id,
                'price' => 14.00,
                'face_value' => 'Bs 14.00',
                'year' => 2016,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 20,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía de paisaje',
                'paper_type' => 'Papel de seguridad con microtexto',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-manantiales-del-silala-potosi-14bs-2016.png',
                'back_image' => '/images/stamps/sello-manantiales-del-silala-potosi-14bs-2016.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Segundo valor facial de la emblemática emisión del Silala que retrata el cauce transparente y los bofedales altoandinos del departamento de Potosí.',
                'historical_context' => 'Emitido por Correos de Bolivia y DireSilala en resguardo de la soberanía de las aguas manantiales.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => '50-anos-fe-y-alegria-bolivia-2016'],
            [
                'name' => 'Emisión Filatélica de Beneficencia — 50 Años Fe y Alegría Bolivia (1966 - 2016)',
                'catalog_code' => 'BO.AGBC-39',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 100.00,
                'face_value' => 'Bs 100.00',
                'year' => 2016,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'VERY_RARE',
                'certified' => true,
                'stock' => 9,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset de alta gama con barniz sectorizado',
                'paper_type' => 'Papel especial filatélico de alta seguridad con fibrillas fluorescentes',
                'gum_condition' => 'Goma original Never Hinged de alta gama',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-50-anos-fe-y-alegria-bolivia-2016.png',
                'back_image' => '/images/stamps/sello-50-anos-fe-y-alegria-bolivia-2016.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Una de las estampillas contemporáneas con el mayor valor facial de la filatelia moderna boliviana (Bs 100.00). Muestra sonrisas de niños de escuelas rurales de Fe y Alegría, movimiento de educación popular y promoción social.',
                'historical_context' => 'Edición conmemorativa de 50 años de labor educativa ininterrumpida en las comunidades más vulnerables del país.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'palkachupa-phibalura-boliviana-2017'],
            [
                'name' => 'Joya Alada Endémica — Palkachupa en Peligro Crítico (Phibalura boliviana)',
                'catalog_code' => 'BO.AGBC-40',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 0.50,
                'face_value' => 'Bs 0.50',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 30,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset polícromo sobre ilustración zoológica de precisión',
                'paper_type' => 'Papel couché postal de seguridad',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-palkachupa-phibalura-boliviana-2017.png',
                'back_image' => '/images/stamps/sello-palkachupa-phibalura-boliviana-2017.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Ave paseriforme de larga cola en golondrina (palka-chupa en quechua) que habita exclusivamente en los valles interandinos de Apolo y el Área Natural Madidi.',
                'historical_context' => 'Sello conmemorativo de la conservación de la fauna boliviana impreso por Ind. Lara Bisch S.A.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'paujil-copete-de-piedra-pauxi-unicornis-2017'],
            [
                'name' => 'Fauna en Peligro de Extinción — Paujil Copete de Piedra (Pauxi unicornis)',
                'catalog_code' => 'BO.AGBC-41',
                'category_id' => $catFaunaFlora->id,
                'emission_id' => $emisionFaunaFlora->id,
                'price' => 3.00,
                'face_value' => 'Bs 3.00',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 18,
                'perforation' => '14 x 14',
                'printing_technique' => 'Ilustración científica ornitológica en cuatricromía offset',
                'paper_type' => 'Papel de seguridad con filigrana',
                'gum_condition' => 'Goma original mate intacta',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-paujil-copete-de-piedra-pauxi-unicornis-2017.png',
                'back_image' => '/images/stamps/sello-paujil-copete-de-piedra-pauxi-unicornis-2017.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Una de las aves más raras y enigmáticas del planeta, endémica de las laderas orientales andinas del Parque Nacional Amboró y Carrasco, reconocible por su cuerno o tubérculo celeste en la frente.',
                'historical_context' => 'Emisión de sensibilización para evitar la pérdida del hábitat de los Yungas y bosques nublados.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'personalidades-filatelia-barrientos-peredo-2017'],
            [
                'name' => 'Personalidades de la Filatelia Boliviana — Don José Barrientos y Martha V. de Peredo',
                'catalog_code' => 'BO.AGBC-42',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 20.00,
                'face_value' => 'Bs 20.00',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 14,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset polícromo con collage de sellos clásicos y lupa de peritaje',
                'paper_type' => 'Papel de seguridad con filigrana institucional',
                'gum_condition' => 'Goma virgen Never Hinged',
                'dimensions' => '42 x 32 mm',
                'front_image' => '/images/stamps/sello-personalidades-filatelia-barrientos-y-peredo-2017.png',
                'back_image' => '/images/stamps/sello-personalidades-filatelia-barrientos-y-peredo-2017.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Tributo a dos figuras legendarias que consagraron su vida al estudio, preservación y catalogación de los tesoros postales de Bolivia, acompañados por instrumental de examen pericial.',
                'historical_context' => 'Emisión histórica de honor otorgada por Correos del Estado Plurinacional de Bolivia.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'bicentenario-batalla-de-la-tablada-2017'],
            [
                'name' => 'Bicentenario de la Batalla de La Tablada (1817 - 2017) — Tarija',
                'catalog_code' => 'BO.AGBC-43',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 20.00,
                'face_value' => 'Bs 20.00',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 14,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Litografía offset en cuatricromía sobre óleo histórico del Cnel. Eustaquio Moto Méndez',
                'paper_type' => 'Papel tizado de 110g de seguridad',
                'gum_condition' => 'Goma tropicalizada original intacta',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-bicentenario-batalla-de-la-tablada-2017.png',
                'back_image' => '/images/stamps/sello-bicentenario-batalla-de-la-tablada-2017.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Magnífico lienzo ecuestre que recrea la épica carga de los Montoneros de Méndez durante la victoria patriota en los campos de La Tablada de Tolomosa, sellando la libertad de Tarija.',
                'historical_context' => 'Emitida por Correos de Bolivia con motivo de los 200 años de la gesta heroica del 15 de abril de 1817.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => '150-anos-primer-sello-postal-boliviano-2017'],
            [
                'name' => 'Sesquicentenario del Primer Sello Postal Boliviano (1867 - 2017) — Cóndor 5 Centavos',
                'catalog_code' => 'BO-2017-CONDOR-150',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 190.00,
                'face_value' => 'Bs 5.00',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'MUSEUM_PIECE',
                'certified' => true,
                'stock' => 8,
                'perforation' => '13.5 x 13.5',
                'printing_technique' => 'Offset de alta definición con reproducción facsimilar del grabado original de 1867',
                'paper_type' => 'Papel pergamino filatélico con fibrillas de seguridad',
                'gum_condition' => 'Goma original de primera calidad',
                'dimensions' => '48 x 36 mm',
                'front_image' => '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png',
                'back_image' => '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Homenaje de gala al mítico sello Cóndor de 1867. Reproduce el óvalo heráldico con el cóndor andino con las alas desplegadas que inauguró la historia postal independiente de Bolivia.',
                'historical_context' => 'Celebración de los 150 años de la primera emisión filatélica de la República de Bolivia bajo la presidencia de Mariano Melgarejo.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'goyi-suplemento-estudiantil-50-anos-2017'],
            [
                'name' => 'Prensa y Educación Juvenil — 50 Años de GOYI Suplemento Estudiantil (1967 - 2017)',
                'catalog_code' => 'BO.AGBC-45',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 4.00,
                'face_value' => 'Bs 4.00',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 22,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset cuatricromía a colores vivos',
                'paper_type' => 'Papel couché de seguridad',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-goyi-suplemento-estudiantil-50-anos-2017.png',
                'back_image' => '/images/stamps/sello-goyi-suplemento-estudiantil-50-anos-2017.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Retrato de Don F. Jaime Sanjinés Vidal junto al entrañable personaje infantil GOYI, emblema de la prensa educativa que alfabetizó y educó a generaciones de estudiantes bolivianos.',
                'historical_context' => 'Homenaje de Correos de Bolivia al suplemento infantil más leído en la historia de la prensa boliviana.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'presidente-gonzalo-sanchez-de-lozada-1994'],
            [
                'name' => 'Mandatarios Constitucionales — Lic. Gonzalo Sánchez de Lozada (1994)',
                'catalog_code' => 'BO.AGBC-46',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionHistoria->id,
                'price' => 2.30,
                'face_value' => 'Bs 2.30',
                'year' => 1994,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 14,
                'perforation' => '12.5 x 12.5',
                'printing_technique' => 'Offset litográfico con escudo nacional en dorado por La Papelera S.A.',
                'paper_type' => 'Papel satinado de seguridad nacional 1994',
                'gum_condition' => 'Goma original intacta',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-presidente-gonzalo-sanchez-de-lozada-1994.png',
                'back_image' => '/images/stamps/sello-presidente-gonzalo-sanchez-de-lozada-1994.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Retrato protocolar del Presidente Constitucional de la República con banda presidencial y medalla del Libertador Simón Bolívar.',
                'historical_context' => 'Impreso por La Papelera S.A. en 1994 para el servicio postal ordinario e internacional.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'centenario-escuela-maestros-simon-bolivar-2017'],
            [
                'name' => 'Centenario de la Escuela Superior de Formación de Maestros Simón Bolívar (1917 - 2017)',
                'catalog_code' => 'BO.AGBC-47',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionDesarrollo->id,
                'price' => 10.00,
                'face_value' => 'Bs 10.00',
                'year' => 2017,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'SCARCE',
                'certified' => true,
                'stock' => 20,
                'perforation' => '14 x 14',
                'printing_technique' => 'Offset con grabado del blasón ',
                'paper_type' => 'Papel estucado 105g',
                'gum_condition' => 'Goma original mate',
                'dimensions' => '32 x 40 mm',
                'front_image' => '/images/stamps/sello-centenario-escuela-maestros-simon-bolivar-2017.png',
                'back_image' => '/images/stamps/sello-centenario-escuela-maestros-simon-bolivar-2017.png',
                'is_featured' => false,
                'is_active' => true,
                'description' => 'Emisión de gala por los 100 años de la insigne Escuela Normal Simón Bolívar de La Paz, formadora de generaciones de maestros y pedagogos de la patria.',
                'historical_context' => 'Homenaje a la institución fundada el 24 de mayo de 1917 bajo la presidencia de Ismael Montes.',
            ]
        );

        Product::updateOrCreate(
            ['slug' => 'navidad-pluricultural-ekeko-potosi-2022'],
            [
                'name' => 'Tradición e Identidad — Navidad Pluricultural 2022 (Illa del Ekeko y Cerro Rico)',
                'catalog_code' => 'BO.AGBC-48',
                'category_id' => $catSellos->id,
                'emission_id' => $emisionCultura->id,
                'price' => 16.00,
                'face_value' => 'Bs 16.00',
                'year' => 2022,
                'country' => 'Bolivia',
                'condition' => 'MINT_NH',
                'rarity' => 'RARE',
                'certified' => true,
                'stock' => 15,
                'perforation' => '14 x 14 micro-dentado',
                'printing_technique' => 'Impresión offset digital de alta definición',
                'paper_type' => 'Papel tizado de seguridad con fibras de seguridad 2022',
                'gum_condition' => 'Goma sintética vegetal impecable',
                'dimensions' => '32 x 42 mm',
                'front_image' => '/images/stamps/sello-navidad-pluricultural-ekeko-potosi-2022.png',
                'back_image' => '/images/stamps/sello-navidad-pluricultural-ekeko-potosi-2022.png',
                'is_featured' => true,
                'is_active' => true,
                'description' => 'Magnífica composición que reúne la lítica Illa del Ekeko repatriada a Bolivia, el imponente Cerro Rico de Potosí de fondo y un pesebre con figuras de cerámica luciendo atuendos de los pueblos indígenas originarios campesinos.',
                'historical_context' => 'Emitida por Correos de Bolivia en coordinación con el Ministerio de Culturas, Descolonización y Despatriarcalización.',
            ]
        );

        // 6. Órdenes Realistas con Envíos y Estados Variados sobre Sellos Reales de Bolivia
        $prodReal1 = Product::where('slug', 'navidad-arte-sacro-triptico-2007')->first() ?? Product::first();
        $prodReal2 = Product::where('slug', 'att-soberania-postal-telecomunicaciones-2015')->first() ?? Product::first();
        $prodReal3 = Product::where('slug', 'frutas-nativas-naranja-boliviana-2012')->first() ?? Product::first();
        $prodReal4 = Product::where('slug', 'centenario-fuerza-aerea-boliviana-2023')->first() ?? Product::first();
        $prodReal5 = Product::where('slug', 'bicentenario-batalla-de-la-tablada-2017')->first() ?? Product::first();

        $ordersData = [
            [
                'order_number' => 'ORD-2026-0101',
                'customer_name' => 'Lic. Carlos Mesa Gisbert',
                'customer_email' => 'cmesa@historiabolivia.org',
                'customer_phone' => '+591 72011223',
                'shipping_address' => 'Zona Sopocachi, Calle Guachalla #450',
                'city' => 'La Paz',
                'department' => 'La Paz',
                'total_amount' => 185.00,
                'status' => 'DELIVERED',
                'payment_method' => 'QR_TRANSFER',
                'tracking_code' => 'BO-CORREOS-LPZ-001',
                'product' => $prodReal1,
            ],
            [
                'order_number' => 'ORD-2026-0102',
                'customer_name' => 'Ing. Roberto Justiniano',
                'customer_email' => 'roberto.justiniano@empresa.bo',
                'customer_phone' => '+591 77344556',
                'shipping_address' => 'Equipetrol Norte, Calle 7 Este #89',
                'city' => 'Santa Cruz de la Sierra',
                'department' => 'Santa Cruz',
                'total_amount' => 90.00,
                'status' => 'SHIPPED',
                'payment_method' => 'CREDIT_CARD',
                'tracking_code' => 'BO-CORREOS-SCZ-002',
                'product' => $prodReal2,
            ],
            [
                'order_number' => 'ORD-2026-0103',
                'customer_name' => 'Dra. Elena Torrico',
                'customer_email' => 'elena.torrico@medicina.bo',
                'customer_phone' => '+591 70788990',
                'shipping_address' => 'Av. Ballivián #670, El Prado',
                'city' => 'Cochabamba',
                'department' => 'Cochabamba',
                'total_amount' => 76.00,
                'status' => 'PACKED_GLASSINE',
                'payment_method' => 'QR_TRANSFER',
                'tracking_code' => 'BO-CORREOS-CBB-003',
                'product' => $prodReal3,
            ],
            [
                'order_number' => 'ORD-2026-0104',
                'customer_name' => 'Dr. Fernando Arze',
                'customer_email' => 'coleccionista@filatelia.bo',
                'customer_phone' => '+591 71234567',
                'shipping_address' => 'Calle Calvo #112, Centro Histórico',
                'city' => 'Sucre',
                'department' => 'Chuquisaca',
                'total_amount' => 120.00,
                'status' => 'VAULT_PREPARATION',
                'payment_method' => 'QR_TRANSFER',
                'tracking_code' => 'BO-CORREOS-CHQ-004',
                'product' => $prodReal4,
            ],
            [
                'order_number' => 'ORD-2026-0105',
                'customer_name' => 'Arq. Mauricio Vaca',
                'customer_email' => 'mvaca@tarijapatrimonio.org',
                'customer_phone' => '+591 76199887',
                'shipping_address' => 'Barrio San Roque, Calle Corrado #210',
                'city' => 'Tarija',
                'department' => 'Tarija',
                'total_amount' => 140.00,
                'status' => 'PENDING',
                'payment_method' => 'VAULT_PICKUP',
                'tracking_code' => null,
                'product' => $prodReal5,
            ],
            [
                'order_number' => 'ORD-2026-0106',
                'customer_name' => 'Lic. Patricia Beltrán',
                'customer_email' => 'pbeltran@cultura.gob.bo',
                'customer_phone' => '+591 75200334',
                'shipping_address' => 'Calle 6 de Octubre #1450',
                'city' => 'Oruro',
                'department' => 'Oruro',
                'total_amount' => 76.00,
                'status' => 'SHIPPED',
                'payment_method' => 'QR_TRANSFER',
                'tracking_code' => 'BO-CORREOS-ORU-005',
                'product' => $prodReal3,
            ],
        ];

        foreach ($ordersData as $oData) {
            $order = Order::firstOrCreate(
                ['order_number' => $oData['order_number']],
                [
                    'user_id' => $cliente->id,
                    'customer_name' => $oData['customer_name'],
                    'customer_email' => $oData['customer_email'],
                    'customer_phone' => $oData['customer_phone'],
                    'shipping_address' => $oData['shipping_address'],
                    'city' => $oData['city'],
                    'department' => $oData['department'],
                    'total_amount' => $oData['total_amount'],
                    'status' => $oData['status'],
                    'payment_method' => $oData['payment_method'],
                    'tracking_code' => $oData['tracking_code'],
                    'special_notes' => 'Manipular exclusivamente con guantes de algodón. Bóveda Central Correos.',
                ]
            );

            OrderItem::firstOrCreate(
                ['order_id' => $order->id, 'product_id' => $oData['product']->id],
                [
                    'product_name' => $oData['product']->name,
                    'unit_price' => $oData['product']->price,
                    'quantity' => 1,
                    'subtotal' => $oData['product']->price,
                ]
            );

            // Si tiene tracking code, registrar en tabla de envíos
            if ($oData['tracking_code']) {
                Shipment::firstOrCreate(
                    ['tracking_code' => $oData['tracking_code']],
                    [
                        'order_id' => $order->id,
                        'carrier' => 'Correos de Bolivia - Valija Diplomática / Postal',
                        'status' => $oData['status'] === 'DELIVERED' ? 'DELIVERED' : ($oData['status'] === 'SHIPPED' ? 'IN_TRANSIT' : 'DISPATCHED'),
                        'origin_department' => 'La Paz',
                        'destination_department' => $oData['department'],
                        'shipped_at' => now()->subDays(rand(1, 4)),
                        'delivered_at' => $oData['status'] === 'DELIVERED' ? now()->subHours(6) : null,
                        'notes' => 'Custodia postal en valija sellada con precinto numismático.',
                    ]
                );
            }
        }

        // 7. Casos y Tickets de Soporte
        SupportTicket::firstOrCreate(
            ['ticket_code' => 'TCK-2026-001'],
            [
                'customer_name' => 'Lic. Carlos Mesa Gisbert',
                'customer_email' => 'cmesa@historiabolivia.org',
                'customer_phone' => '+591 72011223',
                'order_id' => 1,
                'subject' => 'Consulta de Autenticidad y Peritaje Tríptico Arte Sacro',
                'message' => 'Solicito copia digital del certificado de la Dirección Filatélica para mi archivo histórico.',
                'priority' => 'HIGH',
                'status' => 'IN_PROGRESS',
                'assigned_user_id' => $almacen->id,
                'resolution_notes' => 'Se envió PDF con sello notarial y resolución de peritaje oficial.',
            ]
        );

        SupportTicket::firstOrCreate(
            ['ticket_code' => 'TCK-2026-002'],
            [
                'customer_name' => 'Ing. Roberto Justiniano',
                'customer_email' => 'roberto.justiniano@empresa.bo',
                'customer_phone' => '+591 77344556',
                'order_id' => 2,
                'subject' => 'Confirmación de Horario de Entrega Postal en Santa Cruz',
                'message' => '¿Podrían entregar el paquete en oficina central de Correos Santa Cruz para retiro personal?',
                'priority' => 'NORMAL',
                'status' => 'PENDING',
                'assigned_user_id' => $almacen->id,
                'resolution_notes' => null,
            ]
        );

        SupportTicket::firstOrCreate(
            ['ticket_code' => 'TCK-2026-003'],
            [
                'customer_name' => 'Dra. Elena Torrico',
                'customer_email' => 'elena.torrico@medicina.bo',
                'customer_phone' => '+591 70788990',
                'order_id' => 3,
                'subject' => 'Embalaje Especial en Papel Pergamino / Glassine',
                'message' => 'Deseo verificar que la serie filatélica venga con doble protección contra la humedad.',
                'priority' => 'NORMAL',
                'status' => 'RESOLVED',
                'assigned_user_id' => $almacen->id,
                'resolution_notes' => 'Confirmado con Jefe de Bóveda: embalaje con doble sobre glassine libre de ácido.',
            ]
        );

        // 8. Movimientos de Inventario
        InventoryMovement::firstOrCreate(
            ['reason' => 'Ingreso inicial por decreto supremo de emisión'],
            [
                'product_id' => $prodReal1->id,
                'user_id' => $almacen->id,
                'type' => 'IN',
                'quantity' => 10,
                'previous_stock' => 0,
                'new_stock' => 10,
                'department' => 'La Paz',
                'notes' => 'Custodia en Bóveda A1 - Caja de Seguridad Oficial.',
            ]
        );

        InventoryMovement::firstOrCreate(
            ['reason' => 'Despacho por orden ORD-2026-0101'],
            [
                'product_id' => $prodReal1->id,
                'user_id' => $almacen->id,
                'type' => 'OUT',
                'quantity' => 1,
                'previous_stock' => 10,
                'new_stock' => 9,
                'department' => 'La Paz',
                'notes' => 'Salida para embalaje en valija asegurada.',
            ]
        );

        $this->call(CatalogPriceSeeder::class);

        // 9. Simulación de Guías Postales y Envíos para jhefersonveizagamujica@gmail.com
        $this->call(SimulationUserTrackingSeeder::class);
    }
}
