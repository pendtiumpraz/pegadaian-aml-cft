<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('edd_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('edd_case_id');
            $table->string('name');
            $table->string('file_path', 500);
            $table->enum('status', ['pending','accepted','rejected'])->default('pending');
            $table->unsignedBigInteger('uploaded_by');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['edd_case_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('edd_documents'); }
};
