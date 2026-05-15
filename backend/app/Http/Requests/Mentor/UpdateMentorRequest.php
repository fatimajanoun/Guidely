<?php

namespace App\Http\Requests\Mentor;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMentorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'major_id' => ['sometimes', 'integer', 'exists:majors,id'],
            'is_accepting_students' => ['sometimes', 'boolean'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'years_experience' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:80'],
            'degree' => ['sometimes', 'nullable', 'string', 'max:255'],
            'university_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'graduation_year' => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:' . ((int) date('Y') + 10)],
            'languages' => ['sometimes', 'nullable', 'array'],
            'languages.*' => ['string', 'max:50'],
            'linkedin_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'twitter_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'website_url' => ['sometimes', 'nullable', 'url', 'max:255'],
        ];
    }
}
