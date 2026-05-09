<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('patrol_results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('execution_id');
            $table->unsignedBigInteger('customer_id');
            $table->date('txn_date')->nullable();
            $table->bigInteger('gadai_amount')->nullable();
            $table->bigInteger('tebus_amount')->nullable();
            $table->tinyInteger('outlet_count')->unsigned()->nullable();
            $table->tinyInteger('ira_score')->unsigned()->nullable();
            $table->boolean('is_promoted')->default(false);
            $table->string('promoted_to_alert_id', 25)->nullable();
            $table->unsignedBigInteger('promoted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['execution_id','customer_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('patrol_results'); }
};
