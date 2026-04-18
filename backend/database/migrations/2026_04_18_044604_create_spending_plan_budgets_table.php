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
        Schema::create('spending_plan_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->decimal('needs_amount', 14, 2)->default(0);
            $table->decimal('wants_amount', 14, 2)->default(0);
            $table->decimal('savings_amount', 14, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spending_plan_budgets');
    }
};
