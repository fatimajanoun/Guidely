<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\Student\MajorDetailsResource;
use App\Models\Major;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MajorController extends Controller
{
    use ApiResponseTrait;

    public function toggleFavorite(Request $request, Major $major): JsonResponse
    {
        $user = $request->user();

        $isFavorite = $user->favoriteMajors()
            ->whereKey($major->id)
            ->exists();

        if ($isFavorite) {
            $user->favoriteMajors()->detach($major->id);

            return $this->success(
                ['is_favorite' => false],
                'Major removed from favorites',
                200
            );
        }

        $user->favoriteMajors()->attach($major->id);

        return $this->success(
            ['is_favorite' => true],
            'Major added to favorites',
            200
        );
    }

    public function show(Major $major)
    {
        $major->load([
            'category',
            'skills',
            'points',
            'faqs',
            'jobOpportunities',
            'hiringCompanies',
            'marketTrends',
            'universityMajors.university'
        ]);

        return $this->success(new MajorDetailsResource($major),"Major Fetched Successfully",200);
    }
}
