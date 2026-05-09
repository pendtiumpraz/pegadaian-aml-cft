<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('edd_cases', function (Blueprint $table) {
            $table->id();
            $table->string('edd_id', 20)->unique();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('case_id')->nullable();
            $table->string('trigger_reason');
            $table->tinyInteger('risk_score')->unsigned();
            $table->enum('stage', ['trigger','profil','sumber_dana','beneficial_owner','approval'])->default('trigger');
            $table->enum('status', ['antrian','sedang_berjalan','approved','rejected'])->default('antrian');
            $table->unsignedBigInteger('analyst_id')->nullable();
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('approval_decision')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['customer_id','stage','status','analyst_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('edd_cases'); }
};
