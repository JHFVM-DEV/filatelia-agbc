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
        // 1. Bitácora de Auditoría Integral (Audit Trail)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->default('Sistema Automático');
            $table->string('user_role')->nullable();
            $table->string('action'); // PRICE_REVALUATION, STOCK_ADJUSTMENT, PRODUCT_UPDATE, ORDER_STATUS, etc.
            $table->string('model_type')->nullable(); // Product, Order, etc.
            $table->unsignedBigInteger('model_id')->nullable();
            $table->string('model_name')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('change_summary');
            $table->text('rationale')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['action', 'created_at']);
            $table->index(['model_type', 'model_id']);
        });

        // 2. Historial de Revalorizaciones Filatélicas y Plusvalía de Bóveda
        Schema::create('price_revaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->default('Super Admin');
            $table->decimal('previous_price', 10, 2);
            $table->decimal('new_price', 10, 2);
            $table->decimal('percentage_change', 8, 2);
            $table->integer('stock_at_revaluation');
            $table->decimal('vault_gain', 12, 2); // (new - old) * stock
            $table->string('reason'); // Catálogo Scott/Yvert, Subasta Internacional, Escasez, Peritaje
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_revaluations');
        Schema::dropIfExists('audit_logs');
    }
};
