<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ltkm_reports', function (Blueprint $table) {
            $table->id();
            $table->string('ltkm_id', 25)->unique();
            $table->unsignedBigInteger('case_id')->nullable();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('analyst_id');
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->enum('status', ['draft','active','review','submitted','rejected'])->default('draft');
            $table->string('pelapor_pjk');
            $table->string('pelapor_name');
            $table->string('terlapor_name');
            $table->text('terlapor_nik_encrypted')->nullable();
            $table->string('terlapor_cif', 20)->nullable();
            $table->string('terlapor_occupation')->nullable();
            $table->text('terlapor_address')->nullable();
            $table->string('terlapor_phone', 30)->nullable();
            $table->text('narrative')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->string('ppatk_receipt', 100)->nullable();
            $table->string('type');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['customer_id','analyst_id','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('ltkm_reports'); }
};
