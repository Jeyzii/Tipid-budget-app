<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function csv(Request $request): StreamedResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $userId = (int) auth()->id();
        $filename = 'transactions-'.$data['from'].'-to-'.$data['to'].'.csv';

        return response()->streamDownload(function () use ($userId, $data): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['transaction_date', 'type', 'amount', 'description', 'account_id', 'category_id', 'spending_bucket', 'reference_no']);

            Transaction::query()
                ->where('user_id', $userId)
                ->whereDate('transaction_date', '>=', $data['from'])
                ->whereDate('transaction_date', '<=', $data['to'])
                ->orderBy('transaction_date')
                ->orderBy('id')
                ->chunk(500, function ($transactions) use ($out): void {
                    foreach ($transactions as $t) {
                        fputcsv($out, [
                            $t->transaction_date->toDateString(),
                            $t->type,
                            (string) $t->amount,
                            $t->description,
                            $t->account_id,
                            $t->category_id,
                            $t->spending_bucket,
                            $t->reference_no,
                        ]);
                    }
                });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function json(Request $request): JsonResponse
    {
        $data = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $userId = (int) auth()->id();
        $rows = Transaction::query()
            ->where('user_id', $userId)
            ->whereDate('transaction_date', '>=', $data['from'])
            ->whereDate('transaction_date', '<=', $data['to'])
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get();

        return response()->json(['data' => $rows]);
    }
}
