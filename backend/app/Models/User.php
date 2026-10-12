<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    public const CUSTOMER_FIELDS = ['phone', 'country', 'department', 'city', 'shipping_address', 'postal_code', 'address_reference'];

    public static function customerRules(bool $required = false, mixed $country = 'Bolivia'): array
    {
        $presence = $required ? 'required' : 'sometimes|nullable';
        return [
            'phone' => "$presence|string|max:30|regex:/^\\+?(?=(?:[^0-9]*[0-9]){7})[0-9 ()-]{7,30}$/",
            'country' => "$presence|string|max:100|not_in:Otro país,other",
            'department' => "$presence|string|max:100" . ($country === 'Bolivia' ? '|in:La Paz,Cochabamba,Santa Cruz,Oruro,Potosí,Chuquisaca,Tarija,Beni,Pando' : ''),
            'city' => "$presence|string|max:100",
            'shipping_address' => "$presence|string|max:500",
            'postal_code' => 'sometimes|nullable|string|max:20',
            'address_reference' => 'sometimes|nullable|string|max:255',
        ];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'phone', 'country', 'department', 'city', 'shipping_address',
        'postal_code', 'address_reference',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'terms_accepted_at' => 'datetime',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->hasAnyRole([
            'SUPER_ADMIN',
            'ADMIN_PRODUCTOS_ALMACEN',
            'ALMACEN',
        ]);
    }

    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class);
    }
}
