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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id');
            $table->string('notification_type');
            $table->boolean('email_enabled')->default(true);
            $table->boolean('whatsapp_enabled')->default(true);
            $table->boolean('inapp_enabled')->default(true);
            $table->time('quiet_hours_start')->default('20:00:00');
            $table->time('quiet_hours_end')->default('07:00:00');
            $table->timestamps();
            
            $table->unique(['employee_id','notification_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
