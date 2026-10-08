<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_in_showcase')->default(false)->after('is_featured');
            $table->integer('showcase_order')->default(0)->after('is_in_showcase');
            $table->string('showcase_badge')->nullable()->after('showcase_order');
        });

        // Inicializar las primeras 4 piezas activas para la vitrina del portal
        $initialProducts = DB::table('products')->where('is_active', true)->orderBy('id', 'asc')->take(4)->get();
        $badges = [
            'COLECCIÓN OFICIAL',
            'PATRIMONIO CULTURAL',
            'MEMORIA POSTAL',
            'EDICIÓN INSTITUCIONAL',
        ];

        $order = 1;
        foreach ($initialProducts as $idx => $prod) {
            DB::table('products')->where('id', $prod->id)->update([
                'is_in_showcase' => true,
                'showcase_order' => $order,
                'showcase_badge' => $badges[$idx] ?? 'COLECCIÓN OFICIAL',
            ]);
            $order++;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'is_in_showcase',
                'showcase_order',
                'showcase_badge',
            ]);
        });
    }
};
