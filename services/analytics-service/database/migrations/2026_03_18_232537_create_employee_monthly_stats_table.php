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
        Schema::create('employee_monthly_stats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id');
            $table->uuid('company_id');
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('present_days')->default(0);
            $table->unsignedTinyInteger('absent_days')->default(0);
            $table->unsignedTinyInteger('late_days')->default(0);
            $table->unsignedInteger('total_late_minutes')->default(0);
            $table->unsignedInteger('total_work_minutes')->default(0);
            $table->unsignedInteger('overtime_minutes')->default(0);
            $table->unsignedTinyInteger('leave_days')->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_monthly_stats');
    }
};
