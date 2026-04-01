<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, HasRoles, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'company_id',
        'employee_id',
        'department_id',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
        'google_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Auto-sync: when the 'role' column changes, sync the Spatie role.
     */
    protected static function booted(): void
    {
        static::saved(function (User $user) {
            if ($user->wasChanged('role') && $user->role) {
                try {
                    $user->syncRoles($user->role);
                } catch (\Exception $e) {
                    // Role may not exist yet (before seeder runs)
                }
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class);
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'company_id' => $this->company_id,
            'department_id' => $this->department_id,
        ];
    }
}
