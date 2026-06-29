<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const CREATED_AT = 'createdAt';

    public const UPDATED_AT = 'updatedAt';

    protected $table = 'User';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'email',
        'name',
        'role',
        'avatarUrl',
        'active',
        'deactivatedAt',
        'deactivationReason',
        'passwordHash',
    ];

    protected $hidden = [
        'passwordHash',
    ];

    protected $casts = [
        'active' => 'boolean',
        'deactivatedAt' => 'datetime',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function getAuthPassword(): string
    {
        return $this->passwordHash;
    }

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class, 'authorId');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'authorId');
    }
}
