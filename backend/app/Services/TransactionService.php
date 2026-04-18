<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    public function createTransaction(array $attributes): Transaction
    {
        return DB::transaction(function () use ($attributes): Transaction {
            $attributes = $this->normalizeSpendingBucket($attributes);
            $transaction = Transaction::create($attributes);
            $this->applyBalanceDelta($transaction->account, $transaction->type, (float) $transaction->amount);

            return $transaction->fresh();
        });
    }

    public function updateTransaction(Transaction $transaction, array $attributes): Transaction
    {
        return DB::transaction(function () use ($transaction, $attributes): Transaction {
            $this->applyBalanceDelta($transaction->account, $transaction->type, -1 * (float) $transaction->amount);

            $attributes = $this->normalizeSpendingBucket($attributes, $transaction);
            $transaction->update($attributes);
            $transaction->refresh();

            $this->applyBalanceDelta($transaction->account, $transaction->type, (float) $transaction->amount);

            return $transaction;
        });
    }

    public function deleteTransaction(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction): void {
            $this->applyBalanceDelta($transaction->account, $transaction->type, -1 * (float) $transaction->amount);
            $transaction->delete();
        });
    }

    public function transferBetweenAccounts(array $attributes): array
    {
        return DB::transaction(function () use ($attributes): array {
            $base = [
                'user_id' => $attributes['user_id'],
                'amount' => $attributes['amount'],
                'transaction_date' => $attributes['transaction_date'],
                'description' => $attributes['description'] ?? 'Transfer',
                'created_by_source' => 'manual',
                'type' => 'transfer',
            ];

            $fromTxn = Transaction::create(array_merge($base, [
                'account_id' => $attributes['from_account_id'],
            ]));
            $toTxn = Transaction::create(array_merge($base, [
                'account_id' => $attributes['to_account_id'],
            ]));

            $fromTxn->update(['related_transfer_id' => $toTxn->id]);
            $toTxn->update(['related_transfer_id' => $fromTxn->id]);

            $fromAccount = Account::query()->findOrFail($attributes['from_account_id']);
            $toAccount = Account::query()->findOrFail($attributes['to_account_id']);
            $fromAccount->decrement('current_balance', $attributes['amount']);
            $toAccount->increment('current_balance', $attributes['amount']);

            return [$fromTxn->fresh(), $toTxn->fresh()];
        });
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function normalizeSpendingBucket(array $attributes, ?Transaction $existing = null): array
    {
        $type = $attributes['type'] ?? $existing?->type;
        if ($type !== 'expense') {
            $attributes['spending_bucket'] = null;
        }

        return $attributes;
    }

    private function applyBalanceDelta(Account $account, string $type, float $amount): void
    {
        if ($type === 'income') {
            $account->increment('current_balance', $amount);
            return;
        }

        if ($type === 'expense' || $type === 'transfer') {
            $account->decrement('current_balance', $amount);
        }
    }
}
