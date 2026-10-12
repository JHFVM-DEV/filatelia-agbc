<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('department', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('shipping_address', 500)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('address_reference', 255)->nullable();
            $table->timestamp('terms_accepted_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn([
            'phone', 'country', 'department', 'city', 'shipping_address',
            'postal_code', 'address_reference', 'terms_accepted_at',
        ]));
    }
};
