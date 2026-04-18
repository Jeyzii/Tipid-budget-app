<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpsertSpendingPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'needs_amount' => ['required', 'numeric', 'min:0'],
            'wants_amount' => ['required', 'numeric', 'min:0'],
            'savings_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
