<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from_account_id' => ['required', 'integer', 'different:to_account_id', 'exists:accounts,id'],
            'to_account_id' => ['required', 'integer', 'exists:accounts,id'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'transaction_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ];
    }
}
