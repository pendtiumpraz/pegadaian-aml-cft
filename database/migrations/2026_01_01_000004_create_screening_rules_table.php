<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('screening_rules', function (Blueprint $table) {
            $table->id();
            $table->string('rule_id', 20)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['LTKT','Anomaly','Risk','Sanctions','PEP']);
            $table->json('conditions_json');
            $table->string('threshold')->nullable();
            $table->enum('severity', ['low','med','high'])->default('med');
            $table->boolean('is_active')->default(true);
            $table->string('version', 20)->default('v1.0');
            $table->unsignedInteger('hit_count_30d')->default(0);
            $table->tinyInteger('fp_rate')->unsigned()->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['category','is_active']);
        });
    }
    public function down(): void { Schema::dropIfExists('screening_rules'); }
};
