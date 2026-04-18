<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Models\RecurringTransaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class RecurringTransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $items = RecurringTransaction::query()
            ->where('user_id', auth()->id())
            ->with('account:id,name')
            ->orderBy('next_run_at')
            ->get();

        return response()->json(['data' => $items]);
    }

    public function store(StoreRecurringTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($data['type'] === 'income') {
            $data['spending_bucket'] = null;
        }
        $data['interval_value'] = $data['interval_value'] ?? 1;
        $data['user_id'] = auth()->id();

        $start = Carbon::parse($data['start_date'])->startOfDay();
        $next = $start->greaterThan(now()) ? $start : now()->startOfDay();
        $data['next_run_at'] = $next;

        $rec = RecurringTransaction::query()->create($data);
        $rec->load('account:id,name');

        return response()->json(['data' => $rec], 201);
    }

    public function show(string $id): JsonResponse
    {
        $rec = RecurringTransaction::query()->where('user_id', auth()->id())->with('account:id,name')->findOrFail($id);

        return response()->json(['data' => $rec]);
    }

    public function update(UpdateRecurringTransactionRequest $request, string $id): JsonResponse
    {
        $rec = RecurringTransaction::query()->where('user_id', auth()->id())->findOrFail($id);
        $data = $request->validated();
        if (($data['type'] ?? $rec->type) === 'income') {
            $data['spending_bucket'] = null;
        }
        $rec->update($data);
        $rec->load('account:id,name');

        return response()->json(['data' => $rec->fresh()]);
    }

    public function destroy(string $id): Response
    {
        $rec = RecurringTransaction::query()->where('user_id', auth()->id())->findOrFail($id);
        $rec->delete();

        return response()->noContent();
    }
}
