<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ltkm_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ltkm_id');
            $table->string('txn_id', 30)->nullable();
            $table->timestamp('txn_time');
            $table->string('type', 100);
            $table->string('outlet')->nullable();
            $table->bigInteger('amount');
            $table->json('rules_triggered')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['ltkm_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('ltkm_transactions'); }
};
