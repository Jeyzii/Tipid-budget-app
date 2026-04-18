<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpsertSpendingPlanRequest;
use App\Models\SpendingPlanBudget;
use App\Services\SpendingPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpendingPlanController extends Controller
{
    public function __construct(private readonly SpendingPlanService $spendingPlanService) {}

    public function show(Request $request): JsonResponse
    {
        $month = (int) $request->get('month', now()->month);
        $year = (int) $request->get('year', now()->year);

        $data = $this->spendingPlanService->planWithProgress((int) auth()->id(), $month, $year);

        return response()->json(['data' => $data]);
    }

    public function upsert(UpsertSpendingPlanRequest $request): JsonResponse
    {
        $validated = $request->validated();

        SpendingPlanBudget::query()->updateOrCreate(
            [
                'user_id' => auth()->id(),
                'month' => $validated['month'],
                'year' => $validated['year'],
            ],
            [
                'needs_amount' => $validated['needs_amount'],
                'wants_amount' => $validated['wants_amount'],
                'savings_amount' => $validated['savings_amount'],
            ],
        );

        $data = $this->spendingPlanService->planWithProgress(
            (int) auth()->id(),
            (int) $validated['month'],
            (int) $validated['year'],
        );

        return response()->json(['data' => $data]);
    }
}
