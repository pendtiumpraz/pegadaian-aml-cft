<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('customer_ira_components', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->timestamp('scored_at')->useCurrent();
            $table->tinyInteger('total_score')->unsigned();
            $table->tinyInteger('profil_score')->unsigned();
            $table->tinyInteger('geografi_score')->unsigned();
            $table->tinyInteger('produk_score')->unsigned();
            $table->tinyInteger('pola_tx_score')->unsigned();
            $table->tinyInteger('channel_score')->unsigned();
            $table->tinyInteger('prev_score')->unsigned()->nullable();
            $table->smallInteger('delta_score')->nullable();
            $table->boolean('triggered_rescore')->default(false);
            $table->text('rescore_reason')->nullable();
            $table->enum('scored_by', ['system','manual'])->default('system');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['customer_id','scored_at','total_score']);
        });
    }
    public function down(): void { Schema::dropIfExists('customer_ira_components'); }
};
