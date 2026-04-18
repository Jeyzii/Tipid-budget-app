<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('user_id', auth()->id())->where('type', 'expense')],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2000,2100'],
            'amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
