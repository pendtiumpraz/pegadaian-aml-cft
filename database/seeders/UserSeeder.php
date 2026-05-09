<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('Password123!');

        $users = [
            [
                'portal_user_id' => null,
                'email'          => 'analis@aml.pegadaian.co.id',
                'name'           => 'Analis AML',
                'role'           => 'analyst',
                'is_active'      => true,
                'password'       => $defaultPassword,
            ],
            [
                'portal_user_id' => null,
                'email'          => 'approver@aml.pegadaian.co.id',
                'name'           => 'Approver AML',
                'role'           => 'approver',
                'is_active'      => true,
                'password'       => $defaultPassword,
            ],
            [
                'portal_user_id' => null,
                'email'          => 'admin@aml.pegadaian.co.id',
                'name'           => 'Admin AML',
                'role'           => 'admin',
                'is_active'      => true,
                'password'       => $defaultPassword,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }
    }
}
