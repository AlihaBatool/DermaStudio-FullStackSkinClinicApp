<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Treatment;

class TreatmentsTableSeeder extends Seeder
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

        // Clear existing treatments
        Treatment::query()->delete();

        // Skin Care Treatments
        Treatment::create([
            'name' => 'Chemical Peels',
            'description' => 'Improve skin texture and reduce signs of aging.',
            'category' => 'Skin Care Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Microdermabrasion',
            'description' => 'Exfoliates and removes dead skin cells to reveal younger skin.',
            'category' => 'Skin Care Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Acne Treatment',
            'description' => 'Targeted treatment for acne using medical-grade products.',
            'category' => 'Skin Care Treatments',
            'price' => 0
        ]);

        // Laser Treatments
        Treatment::create([
            'name' => 'Laser Hair Removal',
            'description' => 'Permanent hair reduction through laser technology.',
            'category' => 'Laser Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Laser Skin Resurfacing',
            'description' => 'Reduces appearance of wrinkles and scars.',
            'category' => 'Laser Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'IPL Photofacial',
            'description' => 'Treats sun damage, pigmentation, and redness.',
            'category' => 'Laser Treatments',
            'price' => 0
        ]);

        // Cosmetic Aesthetic Treatments
        Treatment::create([
            'name' => 'Botox',
            'description' => 'Reduces fine lines and wrinkles.',
            'category' => 'Cosmetic Aesthetic Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Dermal Fillers',
            'description' => 'Restores volume and fullness to the face.',
            'category' => 'Cosmetic Aesthetic Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Microneedling',
            'description' => 'Stimulates collagen production for smoother skin.',
            'category' => 'Cosmetic Aesthetic Treatments',
            'price' => 0
        ]);

        // Hair Treatments
        Treatment::create([
            'name' => 'PRP Hair Restoration',
            'description' => 'Uses platelets from your own blood to stimulate hair growth.',
            'category' => 'Hair Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Scalp Treatment',
            'description' => 'Deep cleansing and nourishment for a healthy scalp.',
            'category' => 'Hair Treatments',
            'price' => 0
        ]);

        Treatment::create([
            'name' => 'Hair Loss Consultation',
            'description' => 'Professional analysis and treatment plan for hair loss.',
            'category' => 'Hair Treatments',
            'price' => 0
        ]);

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}