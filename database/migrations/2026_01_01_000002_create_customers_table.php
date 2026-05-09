<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('cif', 20)->unique();
            $table->text('nik_encrypted');
            $table->string('name');
            $table->date('dob')->nullable();
            $table->string('pob', 100)->nullable();
            $table->enum('gender', ['M','F'])->nullable();
            $table->string('occupation')->nullable();
            $table->string('income_range', 100)->nullable();
            $table->string('source_of_funds')->nullable();
            $table->string('purpose')->nullable();
            $table->text('address')->nullable();
            $table->string('domicili_area')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->enum('channel', ['outlet','digital','both'])->default('outlet');
            $table->timestamp('onboarded_at')->nullable();
            $table->string('onboarded_branch')->nullable();
            $table->boolean('pep_flag')->default(false);
            $table->tinyInteger('pep_tier')->unsigned()->nullable();
            $table->enum('risk_level', ['low','med','high'])->default('low');
            $table->tinyInteger('ira_score')->unsigned()->default(0);
            $table->enum('ira_tier', ['rendah','menengah','tinggi'])->default('rendah');
            $table->boolean('dukcapil_verified')->default(false);
            $table->timestamp('dukcapil_verified_at')->nullable();
            $table->boolean('biometric_verified')->default(false);
            $table->timestamp('biometric_updated_at')->nullable();
            $table->date('cdd_due_date')->nullable();
            $table->enum('status', ['active','suspended','closed'])->default('active');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['cif','risk_level','pep_flag','ira_tier','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('customers'); }
};
