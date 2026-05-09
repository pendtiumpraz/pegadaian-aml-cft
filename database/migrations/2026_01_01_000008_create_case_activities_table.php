<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('case_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('case_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->enum('type', ['comment','status_change','assignment','escalation','document_added','system']);
            $table->string('title');
            $table->text('body')->nullable();
            $table->enum('tone', ['default','red','green','amber'])->default('default');
            $table->json('metadata_json')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['case_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('case_activities'); }
};
