<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('data_source_tables', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('data_source_id');
            $table->string('schema_name', 100)->nullable();
            $table->string('table_name');
            $table->unsignedBigInteger('row_count')->default(0);
            $table->smallInteger('column_count')->unsigned()->default(0);
            $table->json('sample_columns')->nullable();
            $table->tinyInteger('pii_column_count')->unsigned()->default(0);
            $table->boolean('is_used_in_patrol')->default(false);
            $table->softDeletes();
            $table->timestamps();
            $table->index(['data_source_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('data_source_tables'); }
};
