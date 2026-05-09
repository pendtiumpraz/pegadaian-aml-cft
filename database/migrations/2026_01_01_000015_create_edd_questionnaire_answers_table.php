<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('edd_questionnaire_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('edd_case_id');
            $table->string('question', 500);
            $table->text('answer')->nullable();
            $table->enum('status', ['ok','warn'])->default('ok');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['edd_case_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('edd_questionnaire_answers'); }
};
