<?php

namespace App\Http\Requests;

use App\Models\RecurringTransaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function withValidator($validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $v): void {
            $rec = RecurringTransaction::query()->where('user_id', auth()->id())->find($this->route('id'));
            if (! $rec instanceof RecurringTransaction) {
                return;
            }
            $type = $this->input('type', $rec->type);
            if ($type !== 'expense' && $this->filled('spending_bucket')) {
                $v->errors()->add('spending_bucket', 'Spending bucket may only be set for expense transactions.');
            }
        });
    }

    public function rules(): array
    {
        return [
            'account_id' => ['sometimes', 'required', 'integer', Rule::exists('accounts', 'id')->where('user_id', auth()->id())],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', auth()->id())],
            'spending_bucket' => ['nullable', 'string', Rule::in(['need', 'want', 'savings'])],
            'type' => ['sometimes', 'required', Rule::in(['income', 'expense'])],
            'amount' => ['sometimes', 'required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string'],
            'frequency' => ['sometimes', 'required', Rule::in(['daily', 'weekly', 'monthly', 'custom'])],
            'interval_value' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['nullable', 'date'],
            'next_run_at' => ['sometimes', 'required', 'date'],
            'is_active' => ['boolean'],
        ];
    }
}
