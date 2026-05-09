<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('notification_name');
            $table->enum('frequency', ['realtime','1_hari','harian_digest','mingguan'])->default('realtime');
            $table->boolean('channel_inapp')->default(true);
            $table->boolean('channel_email')->default(true);
            $table->boolean('channel_teams')->default(false);
            $table->boolean('channel_sms')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['user_id','notification_name']);
        });
    }
    public function down(): void { Schema::dropIfExists('notification_preferences'); }
};
