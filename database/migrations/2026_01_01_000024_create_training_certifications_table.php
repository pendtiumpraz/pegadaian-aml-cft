<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('training_certifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('certification', 100);
            $table->date('issued_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->smallInteger('days_remaining')->nullable();
            $table->enum('status', ['active','expiring','expired'])->default('active');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['user_id','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('training_certifications'); }
};
