<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('data_sources', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 100)->unique();
            $table->string('name');
            $table->enum('type', ['postgresql','mysql','oracle','sql_server','snowflake','bigquery','rest_api']);
            $table->string('host');
            $table->smallInteger('port')->unsigned();
            $table->string('database_name');
            $table->string('db_user');
            $table->string('password_vault_ref')->nullable();
            $table->boolean('ssl_enabled')->default(true);
            $table->boolean('validate_view_only')->default(true);
            $table->boolean('auto_discovery')->default(true);
            $table->unsignedInteger('table_count')->default(0);
            $table->smallInteger('latency_ms')->unsigned()->nullable();
            $table->enum('status', ['ok','warn','error'])->default('ok');
            $table->boolean('is_primary')->default(false);
            $table->timestamp('last_scanned_at')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('data_sources'); }
};
