<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('watchlist_hits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('watchlist_entry_id');
            $table->unsignedBigInteger('source_id');
            $table->tinyInteger('confidence')->unsigned();
            $table->enum('match_type', ['nama_dob','nama_parsial','nama_umum','nama_alamat']);
            $table->enum('action', ['investigasi','review','false_positive'])->nullable();
            $table->unsignedBigInteger('actioned_by')->nullable();
            $table->timestamp('actioned_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('alert_id', 25)->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['customer_id','source_id','confidence','action']);
        });
    }
    public function down(): void { Schema::dropIfExists('watchlist_hits'); }
};
