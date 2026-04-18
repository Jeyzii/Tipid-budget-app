<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'spending_bucket',
        'type',
        'amount',
        'description',
        'transaction_date',
        'reference_no',
        'related_transfer_id',
        'created_by_source',
        'metadata_json',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transaction_date' => 'date',
            'metadata_json' => 'array',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
