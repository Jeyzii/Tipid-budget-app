<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * @return array{income: string, expense: string, net: string}
     */
    public function incomeExpenseSummary(int $userId, string $from, string $to): array
    {
        $row = Transaction::query()
            ->where('user_id', $userId)
            ->whereDate('transaction_date', '>=', $from)
            ->whereDate('transaction_date', '<=', $to)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN transactions.type = ? THEN transactions.amount ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN transactions.type = ? THEN transactions.amount ELSE 0 END), 0) as expense
            ', ['income', 'expense'])
            ->first();

        $income = (float) ($row->income ?? 0);
        $expense = (float) ($row->expense ?? 0);

        return [
            'income' => number_format($income, 2, '.', ''),
            'expense' => number_format($expense, 2, '.', ''),
            'net' => number_format($income - $expense, 2, '.', ''),
        ];
    }

    /**
     * @return array<int, array{category_id: int|null, category_name: string, total: string}>
     */
    public function categoryExpenseBreakdown(int $userId, string $from, string $to): array
    {
        $rows = Transaction::query()
            ->where('user_id', $userId)
            ->where('type', 'expense')
            ->whereDate('transaction_date', '>=', $from)
            ->whereDate('transaction_date', '<=', $to)
            ->leftJoin('categories', 'categories.id', '=', 'transactions.category_id')
            ->groupBy('transactions.category_id', 'categories.name')
            ->orderByDesc(DB::raw('SUM(transactions.amount)'))
            ->get([
                'transactions.category_id',
                DB::raw('COALESCE(categories.name, \'Uncategorized\') as category_name'),
                DB::raw('SUM(transactions.amount) as total'),
            ]);

        return $rows->map(fn ($r) => [
            'category_id' => $r->category_id !== null ? (int) $r->category_id : null,
            'category_name' => (string) $r->category_name,
            'total' => number_format((float) $r->total, 2, '.', ''),
        ])->all();
    }

    /**
     * @return array<int, array{id: int, name: string, type: string, current_balance: string}>
     */
    public function accountBalances(int $userId): array
    {
        return Account::query()
            ->where('user_id', $userId)
            ->where('is_archived', false)
            ->orderBy('name')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'type' => $a->type,
                'current_balance' => (string) $a->current_balance,
            ])
            ->all();
    }

    /**
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function statement(int $userId, string $from, string $to, ?int $accountId)
    {
        $q = Transaction::query()
            ->where('user_id', $userId)
            ->whereDate('transaction_date', '>=', $from)
            ->whereDate('transaction_date', '<=', $to)
            ->with(['account:id,name', 'category:id,name'])
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        if ($accountId) {
            $q->where('account_id', $accountId);
        }

        return $q->paginate(50);
    }
}
