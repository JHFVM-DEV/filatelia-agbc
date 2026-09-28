<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('vault_room')->nullable()->default('Bóveda Central A')->after('stock');
            $table->string('vault_cabinet')->nullable()->default('Armario Ignífugo 01')->after('vault_room');
            $table->string('vault_drawer')->nullable()->default('Gaveta G-01')->after('vault_cabinet');
            $table->string('vault_album')->nullable()->after('vault_drawer');
            $table->string('vault_envelope')->nullable()->after('vault_album');
            $table->string('vault_notes')->nullable()->after('vault_envelope');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'vault_room',
                'vault_cabinet',
                'vault_drawer',
                'vault_album',
                'vault_envelope',
                'vault_notes',
            ]);
        });
    }
};
