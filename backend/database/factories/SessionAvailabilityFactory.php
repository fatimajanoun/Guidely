<?php

namespace Database\Factories;

use App\Models\SessionAvailability;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SessionAvailability>
 */
class SessionAvailabilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $start = fake()->dateTimeBetween('+1 days', '+1 month');

        return [
            'scheduled_at' => $start,
            'status' => fake()->randomElement(['open', 'full', 'cancelled', 'completed']),
        ];
    }
}
