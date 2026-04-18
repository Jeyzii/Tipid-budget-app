<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function withValidator($validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $v): void {
            $txn = Transaction::query()->where('user_id', auth()->id())->find($this->route('id'));
            if (! $txn instanceof Transaction) {
                return;
            }
            $type = $this->input('type', $txn->type);
            if ($type !== 'expense' && $this->filled('spending_bucket')) {
                $v->errors()->add('spending_bucket', 'Spending bucket may only be set for expense transactions.');
            }
        });
    }

    public function rules(): array
    {
        return [
            'account_id' => ['sometimes', 'required', 'integer', 'exists:accounts,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'spending_bucket' => ['nullable', 'string', Rule::in(['need', 'want', 'savings'])],
            'type' => ['sometimes', 'required', 'in:income,expense'],
            'amount' => ['sometimes', 'required', 'numeric', 'gt:0'],
            'description' => ['nullable', 'string'],
            'transaction_date' => ['sometimes', 'required', 'date'],
            'reference_no' => ['nullable', 'string', 'max:255'],
        ];
    }
}
