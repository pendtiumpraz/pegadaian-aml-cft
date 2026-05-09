<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::dropIfExists('transactions');
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('txn_id', 30)->unique();
            $table->unsignedBigInteger('customer_id');
            $table->string('cif', 20);
            $table->unsignedBigInteger('outlet_id')->nullable();
            $table->enum('channel', ['outlet','digital']);
            $table->enum('type', ['gadai_emas','gadai_elektronik','tebus_emas','tabungan_emas','tunai_ltkt','topup_tab_emas']);
            $table->bigInteger('amount');
            $table->timestamp('txn_time');
            $table->boolean('flagged')->default(false);
            $table->enum('flag_tone', ['alert','watch'])->nullable();
            $table->tinyInteger('risk_score')->unsigned()->default(0);
            $table->json('rules_triggered')->nullable();
            $table->boolean('reviewed')->default(false);
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('counterparty')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['customer_id','cif','txn_time','type','flagged','risk_score'], 'idx_txn_main');
        });
    }
    public function down(): void { Schema::dropIfExists('transactions'); }
};
