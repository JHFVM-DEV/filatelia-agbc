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
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('carrier')->default('Correos de Bolivia');
            $table->string('tracking_code')->unique();
            $table->string('status')->default('PENDING'); // PENDING, DISPATCHED, IN_TRANSIT, DELIVERED, RETURNED
            $table->string('origin_department')->default('La Paz');
            $table->string('destination_department');
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_code')->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject');
            $table->text('message');
            $table->string('priority')->default('NORMAL'); // LOW, NORMAL, HIGH, URGENT
            $table->string('status')->default('PENDING');   // PENDING, IN_PROGRESS, RESOLVED, CLOSED
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // IN, OUT, ADJUST
            $table->integer('quantity');
            $table->integer('previous_stock');
            $table->integer('new_stock');
            $table->string('department')->default('La Paz');
            $table->string('reason');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('shipments');
    }
};
