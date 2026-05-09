<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('training_completions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('module_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('completed_at');
            $table->tinyInteger('score')->unsigned()->nullable();
            $table->string('certificate_path', 500)->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['module_id','user_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('training_completions'); }
};
