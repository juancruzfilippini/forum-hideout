<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    public const CREATED_AT = 'createdAt';

    public const UPDATED_AT = 'updatedAt';

    protected $table = 'Post';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['id', 'body', 'hidden', 'hiddenReason', 'authorId', 'topicId'];

    protected $casts = [
        'hidden' => 'boolean',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('hidden', false);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'authorId');
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topicId');
    }
}
