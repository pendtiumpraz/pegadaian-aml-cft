<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->string('alert_id', 25)->unique();
            $table->unsignedBigInteger('customer_id');
            $table->string('txn_id', 30)->nullable();
            $table->string('rule_id', 20);
            $table->string('type');
            $table->enum('severity', ['low','med','high']);
            $table->tinyInteger('risk_score')->unsigned();
            $table->enum('status', ['baru','triage','investigasi','eskalasi','selesai'])->default('baru');
            $table->enum('priority', ['low','med','high'])->default('med');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->json('factors_json')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->unsignedBigInteger('closed_by')->nullable();
            $table->text('close_reason')->nullable();
            $table->string('source')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['customer_id','rule_id','status','priority','assigned_to','sla_due_at'], 'idx_alerts_main');
        });
    }
    public function down(): void { Schema::dropIfExists('alerts'); }
};
