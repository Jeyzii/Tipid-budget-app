<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    public function summary(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $summary = $this->reportService->incomeExpenseSummary(
            (int) auth()->id(),
            $data['from'],
            $data['to'],
        );

        return response()->json(['data' => $summary]);
    }

    public function categoryBreakdown(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $rows = $this->reportService->categoryExpenseBreakdown(
            (int) auth()->id(),
            $data['from'],
            $data['to'],
        );

        return response()->json(['data' => $rows]);
    }

    public function accountBalances(): JsonResponse
    {
        $rows = $this->reportService->accountBalances((int) auth()->id());

        return response()->json(['data' => $rows]);
    }

    public function statement(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
            'account_id' => ['nullable', 'integer'],
        ]);

        $paginator = $this->reportService->statement(
            (int) auth()->id(),
            $data['from'],
            $data['to'],
            isset($data['account_id']) ? (int) $data['account_id'] : null,
        );

        return TransactionResource::collection($paginator)->response();
    }
}
