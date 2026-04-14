<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id')->index();
            $table->string('file_name');
            $table->string('file_path');
            $table->enum('file_type', ['image', 'pdf', 'video', 'document'])->default('document');
            $table->unsignedInteger('file_size')->default(0);
            $table->string('mime_type');
            $table->uuid('uploaded_by')->nullable();
            $table->string('uploaded_by_name')->nullable();
            $table->timestamps();

            $table->foreign('mission_id')->references('id')->on('missions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_documents');
    }
};
