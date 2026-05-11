<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
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
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $recommendedIds = [];

        $latestQuiz = $user?->quizResults()
            ->latest()
            ->first();

        if ($latestQuiz) {

            $categoryScores = $latestQuiz->category_scores ?? [];

            $topCategories = collect($categoryScores)
                ->sortDesc()
                ->keys()
                ->take(3);

            $recommendedIds = Major::whereIn('category_id', $topCategories)
                ->pluck('id')
                ->toArray();
        }

       
        $featuredIds = Major::where('is_featured', true)
            ->pluck('id')
            ->toArray();

        // RECOMMENDED (exclude featured)
        $recommended = Major::query()
            ->with(['category', 'skills'])
            ->whereIn('id', $recommendedIds)
            ->whereNotIn('id', $featuredIds)
            ->get();

        // FEATURED (exclude recommended)
        $featured = Major::query()
            ->with(['category', 'skills'])
            ->where('is_featured', true)
            ->whereNotIn('id', $recommendedIds)
            ->orderBy('name_en')
            ->get();

        // OTHERS (exclude both)
        $others = Major::query()
            ->with(['category', 'skills'])
            ->whereNotIn('id', array_merge($recommendedIds, $featuredIds))
            ->orderBy('name_en')
            ->paginate($request->get('per_page', 10));

        return $this->success([
            'recommended' => $recommended,
            'featured' => $featured,
            'others' => $others,
        ], 'Majors retrieved successfully', 200);
    }
}
