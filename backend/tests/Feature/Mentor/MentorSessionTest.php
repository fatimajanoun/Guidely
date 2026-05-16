<?php

use App\Models\MentorSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('requires authentication to list mentor sessions', function () {
    $this->getJson('/api/v1/mentor/sessions')
        ->assertUnauthorized();
});

it('allows only mentors to list mentor sessions', function () {
    $student = User::factory()->student()->create();

    Sanctum::actingAs($student);

    $this->getJson('/api/v1/mentor/sessions')
        ->assertForbidden();
});

it('returns only sessions owned by the authenticated mentor', function () {
    $mentor = User::factory()->mentor()->create();
    $otherMentor = User::factory()->mentor()->create();

    $ownSession = MentorSession::factory()->for($mentor, 'mentor')->create([
        'title' => 'College application review',
        'type' => 'one-on-one',
        'duration_minutes' => 60,
        'max_capacity' => 1,
        'price' => 50,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    MentorSession::factory()->for($mentor, 'mentor')->create([
        'title' => 'Portfolio planning group',
        'type' => 'group',
        'duration_minutes' => 90,
        'max_capacity' => 8,
        'price' => 35,
        'currency' => 'USD',
        'is_active' => false,
    ]);

    MentorSession::factory()->for($otherMentor, 'mentor')->create([
        'title' => 'Other mentor session',
    ]);

    Sanctum::actingAs($mentor);

    $response = $this->getJson('/api/v1/mentor/sessions');

    $response
        ->assertOk()
        ->assertJsonPath('message', 'Mentor sessions retrieved successfully')
        ->assertJsonCount(2, 'data')
        ->assertJsonFragment([
            'id' => $ownSession->id,
            'title' => 'College application review',
            'type' => 'one-on-one',
            'duration_minutes' => 60,
            'max_capacity' => 1,
            'price' => '50.00',
            'currency' => 'USD',
            'is_active' => true,
            'status' => 'active',
        ])
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'description',
                    'type',
                    'duration_minutes',
                    'max_capacity',
                    'price',
                    'currency',
                    'is_active',
                    'status',
                    'availabilities_count',
                    'created_at',
                    'updated_at',
                ],
            ],
            'message',
        ])
        ->assertJsonMissingPath('data.0.user_id')
        ->assertJsonMissingPath('data.1.user_id')
        ->assertJsonMissing(['title' => 'Other mentor session']);
});

it('returns an empty list when the mentor has no sessions', function () {
    $mentor = User::factory()->mentor()->create();

    Sanctum::actingAs($mentor);

    $this->getJson('/api/v1/mentor/sessions')
        ->assertOk()
        ->assertJsonPath('message', 'Mentor sessions retrieved successfully')
        ->assertJsonCount(0, 'data');
});
