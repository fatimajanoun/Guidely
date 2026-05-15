<?php

use App\Models\Major;
use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('requires authentication to update mentor profile', function () {
    $this->patchJson('/api/v1/mentor/profile', [])
        ->assertUnauthorized();
});

it('allows only mentors to update mentor profile', function () {
    $student = User::factory()->student()->create();

    Sanctum::actingAs($student);

    $this->patchJson('/api/v1/mentor/profile', [])
        ->assertForbidden();
});

it('updates the authenticated mentors profile', function () {
    $mentor = User::factory()->mentor()->create();
    $major = Major::factory()->create();
    $newMajor = Major::factory()->create();

    $profile = MentorProfile::factory()->for($mentor)->for($major)->create([
        'status' => 'approved',
        'is_accepting_students' => true,
        'bio' => 'Old bio',
        'years_experience' => 2,
    ]);

    Sanctum::actingAs($mentor);

    $response = $this->patchJson('/api/v1/mentor/profile', [
        'major_id' => $newMajor->id,
        'is_accepting_students' => false,
        'bio' => 'Updated mentor bio',
        'years_experience' => 6,
        'degree' => 'Master',
        'university_name' => 'Lebanese University',
        'graduation_year' => 2020,
        'languages' => ['English', 'Arabic'],
        'linkedin_url' => 'https://www.linkedin.com/in/testmentor',
        'twitter_url' => 'https://twitter.com/testmentor',
        'website_url' => 'https://mentor.example.com',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('message', 'Mentor profile updated successfully')
        ->assertJsonPath('data.id', $profile->id)
        ->assertJsonPath('data.major_id', $newMajor->id)
        ->assertJsonPath('data.is_accepting_students', false)
        ->assertJsonPath('data.bio', 'Updated mentor bio')
        ->assertJsonPath('data.years_experience', 6)
        ->assertJsonPath('data.languages.0', 'English')
        ->assertJsonPath('data.major.id', $newMajor->id);

    $this->assertDatabaseHas('mentor_profiles', [
        'id' => $profile->id,
        'user_id' => $mentor->id,
        'major_id' => $newMajor->id,
        'bio' => 'Updated mentor bio',
        'years_experience' => 6,
    ]);
});

it('does not allow mentor to update profile status', function () {
    $mentor = User::factory()->mentor()->create();
    $profile = MentorProfile::factory()->for($mentor)->create([
        'status' => 'pending',
    ]);

    Sanctum::actingAs($mentor);

    $this->patchJson('/api/v1/mentor/profile', [
        'bio' => 'Updated bio',
        'status' => 'approved',
    ])
        ->assertOk()
        ->assertJsonPath('data.status', 'pending');

    expect($profile->fresh()->status)->toBe('pending');
});

it('returns not found when mentor has no profile', function () {
    $mentor = User::factory()->mentor()->create();

    Sanctum::actingAs($mentor);

    $this->patchJson('/api/v1/mentor/profile', [
        'bio' => 'Updated bio',
    ])
        ->assertNotFound()
        ->assertJsonPath('message', 'Mentor profile not found');
});

it('validates mentor profile update payload', function () {
    $mentor = User::factory()->mentor()->create();
    MentorProfile::factory()->for($mentor)->create();

    Sanctum::actingAs($mentor);

    $this->patchJson('/api/v1/mentor/profile', [
        'major_id' => 999999,
        'is_accepting_students' => 'not-boolean',
        'years_experience' => -1,
        'graduation_year' => 1800,
        'languages' => 'English',
        'website_url' => 'not-a-url',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'major_id',
            'is_accepting_students',
            'years_experience',
            'graduation_year',
            'languages',
            'website_url',
        ]);
});
