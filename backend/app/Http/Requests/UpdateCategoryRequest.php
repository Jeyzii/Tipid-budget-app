<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', 'in:income,expense'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon' => ['nullable', 'string', 'max:100'],
        ];
    }
}
