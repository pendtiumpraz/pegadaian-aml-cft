<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ltkm_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ltkm_id');
            $table->string('name');
            $table->string('file_path', 500);
            $table->string('upload_status', 100)->nullable();
            $table->unsignedBigInteger('uploaded_by');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['ltkm_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('ltkm_attachments'); }
};
