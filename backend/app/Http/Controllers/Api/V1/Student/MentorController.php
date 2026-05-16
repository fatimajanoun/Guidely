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
    public function show(User $user)
    {
        $user->load([
            'mentorProfile' => fn($q) =>
            $q->select([
                'user_id',
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
            ]),
        ]);

        if (!$user->mentorProfile || $user->mentorProfile->status !== 'approved') {
            abort(404);
        }

        return $this->success(
            new PublicMentorResource($user),
            'Mentor retrieved successfully',
            200
        );
    }
}
