<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\Student\PublicMentorResource;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class MentorController extends Controller
{
    //
    use ApiResponseTrait;
    public function show(string $username)
    {
        $mentor = User::query()
            ->where('username', $username)
            ->whereHas(
                'mentorProfile',
                fn($q) =>
                $q->where('status', 'approved')
            )
            ->with([
                'mentorProfile' => fn($q) =>
                $q->select([
                    'id',
                    'user_id',
                    'major_id',
                    'status',
                    'is_accepting_students',
                    'bio',
                    'years_experience',
                    'degree',
                    'university_name',
                    'graduation_year',
                    'languages',
                    'linkedin_url',
                    'twitter_url',
                    'website_url',
                ])->with('major:id,name_en,name_ar,slug'),
            ])
            ->select(['id', 'name', 'username', 'avatar_url', 'school', 'preferred_language'])
            ->firstOrFail();

        return $this->success(
            new PublicMentorResource($mentor),
            'Mentor retreived successfully',
            200
        );
    }
}
