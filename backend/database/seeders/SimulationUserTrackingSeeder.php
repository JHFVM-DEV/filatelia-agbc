<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SimulationUserTrackingSeeder extends Seeder
{
    /**
     * Run the database seeds for simulating orders and tracking guides for jhefersonveizagamujica@gmail.com
     */
    public function run(): void
    {
        $email = 'jhefersonveizagamujica@gmail.com';
        $user = User::where('email', $email)->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Jheferson Veizaga Mujica',
                'email' => $email,
                'password' => Hash::make('Password123!'),
                'email_verified_at' => now(),
            ]);
        }

        $clientRole = Role::firstOrCreate(['name' => 'CLIENTE']);
        $user->assignRole($clientRole);

        // 1. Actualizar orden existente ID 15 (si existe) para que tenga su Shipment en Bóveda
        $existingOrder = Order::where('user_id', $user->id)
            ->where('order_number', 'BO-FIL-2026-KPEFX3')
            ->first();

        if ($existingOrder) {
            $existingTracking = $existingOrder->tracking_code ?: 'TRK-DV2VBXESQJ';
            $existingOrder->update([
                'tracking_code' => $existingTracking,
                'status' => 'VAULT_VERIFIED',
            ]);

            Shipment::updateOrCreate(
                ['order_id' => $existingOrder->id],
                [
                    'carrier' => 'Correos de Bolivia (Servicio Filatélico Oficial)',
                    'tracking_code' => $existingTracking,
                    'status' => 'PENDING',
                    'origin_department' => 'La Paz',
                    'destination_department' => 'La Paz',
                    'notes' => 'Piezas custodiadas en bóveda climatizada central bajo protocolo UPU.',
                ]
            );
        }

        // 2. Orden en Tránsito Postal (Guía de Envío Activa)
        $orderInTransit = Order::updateOrCreate(
            ['order_number' => 'BO-FIL-2026-ENR782'],
            [
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => '76201340',
                'shipping_address' => 'Zona Pura Pura, Av. República #450',
                'city' => 'La Paz',
                'department' => 'La Paz',
                'total_amount' => 2635.00,
                'status' => 'SHIPPED',
                'payment_method' => 'QR_TRANSFER',
                'tracking_code' => 'BO-CORREOS-LPZ-7821',
                'special_notes' => 'Valija filatélica protegida con precinto de seguridad UPU.',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subHours(8),
            ]
        );

        $orderInTransit->items()->delete();
        $p1 = Product::find(3);
        $p2 = Product::find(7);

        $orderInTransit->items()->create([
            'product_id' => $p1 ? $p1->id : null,
            'product_name' => $p1 ? $p1->name : 'Flora & Fauna Andina — Serie Completa Cóndor Real & Oso Jukumari',
            'unit_price' => 2450.00,
            'quantity' => 1,
            'subtotal' => 2450.00,
        ]);

        $orderInTransit->items()->create([
            'product_id' => $p2 ? $p2->id : null,
            'product_name' => $p2 ? $p2->name : 'Tríptico Arte Sacro — Navidad 2007 (Pastores, Epifanía y Sagrada Familia)',
            'unit_price' => 185.00,
            'quantity' => 1,
            'subtotal' => 185.00,
        ]);

        Shipment::updateOrCreate(
            ['order_id' => $orderInTransit->id],
            [
                'carrier' => 'Correos de Bolivia (Servicio Filatélico Oficial)',
                'tracking_code' => 'BO-CORREOS-LPZ-7821',
                'status' => 'IN_TRANSIT',
                'origin_department' => 'La Paz',
                'destination_department' => 'La Paz',
                'shipped_at' => now()->subHours(8),
                'delivered_at' => null,
                'notes' => 'Valija en tránsito en ruta de distribución urbana postal La Paz. Precinto de seguridad #BO-9042.',
            ]
        );

        // 3. Orden en Empaque Glassine Pericial (Acondicionamiento)
        $orderGlassine = Order::updateOrCreate(
            ['order_number' => 'BO-FIL-2026-GLS491'],
            [
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => '76201340',
                'shipping_address' => 'Barrio Equipetrol, Calle 8 Este #12',
                'city' => 'Santa Cruz de la Sierra',
                'department' => 'Santa Cruz',
                'total_amount' => 370.00,
                'status' => 'GLASSINE_PACKED',
                'payment_method' => 'STRIPE_CARD',
                'tracking_code' => 'BO-CORREOS-SCZ-4910',
                'special_notes' => 'Embalaje pericial en papel glassine neutro de conservación.',
                'created_at' => now()->subHours(18),
                'updated_at' => now()->subHours(4),
            ]
        );

        $orderGlassine->items()->delete();
        $p3 = Product::find(14);
        $p4 = Product::find(15);
        $p5 = Product::find(16);

        $orderGlassine->items()->create([
            'product_id' => $p3 ? $p3->id : null,
            'product_name' => $p3 ? $p3->name : 'Bicentenario de la Gesta Libertaria — Campana de la Libertad (Sucre 1809 - 2009)',
            'unit_price' => 75.00,
            'quantity' => 2,
            'subtotal' => 150.00,
        ]);

        $orderGlassine->items()->create([
            'product_id' => $p4 ? $p4->id : null,
            'product_name' => $p4 ? $p4->name : 'Díptico 75 Años Cámara Nacional de Industrias — Promoviendo el Desarrollo del País',
            'unit_price' => 160.00,
            'quantity' => 1,
            'subtotal' => 160.00,
        ]);

        $orderGlassine->items()->create([
            'product_id' => $p5 ? $p5->id : null,
            'product_name' => $p5 ? $p5->name : 'Fauna de la Amazonía — Ave Trogon melanurus (Pando)',
            'unit_price' => 60.00,
            'quantity' => 1,
            'subtotal' => 60.00,
        ]);

        Shipment::updateOrCreate(
            ['order_id' => $orderGlassine->id],
            [
                'carrier' => 'Correos de Bolivia (Servicio Filatélico Oficial)',
                'tracking_code' => 'BO-CORREOS-SCZ-4910',
                'status' => 'PENDING',
                'origin_department' => 'La Paz',
                'destination_department' => 'Santa Cruz',
                'shipped_at' => null,
                'delivered_at' => null,
                'notes' => 'Acondicionado con sobre pericial libre de ácido. En mesa de clasificación hacia Santa Cruz.',
            ]
        );

        // 4. Orden Entregada con Éxito (Historial Completo)
        $orderDelivered = Order::updateOrCreate(
            ['order_number' => 'BO-FIL-2026-DEL103'],
            [
                'user_id' => $user->id,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'customer_phone' => '76201340',
                'shipping_address' => 'Av. Ballivián #620, Edificio El Prado',
                'city' => 'Cochabamba',
                'department' => 'Cochabamba',
                'total_amount' => 195.00,
                'status' => 'DELIVERED',
                'payment_method' => 'QR_TRANSFER',
                'tracking_code' => 'BO-CORREOS-CBB-1035',
                'special_notes' => 'Entrega personal certificada al titular.',
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(1),
            ]
        );

        $orderDelivered->items()->delete();
        $p6 = Product::find(10);
        $p7 = Product::find(20);

        $orderDelivered->items()->create([
            'product_id' => $p6 ? $p6->id : null,
            'product_name' => $p6 ? $p6->name : 'Soberanía Hídrica — Manantiales del Silala (Potosí) 18.00 Bs',
            'unit_price' => 145.00,
            'quantity' => 1,
            'subtotal' => 145.00,
        ]);

        $orderDelivered->items()->create([
            'product_id' => $p7 ? $p7->id : null,
            'product_name' => $p7 ? $p7->name : 'Paisajes Naturales de Bolivia — Valle de Zongo (La Paz)',
            'unit_price' => 50.00,
            'quantity' => 1,
            'subtotal' => 50.00,
        ]);

        Shipment::updateOrCreate(
            ['order_id' => $orderDelivered->id],
            [
                'carrier' => 'Correos de Bolivia (Servicio Filatélico Oficial)',
                'tracking_code' => 'BO-CORREOS-CBB-1035',
                'status' => 'DELIVERED',
                'origin_department' => 'La Paz',
                'destination_department' => 'Cochabamba',
                'shipped_at' => now()->subDays(4),
                'delivered_at' => now()->subDays(1),
                'notes' => 'Entregado satisfactoriamente y recibido conforme por Jheferson Veizaga Mujica con firma de acta.',
            ]
        );
    }
}
