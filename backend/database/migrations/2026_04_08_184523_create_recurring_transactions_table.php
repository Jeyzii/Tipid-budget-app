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
        Schema::create('recurring_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->decimal('amount', 14, 2);
            $table->text('description')->nullable();
            $table->string('frequency');
            $table->unsignedInteger('interval_value')->default(1);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->dateTime('next_run_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active', 'next_run_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_transactions');
    }
};
