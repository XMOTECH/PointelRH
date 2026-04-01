<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('snapshot_date');
            $table->uuid('company_id');
            $table->uuid('department_id');
            $table->unsignedSmallInteger('total_employees')->default(0);
            $table->unsignedSmallInteger('present_count')->default(0);
            $table->unsignedSmallInteger('late_count')->default(0);
            $table->unsignedSmallInteger('absent_count')->default(0);
            $table->unsignedSmallInteger('excused_count')->default(0);
            $table->decimal('avg_late_minutes', 6, 2)->default(0);
            $table->unsignedInteger('total_late_minutes')->default(0);
            $table->unsignedInteger('total_work_minutes')->default(0);
            $table->unsignedInteger('total_overtime_minutes')->default(0);
            $table->decimal('presence_rate', 5, 2)->default(0);
            $table->decimal('punctuality_rate', 5, 2)->default(0);
            $table->timestamp('last_updated_at')->useCurrent();
            $table->timestamps();

            $table->unique(['snapshot_date', 'company_id', 'department_id']);
            $table->index(['snapshot_date', 'company_id']);
            $table->index(['company_id', 'department_id', 'snapshot_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_snapshots');
    }
};
