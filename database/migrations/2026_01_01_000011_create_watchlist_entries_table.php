<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('watchlist_entries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('source_id');
            $table->string('name');
            $table->json('aliases_json')->nullable();
            $table->date('dob')->nullable();
            $table->string('nationality', 100)->nullable();
            $table->json('id_numbers_json')->nullable();
            $table->text('address')->nullable();
            $table->enum('type', ['individual','entity','vessel'])->default('individual');
            $table->json('metadata_json')->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
            $table->index(['source_id','type']);
            $table->fullText('name');
        });
    }
    public function down(): void { Schema::dropIfExists('watchlist_entries'); }
};
