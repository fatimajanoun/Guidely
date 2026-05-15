<?php

namespace Database\Seeders;

use App\Models\MentorProfile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->count(20)->student()->create();

        $mentors = User::factory()->count(10)->mentor()->create();

        $mentors->each(function (User $mentor): void {
            MentorProfile::factory()->for($mentor)->create([
                'email' => $mentor->email,
            ]);
        });

        User::factory()->admin()->create([
            'name' => 'admin1',
            'email' => 'admin1@guidely.com'
        ]);
    }
}
