<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('awareness_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('channel');
            $table->unsignedInteger('reach_count')->default(0);
            $table->enum('status', ['berlangsung','mendatang','selesai'])->default('mendatang');
            $table->date('ends_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('awareness_campaigns'); }
};
