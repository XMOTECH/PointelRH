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
        Schema::create('schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');                          // ex: "Standard 9h-17h"
            $table->json('work_days');                       // [1,2,3,4,5] = lun-ven
            $table->time('start_time');                      // ex: "09:00:00"
            $table->time('end_time');                        // ex: "17:00:00"
            $table->unsignedSmallInteger('grace_minutes')->default(5); // tolérance retard
            $table->string('timezone')->default('Africa/Dakar');
            $table->uuid('company_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
