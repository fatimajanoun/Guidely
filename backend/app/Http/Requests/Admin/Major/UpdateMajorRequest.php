<?php

namespace App\Http\Requests\Admin\Major;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMajorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name_en' => ['sometimes', 'required', 'string', 'max:255'],
            'name_ar' => ['sometimes', 'required', 'string', 'max:255'],

            'category_id' => ['sometimes', 'required', 'exists:categories,id'],

            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('majors','slug')->ignore($this->route('major'))],

            'overview' => ['sometimes', 'required', 'string'],
            'description' => ['sometimes', 'required', 'string'],

            'duration_years' => ['sometimes', 'required', 'integer', 'min:1'],

            'difficulty_level' => ['sometimes', 'required', 'in:easy,medium,hard,very_hard'],

            'salary_min' => ['sometimes', 'required', 'numeric', 'min:0'],
            'salary_max' => ['sometimes', 'required', 'numeric', 'min:0','gte:salary_min'],

            'local_demand' => ['sometimes', 'required', 'in:low,medium,high,very_high'],

            'international_demand' => ['sometimes', 'required', 'in:low,medium,high,very_high'],

            'is_featured' => ['sometimes', 'nullable', 'boolean'],

            'cover_image' => ['sometimes', 'nullable', 'string', 'max:500'],

            'skills' => ['sometimes', 'required', 'array'],
            'skills.*' => ['exists:skills,id'],
        ];
    }
}
