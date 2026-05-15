<?php

namespace Database\Factories;

use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MentorProfile>
 */
class MentorProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'mentor']),
            'session_duration_minutes' => fake()->randomElement([30, 45, 60, 90]),
            'session_price' => fake()->randomFloat(2, 15, 120),
            'currency' => fake()->randomElement(['USD', 'LBP', 'EUR']),
            'email' => fake()->unique()->safeEmail(),
            'is_accepting_students' => fake()->boolean(80),
        ];
    }
}
