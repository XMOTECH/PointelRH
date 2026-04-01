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
        Schema::create('employees_replica', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('qr_token')->unique();
            $table->uuid('company_id')->index();
            $table->uuid('department_id')->nullable();
            $table->uuid('schedule_id')->nullable();

            // To handle suspended users easily
            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees_replica');
    }
};
