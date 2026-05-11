<?php

use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('authenticated student can get test questions', function () {

    $student = User::factory()->student()->create();

    Sanctum::actingAs($student);

    $question = Question::create([
    'text_en' => 'What motivates you most?',
    'text_ar' => 'ما الذي يحفزك أكثر؟',
    'section' => 'interest',
    'order' => 1,
    ]);

    $question->options()->create([
        'text_en' => 'Solving problems',
        'text_ar' => 'حل المشاكل',
        'weights' => [
            1 => 5,
            3 => 2,
        ],
    ]);

    $question->options()->create([
        'text_en' => 'Helping people',
        'text_ar' => 'مساعدة الناس',
        'weights' => [
            2 => 4,
            1 => 1,
        ],
    ]);

    $response = $this->getJson('/api/v1/test/questions');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                [
                    'text_en',
                    'text_ar',
                    'section',
                    'order',
                    'options'
                ]
            ],
            'message'
        ]);
});