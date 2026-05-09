<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('patrol_queries', function (Blueprint $table) {
            $table->id();
            $table->text('prompt');
            $table->text('formula')->nullable();
            $table->text('generated_sql')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->unsignedInteger('execution_time_ms')->nullable();
            $table->unsignedInteger('result_count')->nullable();
            $table->decimal('cost_estimate', 10, 4)->nullable();
            $table->enum('status', ['draft', 'generated', 'executed', 'failed'])->default('draft');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('result_json')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['status', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patrol_queries');
    }
};
