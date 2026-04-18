<?php

namespace App\Services;

use App\Models\SpendingPlanBudget;
use App\Models\Transaction;

class SpendingPlanService
{
    /**
     * @return array{
     *     month: int,
     *     year: int,
     *     needs_amount: string,
     *     wants_amount: string,
     *     savings_amount: string,
     *     buckets: list<array{
     *         key: string,
     *         label: string,
     *         budget: string,
     *         spent: string,
     *         remaining: string,
     *         usage_percent: float|null
     *     }>,
     *     unassigned_spent: string
     * }
     */
    public function planWithProgress(int $userId, int $month, int $year): array
    {
        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = date('Y-m-t', strtotime($start));

        $row = SpendingPlanBudget::query()
            ->where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        $needsBudget = (float) ($row?->needs_amount ?? 0);
        $wantsBudget = (float) ($row?->wants_amount ?? 0);
        $savingsBudget = (float) ($row?->savings_amount ?? 0);

        $spentByBucket = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereDate('transaction_date', '>=', $start)
            ->whereDate('transaction_date', '<=', $end)
            ->whereNotNull('spending_bucket')
            ->selectRaw('spending_bucket, COALESCE(SUM(amount), 0) as total')
            ->groupBy('spending_bucket')
            ->pluck('total', 'spending_bucket');

        $unassignedSpent = (float) Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereDate('transaction_date', '>=', $start)
            ->whereDate('transaction_date', '<=', $end)
            ->whereNull('spending_bucket')
            ->sum('amount');

        $defs = [
            ['key' => 'need', 'label' => 'Needs', 'budget' => $needsBudget],
            ['key' => 'want', 'label' => 'Wants', 'budget' => $wantsBudget],
            ['key' => 'savings', 'label' => 'Savings', 'budget' => $savingsBudget],
        ];

        $buckets = [];
        foreach ($defs as $def) {
            $spent = (float) ($spentByBucket[$def['key']] ?? 0);
            $cap = $def['budget'];
            $remaining = $cap - $spent;
            $usage = $cap > 0 ? round(($spent / $cap) * 100, 2) : null;

            $buckets[] = [
                'key' => $def['key'],
                'label' => $def['label'],
                'budget' => number_format($cap, 2, '.', ''),
                'spent' => number_format($spent, 2, '.', ''),
                'remaining' => number_format($remaining, 2, '.', ''),
                'usage_percent' => $usage,
            ];
        }

        return [
            'month' => $month,
            'year' => $year,
            'needs_amount' => number_format($needsBudget, 2, '.', ''),
            'wants_amount' => number_format($wantsBudget, 2, '.', ''),
            'savings_amount' => number_format($savingsBudget, 2, '.', ''),
            'buckets' => $buckets,
            'unassigned_spent' => number_format($unassignedSpent, 2, '.', ''),
        ];
    }
}
