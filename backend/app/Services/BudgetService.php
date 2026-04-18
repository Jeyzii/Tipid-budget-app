<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Support\Collection;

class BudgetService
{
    /**
     * @return array<int, array{budget: Budget, spent: string, remaining: string, usage_percent: float|null}>
     */
    public function budgetsWithProgress(int $userId, int $month, int $year): array
    {
        $budgets = Budget::query()
            ->where('user_id', $userId)
            ->where('month', $month)
            ->where('year', $year)
            ->with('category')
            ->get();

        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = date('Y-m-t', strtotime($start));

        $out = [];
        foreach ($budgets as $budget) {
            $categoryIds = $this->descendantCategoryIds((int) $budget->category_id, $userId);
            $spent = (float) Transaction::query()
                ->where('user_id', $userId)
                ->where('type', 'expense')
                ->whereIn('category_id', $categoryIds)
                ->whereDate('transaction_date', '>=', $start)
                ->whereDate('transaction_date', '<=', $end)
                ->sum('amount');

            $budgetAmount = (float) $budget->amount;
            $remaining = $budgetAmount - $spent;
            $usage = $budgetAmount > 0 ? round(($spent / $budgetAmount) * 100, 2) : null;

            $out[] = [
                'budget' => $budget,
                'spent' => number_format($spent, 2, '.', ''),
                'remaining' => number_format($remaining, 2, '.', ''),
                'usage_percent' => $usage,
            ];
        }

        return $out;
    }

    /**
     * @return array<int>
     */
    public function descendantCategoryIds(int $rootId, int $userId): array
    {
        $all = Category::query()->where('user_id', $userId)->get(['id', 'parent_id']);
        $ids = [$rootId];
        $changed = true;
        while ($changed) {
            $changed = false;
            foreach ($all as $c) {
                if ($c->parent_id !== null && in_array((int) $c->parent_id, $ids, true) && ! in_array((int) $c->id, $ids, true)) {
                    $ids[] = (int) $c->id;
                    $changed = true;
                }
            }
        }

        return $ids;
    }
}
