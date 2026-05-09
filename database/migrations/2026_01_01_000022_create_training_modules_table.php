<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('training_modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('audience');
            $table->unsignedInteger('duration_minutes')->default(0);
            $table->enum('status_type', ['wajib','spesialis','rekomendasi'])->default('wajib');
            $table->tinyInteger('completion_pct')->unsigned()->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('training_modules'); }
};
