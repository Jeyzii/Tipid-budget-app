<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class RecurringTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'spending_bucket',
        'type',
        'amount',
        'description',
        'frequency',
        'interval_value',
        'start_date',
        'end_date',
        'next_run_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'next_run_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
