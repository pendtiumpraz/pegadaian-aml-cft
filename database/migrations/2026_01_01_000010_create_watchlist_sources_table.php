<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('watchlist_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('display_name');
            $table->string('source_org')->nullable();
            $table->enum('type', ['DTTOT','DPPSPM','sanctions','PEP','adverse_media']);
            $table->unsignedInteger('entry_count')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->enum('sync_mode', ['auto','manual'])->default('auto');
            $table->enum('sync_status', ['ok','pending','error'])->default('ok');
            $table->string('sync_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('watchlist_sources'); }
};
