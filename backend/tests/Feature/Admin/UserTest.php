<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can get users', function () {
    $admin = User::factory()->admin()->create();

    Sanctum::actingAs($admin);

    User::factory()->count(5)->create();

    $response = $this->getJson('/api/v1/admin/users');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Users Fetched Successfully',
        ]);
});

test('only admin can get users', function () {
    $user = User::factory()->student()->create();

    Sanctum::actingAs($user);
    $response = $this->getJson('/api/v1/admin/users');

    $response->assertStatus(403);
});

test('users index returns paginated response structure', function () {
    $admin = User::factory()->admin()->create();

    Sanctum::actingAs($admin);

    User::factory()->count(20)->create();

    $response = $this->getJson('/api/v1/admin/users');

    $response->assertStatus(200);

    $response->assertJsonStructure([
        'data' => [
            '*' => [
                'id',
                'name',
                'email',
                'role',
                'avatar_url',
                'phone',
                'school',
                'grade',
                'preferred_language',
                'is_premium',
                'premium_expires_at',
                'onboarding_data',
                'created_at',
            ],
        ],
        'links' => [
            'first',
            'last',
            'prev',
            'next',
        ],
        'meta' => [
            'current_page',
            'from',
            'last_page',
            'links',
            'path',
            'per_page',
            'to',
            'total',
        ],
        'message',
    ]);

    $this->assertCount(15, $response->json('data'));
    $this->assertEquals(15, $response->json('meta.per_page'));
    $this->assertEquals('Users Fetched Successfully', $response->json('message'));
});