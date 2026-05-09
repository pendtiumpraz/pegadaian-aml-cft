<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_id', 25)->unique();
            $table->string('alert_id', 25);
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('analyst_id');
            $table->unsignedBigInteger('approver_id')->nullable();
            $table->enum('state', ['open','investigating','pending_approval','closed','rejected'])->default('open');
            $table->enum('decision', ['ltkm','dismiss','monitor','escalate'])->nullable();
            $table->text('narrative')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('escalated_at')->nullable();
            $table->unsignedBigInteger('escalated_by')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['case_id','alert_id','customer_id','analyst_id','state']);
        });
    }
    public function down(): void { Schema::dropIfExists('cases'); }
};
