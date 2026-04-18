<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'spending_bucket' => [
                'nullable',
                'string',
                Rule::in(['need', 'want', 'savings']),
                Rule::prohibitedIf($this->input('type') === 'income'),
            ],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string'],
            'transaction_date' => ['required', 'date'],
            'reference_no' => ['nullable', 'string', 'max:255'],
        ];
    }
}
