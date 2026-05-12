<?php

use App\Models\Category;
use App\Models\Major;
use App\Models\QuizResult;
use App\Models\User;
use Database\Factories\QuizResultFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('requires authentication to get user favorite majors', function () {
    $this->getJson('/api/v1/user/favorites')
        ->assertUnauthorized();
});

it('returns the authenticated users favorite majors', function () {
    $user = User::factory()->student()->create();
    $otherUser = User::factory()->student()->create();

    $firstFavorite = Major::factory()->create([
        'name_en' => 'Computer Science',
    ]);
    $secondFavorite = Major::factory()->create([
        'name_en' => 'Medicine',
    ]);
    $otherFavorite = Major::factory()->create([
        'name_en' => 'Business Administration',
    ]);

    $user->favoriteMajors()->attach($firstFavorite->id, [
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);
    $user->favoriteMajors()->attach($secondFavorite->id, [
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $otherUser->favoriteMajors()->attach($otherFavorite->id);

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/user/favorites');

    $response
        ->assertOk()
        ->assertJsonPath('message', 'Favorite majors retrieved successfully')
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $secondFavorite->id)
        ->assertJsonPath('data.0.name_en', 'Medicine')
        ->assertJsonPath('data.1.id', $firstFavorite->id)
        ->assertJsonPath('data.1.name_en', 'Computer Science')
        ->assertJsonMissing([
            'name_en' => 'Business Administration',
        ]);
});

it('requires authentication to toggle a major favorite', function () {
    $major = Major::factory()->create();

    $this->patchJson("/api/v1/majors/{$major->id}/favorite")
        ->assertUnauthorized();
});

it('adds a major to favorites for the authenticated user', function () {
    $user = User::factory()->student()->create();
    $major = Major::factory()->create();

    Sanctum::actingAs($user);

    $response = $this->patchJson("/api/v1/majors/{$major->id}/favorite");

    $response
        ->assertOk()
        ->assertJsonPath('message', 'Major added to favorites')
        ->assertJsonPath('data.is_favorite', true);

    $this->assertDatabaseHas('user_favorites', [
        'user_id' => $user->id,
        'major_id' => $major->id,
    ]);
});

it('removes a major from favorites when already favorited', function () {
    $user = User::factory()->student()->create();
    $major = Major::factory()->create();

    $user->favoriteMajors()->attach($major->id);

    Sanctum::actingAs($user);

    $response = $this->patchJson("/api/v1/majors/{$major->id}/favorite");

    $response
        ->assertOk()
        ->assertJsonPath('message', 'Major removed from favorites')
        ->assertJsonPath('data.is_favorite', false);

    $this->assertDatabaseMissing('user_favorites', [
        'user_id' => $user->id,
        'major_id' => $major->id,
    ]);
});

it('returns not found when toggling a missing major favorite', function () {
    $user = User::factory()->student()->create();

    Sanctum::actingAs($user);

    $this->patchJson('/api/v1/majors/999999/favorite')
        ->assertNotFound();
});


it('ensures featured majors are not duplicated in recommended or others', function () {

    $student = User::factory()->student()->create();
    Sanctum::actingAs($student);

    $category = Category::factory()->create();

    $featuredMajor = Major::factory()->create([
        'category_id' => $category->id,
        'is_featured' => true,
    ]);

    $recommendedMajor = Major::factory()->create([
        'category_id' => $category->id,
    ]);

    $otherMajor = Major::factory()->create([
        'category_id' => $category->id,
    ]);

    // simulate recommendation
    QuizResult::factory()->create([
        'user_id' => $student->id,
    ]);

    $response = $this->getJson('/api/v1/majors');

    $response->assertOk();

    $recommendedIds = collect($response->json('data.recommended'))
        ->pluck('id');

    $featuredIds = collect($response->json('data.featured'))
        ->pluck('id');

    $othersIds = collect($response->json('data.others.data'))
        ->pluck('id');

    // featured must NOT appear in recommended
    expect($recommendedIds)->not->toContain($featuredMajor->id);

    // featured must NOT appear in others
    expect($othersIds)->not->toContain($featuredMajor->id);

    // recommended must contain correct major
    expect($recommendedIds)->toContain($recommendedMajor->id);
});
