<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where('user_id', auth()->id())],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', auth()->id())],
            'spending_bucket' => [
                'nullable',
                'string',
                Rule::in(['need', 'want', 'savings']),
                Rule::prohibitedIf($this->input('type') === 'income'),
            ],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'amount' => ['required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string'],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly', 'custom'])],
            'interval_value' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ];
    }
}
