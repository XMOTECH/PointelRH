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
        Schema::create('attendances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employee_id');           // ref Employee Service
            $table->uuid('company_id');             // tenant isolation
            $table->uuid('department_id');          // denormalise pour analytics

            // Canal de pointage — Pattern Strategy
            $table->string('channel')->default('qr');  // qr|pin|nfc|gps|face

            // Timestamps metier
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamp('checked_out_at')->nullable();
            $table->date('work_date');

            // Calculs RH — precomputes pour analytics rapides
            $table->unsignedSmallInteger('late_minutes')->default(0);
            $table->unsignedSmallInteger('work_minutes')->default(0);
            $table->unsignedSmallInteger('overtime_minutes')->default(0);

            // Statut metier — Enum PHP 8.1
            $table->enum('status', ['present', 'late', 'absent', 'excused', 'holiday'])
                ->default('present');

            // Localisation GPS (v2)
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Metadonnees extensibles par canal
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Index pour requetes frequentes
            $table->index(['work_date', 'company_id']);      // dashboard du jour
            $table->index(['employee_id', 'work_date']);     // historique employe
            $table->index(['department_id', 'work_date']);   // analytics dept

            // Contrainte : 1 seule attendance par employe par jour
            $table->unique(['employee_id', 'work_date'], 'unique_employee_workday');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
