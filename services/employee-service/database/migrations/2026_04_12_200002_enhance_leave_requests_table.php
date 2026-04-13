<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->uuid('leave_type_id')->nullable()->after('leave_type');
            $table->uuid('approved_by')->nullable()->after('status');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
            $table->string('attachment_path')->nullable()->after('rejection_reason');
            $table->boolean('half_day')->default(false)->after('attachment_path');
            $table->string('half_day_period')->nullable()->after('half_day'); // morning, afternoon
            $table->decimal('days_count', 5, 2)->nullable()->after('half_day_period');

            $table->foreign('leave_type_id')->references('id')->on('leave_types')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('employees')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropForeign(['leave_type_id']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'leave_type_id',
                'approved_by',
                'approved_at',
                'rejection_reason',
                'attachment_path',
                'half_day',
                'half_day_period',
                'days_count',
            ]);
        });
    }
};
