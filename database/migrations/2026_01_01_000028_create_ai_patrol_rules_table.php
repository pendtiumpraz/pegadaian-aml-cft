<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ai_patrol_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_id', 20)->unique();
            $table->string('name');
            $table->text('prompt_text');
            $table->text('generated_sql')->nullable();
            $table->text('generated_formula')->nullable();
            $table->enum('step', ['compose','generated','running','results'])->default('compose');
            $table->enum('status', ['draft','active','archived'])->default('draft');
            $table->enum('category', ['LTKT','Anomaly','Risk','Sanctions','PEP'])->nullable();
            $table->string('promoted_to_rule_id', 20)->nullable();
            $table->unsignedBigInteger('created_by');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['status','category']);
        });
    }
    public function down(): void { Schema::dropIfExists('ai_patrol_rules'); }
};
