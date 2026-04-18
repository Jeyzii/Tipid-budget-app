<?php

namespace App\Console\Commands;

use App\Services\RecurringTransactionService;
use Illuminate\Console\Command;

class GenerateRecurringTransactions extends Command
{
    protected $signature = 'recurring:generate';

    protected $description = 'Create transactions from due recurring rules';

    public function handle(RecurringTransactionService $service): int
    {
        $n = $service->generateDue();
        $this->info("Generated {$n} transaction(s).");

        return self::SUCCESS;
    }
}
