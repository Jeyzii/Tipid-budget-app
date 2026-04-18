<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\TransferTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    public function __construct(private readonly TransactionService $transactionService) {}

    public function index()
    {
        $query = Transaction::query()
            ->where('user_id', auth()->id())
            ->orderByDesc('transaction_date')
            ->orderByDesc('id');

        if (request()->filled('from')) {
            $query->whereDate('transaction_date', '>=', request('from'));
        }
        if (request()->filled('to')) {
            $query->whereDate('transaction_date', '<=', request('to'));
        }
        if (request()->filled('account_id')) {
            $query->where('account_id', request('account_id'));
        }
        if (request()->filled('category_id')) {
            $query->where('category_id', request('category_id'));
        }
        if (request()->filled('type')) {
            $query->where('type', request('type'));
        }

        return TransactionResource::collection($query->paginate(20));
    }

    public function store(StoreTransactionRequest $request)
    {
        $transaction = $this->transactionService->createTransaction([
            ...$request->validated(),
            'user_id' => auth()->id(),
            'created_by_source' => 'manual',
        ]);

        return new TransactionResource($transaction);
    }

    public function show(string $id)
    {
        $transaction = Transaction::query()->where('user_id', auth()->id())->findOrFail($id);
        return new TransactionResource($transaction);
    }

    public function update(UpdateTransactionRequest $request, string $id)
    {
        $transaction = Transaction::query()->where('user_id', auth()->id())->findOrFail($id);
        $updated = $this->transactionService->updateTransaction($transaction, $request->validated());

        return new TransactionResource($updated);
    }

    public function destroy(string $id)
    {
        $transaction = Transaction::query()->where('user_id', auth()->id())->findOrFail($id);
        $this->transactionService->deleteTransaction($transaction);

        return response()->noContent();
    }

    public function transfer(TransferTransactionRequest $request)
    {
        [$debit, $credit] = $this->transactionService->transferBetweenAccounts([
            ...$request->validated(),
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'data' => [
                'debit' => new TransactionResource($debit),
                'credit' => new TransactionResource($credit),
            ],
        ]);
    }
}
