<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class SpendingPlanBudget extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'year',
        'needs_amount',
        'wants_amount',
        'savings_amount',
    ];

    protected function casts(): array
    {
        return [
            'needs_amount' => 'decimal:2',
            'wants_amount' => 'decimal:2',
            'savings_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
