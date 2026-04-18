<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,bank,ewallet,credit,savings'],
            'opening_balance' => ['nullable', 'numeric'],
            'is_archived' => ['nullable', 'boolean'],
        ];
    }
}
