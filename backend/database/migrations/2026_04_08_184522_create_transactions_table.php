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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->decimal('amount', 14, 2);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->string('reference_no')->nullable();
            $table->foreignId('related_transfer_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->string('created_by_source')->default('manual');
            $table->json('metadata_json')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'transaction_date']);
            $table->index(['user_id', 'account_id', 'transaction_date']);
            $table->index(['user_id', 'category_id', 'transaction_date']);
            $table->index(['user_id', 'type', 'transaction_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
