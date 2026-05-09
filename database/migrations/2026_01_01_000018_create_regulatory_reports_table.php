<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('regulatory_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_id', 30)->unique();
            $table->enum('type', ['ltkt_harian','ltkm_insidental','lap_bulanan','lap_triwulanan','lap_semester','lap_tahunan','nasabah_baru','komite']);
            $table->enum('recipient', ['PPATK','OJK','internal','BRI_Grup','BI']);
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedInteger('item_count')->default(0);
            $table->tinyInteger('pct_complete')->unsigned()->default(0);
            $table->enum('status', ['todo','draft','review','submitted'])->default('todo');
            $table->longText('xml_payload')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->date('due_date')->nullable();
            $table->string('ppatk_receipt', 100)->nullable();
            $table->text('submission_note')->nullable();
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['type','recipient','status','period_start']);
        });
    }
    public function down(): void { Schema::dropIfExists('regulatory_reports'); }
};
