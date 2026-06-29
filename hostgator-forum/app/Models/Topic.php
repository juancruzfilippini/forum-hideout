<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Topic extends Model
{
    public const CREATED_AT = 'createdAt';

    public const UPDATED_AT = 'updatedAt';

    protected $table = 'Topic';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'title',
        'body',
        'status',
        'hiddenReason',
        'pinned',
        'views',
        'authorId',
        'categoryId',
    ];

    protected $casts = [
        'pinned' => 'boolean',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', '!=', 'ARCHIVED');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorId');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'categoryId');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'topicId');
    }
}
