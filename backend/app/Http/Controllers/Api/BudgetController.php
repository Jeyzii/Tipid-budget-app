<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class BudgetController extends Controller
{
    public function __construct(private readonly BudgetService $budgetService) {}

    public function index(Request $request): JsonResponse
    {
        $month = (int) $request->get('month', now()->month);
        $year = (int) $request->get('year', now()->year);

        $rows = $this->budgetService->budgetsWithProgress((int) auth()->id(), $month, $year);

        return response()->json([
            'data' => array_map(fn (array $row) => [
                'id' => $row['budget']->id,
                'category_id' => $row['budget']->category_id,
                'category' => $row['budget']->category ? [
                    'id' => $row['budget']->category->id,
                    'name' => $row['budget']->category->name,
                ] : null,
                'month' => $row['budget']->month,
                'year' => $row['budget']->year,
                'amount' => (string) $row['budget']->amount,
                'spent' => $row['spent'],
                'remaining' => $row['remaining'],
                'usage_percent' => $row['usage_percent'],
            ], $rows),
        ]);
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $data = $request->validated();
        try {
            $budget = Budget::query()->create([
                ...$data,
                'user_id' => auth()->id(),
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'UNIQUE')) {
                throw ValidationException::withMessages([
                    'category_id' => ['A budget for this category and month already exists.'],
                ]);
            }
            throw $e;
        }

        $budget->load('category');

        return response()->json(['data' => $budget], 201);
    }

    public function update(UpdateBudgetRequest $request, string $id): JsonResponse
    {
        $budget = Budget::query()->where('user_id', auth()->id())->findOrFail($id);
        $budget->update($request->validated());
        $budget->load('category');

        return response()->json(['data' => $budget->fresh()]);
    }

    public function destroy(string $id): Response
    {
        $budget = Budget::query()->where('user_id', auth()->id())->findOrFail($id);
        $budget->delete();

        return response()->noContent();
    }
}
