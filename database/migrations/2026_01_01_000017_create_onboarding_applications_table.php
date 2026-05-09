<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('onboarding_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_id', 20)->unique();
            $table->text('nik_encrypted');
            $table->string('name');
            $table->date('dob');
            $table->string('pob', 100);
            $table->string('occupation')->nullable();
            $table->string('income_range', 100)->nullable();
            $table->string('source_of_funds')->nullable();
            $table->string('purpose')->nullable();
            $table->enum('channel', ['outlet','digital']);
            $table->unsignedBigInteger('outlet_id')->nullable();
            $table->enum('stage', ['input','screening','verifikasi','skoring','persetujuan'])->default('input');
            $table->json('screening_result')->nullable();
            $table->boolean('dukcapil_verified')->default(false);
            $table->boolean('biometric_verified')->default(false);
            $table->tinyInteger('ira_score')->unsigned()->nullable();
            $table->enum('risk_level', ['low','med','high'])->nullable();
            $table->enum('status', ['draft','submitted','approved','rejected','edd_required'])->default('draft');
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['stage','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('onboarding_applications'); }
};
