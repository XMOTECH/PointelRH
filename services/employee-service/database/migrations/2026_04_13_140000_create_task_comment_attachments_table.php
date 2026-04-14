<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_comment_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('task_comment_id')->index();
            $table->string('file_name');
            $table->string('file_path');
            $table->enum('file_type', ['image', 'pdf', 'video', 'document'])->default('document');
            $table->unsignedInteger('file_size')->default(0);
            $table->string('mime_type');
            $table->timestamps();

            $table->foreign('task_comment_id')->references('id')->on('task_comments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_comment_attachments');
    }
};
