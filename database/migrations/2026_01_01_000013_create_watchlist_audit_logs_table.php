<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('watchlist_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('source_id');
            $table->string('operation');
            $table->integer('delta_added')->default(0);
            $table->integer('delta_removed')->default(0);
            $table->string('actor', 100)->default('system');
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->enum('status', ['ok','error'])->default('ok');
            $table->text('error_msg')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['source_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('watchlist_audit_logs'); }
};
