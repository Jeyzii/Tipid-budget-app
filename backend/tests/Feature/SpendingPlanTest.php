<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SpendingPlanTest extends TestCase
{
    use RefreshDatabase;

    public function test_spending_plan_get_and_upsert(): void
    {
        $user = User::factory()->create();
        $account = Account::query()->create([
            'user_id' => $user->id,
            'name' => 'Checking',
            'type' => 'bank',
            'opening_balance' => 1000,
            'current_balance' => 1000,
            'is_archived' => false,
        ]);

        Transaction::query()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => null,
            'spending_bucket' => 'need',
            'type' => 'expense',
            'amount' => 50,
            'transaction_date' => '2026-04-15',
            'created_by_source' => 'manual',
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/spending-plan?month=4&year=2026')
            ->assertOk()
            ->assertJsonPath('data.buckets.0.spent', '50.00')
            ->assertJsonPath('data.unassigned_spent', '0.00');

        $this->putJson('/api/spending-plan', [
            'month' => 4,
            'year' => 2026,
            'needs_amount' => 100,
            'wants_amount' => 0,
            'savings_amount' => 0,
        ])->assertOk()
            ->assertJsonPath('data.buckets.0.budget', '100.00')
            ->assertJsonPath('data.buckets.0.remaining', '50.00');
    }
}
