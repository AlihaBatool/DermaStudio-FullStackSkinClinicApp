<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'username' => 'admin',
            'email' => 'admin@dermaelixir.com',
            'password' => Hash::make('admin123456'),
            'mobile' => '12345678901',
            'cnic' => '12345-1234567-1',
            'state' => 'Admin State',
            'city' => 'Admin City',
            'user_type' => 'admin'
        ]);
    }
}