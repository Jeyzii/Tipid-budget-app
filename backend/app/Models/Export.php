<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Export extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
