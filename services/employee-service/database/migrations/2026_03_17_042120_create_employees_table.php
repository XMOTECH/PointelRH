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
        Schema::create('employees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->uuid('department_id');
            $table->uuid('schedule_id');
            $table->enum('contract_type', ['cdi','cdd','freelance','intern'])
                  ->default('cdi');
            $table->string('qr_token')->unique();   // généré automatiquement
            $table->date('hire_date');
            $table->enum('status', ['active','inactive','suspended'])
                  ->default('active');
            $table->uuid('company_id');
            $table->timestamps();
     
            $table->foreign('department_id')
                  ->references('id')->on('departments')->onDelete('restrict');
            $table->foreign('schedule_id')
                  ->references('id')->on('schedules')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
