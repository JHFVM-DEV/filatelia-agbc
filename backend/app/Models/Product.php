<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'catalog_code',
        'category_id',
        'emission_id',
        'price',
        'face_value',
        'year',
        'country',
        'condition',
        'rarity',
        'certified',
        'stock',
        'perforation',
        'printing_technique',
        'paper_type',
        'gum_condition',
        'dimensions',
        'front_image',
        'back_image',
        'is_featured',
        'is_active',
        'description',
        'historical_context',
        'vault_room',
        'vault_cabinet',
        'vault_drawer',
        'vault_album',
        'vault_envelope',
        'vault_notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'year' => 'integer',
        'stock' => 'integer',
        'certified' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'image_url',
        'front_image_url',
        'back_image_url',
        'price_formatted',
        'store_url',
        'badge',
    ];

    /**
     * URL absoluta directa para la imagen principal del sello
     */
    public function getImageUrlAttribute(): string
    {
        return $this->getFrontImageUrlAttribute();
    }

    /**
     * URL absoluta para la fotografía del anverso
     */
    public function getFrontImageUrlAttribute(): string
    {
        $img = $this->front_image;
        if (empty($img)) {
            return url('/images/hero-philately.jpg');
        }
        if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) {
            return $img;
        }
        if (str_starts_with($img, '/')) {
            return url($img);
        }
        if (str_starts_with($img, 'storage/')) {
            return url('/' . $img);
        }
        if (file_exists(public_path('images/' . $img))) {
            return url('/images/' . $img);
        }
        return url('/storage/' . $img);
    }

    /**
     * URL absoluta para la fotografía del reverso
     */
    public function getBackImageUrlAttribute(): ?string
    {
        $img = $this->back_image;
        if (empty($img)) {
            return null;
        }
        if (str_starts_with($img, 'http://') || str_starts_with($img, 'https://')) {
            return $img;
        }
        if (str_starts_with($img, '/')) {
            return url($img);
        }
        if (str_starts_with($img, 'storage/')) {
            return url('/' . $img);
        }
        if (file_exists(public_path('images/' . $img))) {
            return url('/images/' . $img);
        }
        return url('/storage/' . $img);
    }

    /**
     * Precio formateado en Bolivianos
     */
    public function getPriceFormattedAttribute(): string
    {
        return 'Bs. ' . number_format((float) $this->price, 2, '.', ',');
    }

    /**
     * URL absoluta para acceder o comprar la pieza en la tienda oficial
     */
    public function getStoreUrlAttribute(): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        return "{$frontendUrl}/catalogo/{$this->slug}";
    }

    /**
     * Insignia / Badge temático para tarjetas visuales
     */
    public function getBadgeAttribute(): string
    {
        return mb_strtoupper($this->category?->name ?? 'COLECCIÓN OFICIAL', 'UTF-8');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function emission(): BelongsTo
    {
        return $this->belongsTo(Emission::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }
}
