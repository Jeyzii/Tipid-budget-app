<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\RecurringTransactionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SpendingPlanController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', fn (Request $request) => $request->user());

    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);

    Route::apiResource('budgets', BudgetController::class)->except(['show']);

    Route::get('/spending-plan', [SpendingPlanController::class, 'show']);
    Route::put('/spending-plan', [SpendingPlanController::class, 'upsert']);

    Route::apiResource('recurring-transactions', RecurringTransactionController::class);

    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/category-breakdown', [ReportController::class, 'categoryBreakdown']);
    Route::get('/reports/account-balances', [ReportController::class, 'accountBalances']);
    Route::get('/reports/statement', [ReportController::class, 'statement']);

    Route::post('/exports/csv', [ExportController::class, 'csv']);
    Route::post('/exports/json', [ExportController::class, 'json']);
});
