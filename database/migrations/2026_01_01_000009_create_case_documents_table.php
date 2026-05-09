<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('case_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('case_id');
            $table->string('name');
            $table->string('file_path', 500);
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('uploaded_by');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['case_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('case_documents'); }
};
