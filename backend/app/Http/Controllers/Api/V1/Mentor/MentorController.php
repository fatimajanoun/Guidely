<?php

namespace App\Http\Controllers\Api\V1\Mentor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mentor\UpdateMentorRequest;
use App\Http\Resources\Mentor\MentorResource;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class MentorController extends Controller
{
    use ApiResponseTrait;

    public function update(UpdateMentorRequest $request): JsonResponse
    {
        $profile = $request->user()
            ->mentorProfile()
            ->with('major')
            ->first();

        if (! $profile) {
            return $this->error('Mentor profile not found', 404);
        }

        $profile->update($request->validated());

        return $this->success(
            new MentorResource($profile->fresh()->load('major')),
            'Mentor profile updated successfully',
            200
        );
    }
}
