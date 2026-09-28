<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceRevaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'user_name',
        'previous_price',
        'new_price',
        'percentage_change',
        'stock_at_revaluation',
        'vault_gain',
        'reason',
        'notes',
    ];

    protected $casts = [
        'previous_price' => 'decimal:2',
        'new_price' => 'decimal:2',
        'percentage_change' => 'decimal:2',
        'vault_gain' => 'decimal:2',
        'stock_at_revaluation' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
