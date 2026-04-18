# Architecture Blueprint

## Domain Modules

- Auth
- Accounts
- Categories
- Transactions
- Budgets
- RecurringTransactions
- Reports
- Exports

## Backend Layering (Laravel)

Per module:

- Model
- Migration
- Policy
- Form Request
- Controller
- Service
- Resource
- Tests

Recommended layout:

```
app/
  Http/
    Controllers/Api/
    Requests/
    Resources/
  Models/
  Policies/
  Services/
  Actions/ (optional for command-style use cases)
```

## Core Service Boundaries

## TransactionService

- `createTransaction()`
- `updateTransaction()`
- `deleteTransaction()`
- `transferBetweenAccounts()`
- `recalculateBalances()` (internal utility when needed)

## BudgetService

- `createBudget()`
- `getBudgetProgress()`
- `getBudgetSummaryByMonth()`

## RecurringTransactionService

- `generateDueTransactions()`
- `previewUpcoming()`

## ReportService

- `incomeExpenseSummary()`
- `categoryBreakdown()`
- `accountStatement()`
- `netWorthSummary()` (for post-MVP extension)

## Critical Invariants

- Account balances updated for create/update/delete of transactions
- Transfer always written as paired debit/credit records
- Report queries respect user scope and transaction date range
- Recurring generator is idempotent to avoid duplicate rows

## Frontend Structure (React)

```
src/
  app/
    router.tsx
    providers.tsx
  features/
    auth/
    dashboard/
    accounts/
    categories/
    transactions/
    budgets/
    recurring/
    reports/
    settings/
  components/
    ui/
    charts/
    forms/
    tables/
    filters/
  lib/
    api.ts
    query-client.ts
    currency.ts
    date.ts
  hooks/
  types/
```

## API Principles

- REST-style endpoints by domain
- Form requests for validation
- Policies for authorization
- API resources for stable response format
- Query object/DTO pattern for complex report filters
