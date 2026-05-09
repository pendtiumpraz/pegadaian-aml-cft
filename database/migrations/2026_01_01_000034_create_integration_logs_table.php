<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('integration_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('integration', ['ppatk','dukcapil','ojk','bi','core_pegadaian','igracias','idesk','ai_api']);
            $table->string('operation');
            $table->json('request_json')->nullable();
            $table->json('response_json')->nullable();
            $table->enum('status', ['ok','error'])->default('ok');
            $table->unsignedInteger('duration_ms')->nullable();
            $table->text('error_msg')->nullable();
            $table->timestamps();
            $table->index(['integration','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('integration_logs'); }
};
