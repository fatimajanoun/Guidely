<?php

use App\Models\Major;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('requires authentication to toggle a major favorite', function () {
    $major = Major::factory()->create();

    $this->postJson("/api/v1/majors/{$major->id}/favorite")
        ->assertUnauthorized();
});

it('adds a major to favorites for the authenticated user', function () {
    $user = User::factory()->student()->create();
    $major = Major::factory()->create();

    Sanctum::actingAs($user);

    $response = $this->postJson("/api/v1/majors/{$major->id}/favorite");

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

    $response = $this->postJson("/api/v1/majors/{$major->id}/favorite");

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

    $this->postJson('/api/v1/majors/999999/favorite')
        ->assertNotFound();
});
