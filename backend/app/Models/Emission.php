<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Emission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'year',
        'issue_date',
        'description',
        'official_decree',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'year' => 'integer',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
