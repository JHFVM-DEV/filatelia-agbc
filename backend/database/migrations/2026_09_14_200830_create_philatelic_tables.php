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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('emissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('year');
            $table->date('issue_date')->nullable();
            $table->text('description')->nullable();
            $table->string('official_decree')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('catalog_code')->nullable();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('emission_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('price', 10, 2);
            $table->string('face_value')->nullable();
            $table->integer('year');
            $table->string('country')->default('Bolivia');
            $table->string('condition')->default('MINT_NH'); // MINT_NH, MINT_LH, USED, FDC
            $table->string('rarity')->default('COMMON');     // COMMON, SCARCE, RARE, VERY_RARE, MUSEUM_PIECE
            $table->boolean('certified')->default(true);
            $table->integer('stock')->default(1);
            $table->string('perforation')->nullable();       // ej: 13.5 x 13.5
            $table->string('printing_technique')->nullable(); // Calcografía, Offset
            $table->string('paper_type')->nullable();        // Papel tizado, filigrana sol
            $table->string('gum_condition')->nullable();     // Goma original intacta
            $table->string('dimensions')->nullable();        // 28 x 35 mm
            $table->string('front_image')->nullable();
            $table->string('back_image')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->text('historical_context')->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->text('shipping_address');
            $table->string('city');
            $table->string('department');
            $table->decimal('total_amount', 10, 2);
            $table->string('status')->default('PENDING'); // PENDING, VAULT_VERIFIED, PACKED_GLASSINE, SHIPPED, DELIVERED, CANCELLED
            $table->string('payment_method')->default('QR_TRANSFER'); // QR_TRANSFER, CREDIT_CARD, VAULT_PICKUP
            $table->string('tracking_code')->nullable();
            $table->text('special_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });

        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wishlists');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('emissions');
        Schema::dropIfExists('categories');
    }
};
