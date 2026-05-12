<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\Student\QuestionResource;
use App\Models\Question;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class TestController extends Controller
{
    use ApiResponseTrait;

    public function getQuestions()
    {
        $questions = Question::with('options')
            ->orderBy('section')
            ->orderBy('order')
            ->get();
        
        return $this->success(QuestionResource::collection($questions),"Test Questions Fetched Successfully",200);
    }
}
