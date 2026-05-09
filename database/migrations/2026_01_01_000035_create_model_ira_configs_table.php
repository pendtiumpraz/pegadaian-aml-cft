<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('model_ira_configs', function (Blueprint $table) {
            $table->id();
            $table->string('version', 20);
            $table->string('algorithm');
            $table->decimal('auc', 4, 3)->nullable();
            $table->decimal('precision_at_70', 4, 3)->nullable();
            $table->decimal('recall_at_70', 4, 3)->nullable();
            $table->tinyInteger('fp_rate')->unsigned()->nullable();
            $table->string('retrain_schedule')->nullable();
            $table->tinyInteger('weight_profil')->unsigned()->default(20);
            $table->tinyInteger('weight_geografi')->unsigned()->default(15);
            $table->tinyInteger('weight_produk')->unsigned()->default(25);
            $table->tinyInteger('weight_pola_tx')->unsigned()->default(30);
            $table->tinyInteger('weight_channel')->unsigned()->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamp('activated_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('model_ira_configs'); }
};
