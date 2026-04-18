<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;

class RecurringTransactionService
{
    public function __construct(private readonly TransactionService $transactionService) {}

    /**
     * Generate due recurring transactions (idempotent per recurring + date).
     */
    public function generateDue(): int
    {
        $now = Carbon::now();
        $count = 0;

        $recurrings = RecurringTransaction::query()
            ->where('is_active', true)
            ->where('next_run_at', '<=', $now)
            ->get();

        foreach ($recurrings as $rec) {
            while (Carbon::parse($rec->next_run_at)->lte($now)) {
                $runDate = Carbon::parse($rec->next_run_at)->startOfDay();

                if ($rec->end_date && $runDate->toDateString() > $rec->end_date->toDateString()) {
                    $rec->update(['is_active' => false]);
                    break;
                }

                $exists = Transaction::query()
                    ->where('user_id', $rec->user_id)
                    ->whereDate('transaction_date', $runDate->toDateString())
                    ->where('metadata_json->recurring_id', $rec->id)
                    ->exists();

                if (! $exists) {
                    $this->transactionService->createTransaction([
                        'user_id' => $rec->user_id,
                        'account_id' => $rec->account_id,
                        'category_id' => $rec->category_id,
                        'spending_bucket' => $rec->spending_bucket,
                        'type' => $rec->type,
                        'amount' => $rec->amount,
                        'description' => $rec->description ?? 'Recurring',
                        'transaction_date' => $runDate->toDateString(),
                        'created_by_source' => 'recurring',
                        'metadata_json' => ['recurring_id' => $rec->id],
                    ]);
                    $count++;
                }

                $next = $this->computeNextRun($rec, $runDate);
                $rec->next_run_at = $next;
                $rec->save();
                $rec->refresh();

                if ($next->gt($now)) {
                    break;
                }
            }
        }

        return $count;
    }

    public function computeNextRun(RecurringTransaction $rec, Carbon $from): Carbon
    {
        $interval = max(1, (int) $rec->interval_value);
        $freq = $rec->frequency;

        if ($freq === 'daily') {
            return $from->copy()->addDays($interval)->startOfDay();
        }
        if ($freq === 'weekly') {
            return $from->copy()->addWeeks($interval)->startOfDay();
        }

        return $from->copy()->addMonthsNoOverflow($interval)->startOfDay();
    }
}
