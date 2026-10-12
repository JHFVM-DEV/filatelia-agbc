<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('site_events', function (Blueprint $table) {
            $table->string('visitor_hash', 64)->nullable()->change();
            $table->string('session_hash', 64)->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::table('site_events')->whereNull('visitor_hash')->orWhereNull('session_hash')->exists()) {
            throw new RuntimeException('No se puede revertir mientras existan conteos anónimos. No se borrarán visitas.');
        }
        Schema::table('site_events', function (Blueprint $table) {
            $table->string('visitor_hash', 64)->nullable(false)->change();
            $table->string('session_hash', 64)->nullable(false)->change();
        });
    }
};
