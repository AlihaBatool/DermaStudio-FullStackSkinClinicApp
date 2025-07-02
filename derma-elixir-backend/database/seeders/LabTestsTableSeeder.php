<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\LabTest;

class LabTestsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing lab tests
        LabTest::query()->delete();

        // Seed lab tests
        LabTest::create([
            'name' => 'Skin Allergy Test',
            'description' => 'Determines specific allergens that may be causing skin reactions or irritations.',
            'preparation' => 'Avoid antihistamines for 7 days before the test.',
            'price' => 0
        ]);

        LabTest::create([
            'name' => 'Hormone Profile',
            'description' => 'Analyzes hormone levels that may affect skin and hair health.',
            'preparation' => 'Fasting for 8-12 hours required.',
            'price' => 0
        ]);

        LabTest::create([
            'name' => 'Nutrient Deficiency Panel',
            'description' => 'Identifies vitamin and mineral deficiencies affecting skin, hair, and nail health.',
            'preparation' => 'No special preparation needed.',
            'price' => 0
        ]);

        LabTest::create([
            'name' => 'Skin Bacteria Culture',
            'description' => 'Identifies bacterial infections affecting the skin.',
            'preparation' => 'Do not apply topical medications for 24 hours before the test.',
            'price' => 0
        ]);

        LabTest::create([
            'name' => 'Scalp Analysis',
            'description' => 'Microscopic examination of scalp and hair follicles to diagnose conditions.',
            'preparation' => 'Do not wash hair for 24 hours before the test.',
            'price' => 0
        ]);

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}