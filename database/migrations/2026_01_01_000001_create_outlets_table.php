<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('outlets', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->string('city', 100);
            $table->string('region', 100);
            $table->string('province', 100);
            $table->enum('type', ['cabang','unit','digital'])->default('cabang');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('outlets'); }
};
