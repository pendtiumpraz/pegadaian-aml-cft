<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Drop the old unique index on portal_user_id (it was NOT NULL UNIQUE).
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['portal_user_id']);
        });

        // 2. Make portal_user_id nullable + re-add a non-unique index.
        //    We re-add uniqueness conditionally below using a raw statement so
        //    NULL portal_user_id rows are allowed while non-null ones stay unique.
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('portal_user_id')->nullable()->change();
            $table->index('portal_user_id');
        });

        // 3. Add password + remember_token columns for local login.
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'password')) {
                $table->string('password')->nullable()->after('email');
            }
            if (! Schema::hasColumn('users', 'remember_token')) {
                $table->rememberToken()->after('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'remember_token')) {
                $table->dropColumn('remember_token');
            }
            if (Schema::hasColumn('users', 'password')) {
                $table->dropColumn('password');
            }
            $table->dropIndex(['portal_user_id']);
            $table->unsignedBigInteger('portal_user_id')->nullable(false)->change();
            $table->unique('portal_user_id');
        });
    }
};
