<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('patrol_executions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patrol_rule_id');
            $table->unsignedBigInteger('data_source_id');
            $table->unsignedBigInteger('executed_by');
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->decimal('duration_seconds', 6, 2)->nullable();
            $table->decimal('data_scanned_gb', 6, 2)->nullable();
            $table->unsignedInteger('hit_count')->default(0);
            $table->unsignedInteger('promoted_count')->default(0);
            $table->enum('status', ['running','ok','error','timeout'])->default('running');
            $table->text('error_msg')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['patrol_rule_id','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('patrol_executions'); }
};
