<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('event_id')->unique();
            $table->string('visitor_hash', 64)->index();
            $table->string('session_hash', 64)->index();
            $table->string('event_type', 30);
            $table->string('path', 255);
            $table->string('category_slug', 255)->nullable();
            $table->string('product_slug', 255)->nullable();
            $table->string('referrer_host', 255)->nullable();
            $table->string('device', 20)->default('unknown');
            $table->string('language', 30)->nullable();
            $table->timestamp('occurred_at');
            $table->index(['event_type', 'occurred_at']);
            $table->index(['product_slug', 'event_type', 'occurred_at']);
            $table->index(['category_slug', 'event_type', 'occurred_at']);
        });
        Schema::table('orders', fn (Blueprint $table) => $table->string('analytics_session_hash', 64)->nullable()->index());
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['analytics_session_hash']);
            $table->dropColumn('analytics_session_hash');
        });
        Schema::dropIfExists('site_events');
    }
};
