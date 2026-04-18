# MVP Execution Plan

## 1) Outcome

Ship a usable web finance tracker that supports daily tracking, monthly budgeting, recurring entries, and export-ready reporting.

## 2) MVP Modules and Acceptance

## Auth

- Register, login, logout, current user endpoint
- Profile settings include timezone and currency

## Accounts

- Types: `cash`, `bank`, `ewallet`, `credit`, `savings`
- Opening balance and current balance tracked per account
- Archive support

## Categories

- Types: `income`, `expense`
- Optional parent category
- User-scoped ownership

## Transactions

- Types: `income`, `expense`, `transfer`
- Required fields: amount, account, type, transaction date
- Transfer creates paired records and maintains integrity link
- List page supports date/type/account/category filters

## Budgets

- Monthly budget per expense category
- Actual expense consumption and remaining amount
- Usage percentage for dashboard/report display

## Recurring Transactions

- Daily/weekly/monthly frequencies
- Scheduler generates due transactions with idempotency checks
- Next run date updates after generation

## Reports

- Income vs expense summary (date range)
- Spending by category
- Account balance snapshot
- Statement-style transaction export view

## Export

- CSV export for selected period and filters

## 3) Non-Functional Rules

- Multi-tenant separation by user ownership and policies
- Transaction date is reporting source (not created timestamp)
- Balance mutations must be atomic and server-validated
- Pagination for transaction listing

## 4) Sprint Plan

## Sprint 1

- Initialize Laravel + React
- Auth flows
- Settings (timezone/currency)
- Accounts + Categories CRUD

## Sprint 2

- Transactions CRUD
- Transfer service logic
- Transaction table filters
- Dashboard v1 widgets

## Sprint 3

- Budgets + budget progress APIs
- Recurring transaction setup
- Scheduler generation command + queue wiring

## Sprint 4

- Reports endpoints
- CSV export jobs
- Frontend report screens and charts

## Sprint 5

- Hardening: tests, auth policy coverage, performance indexes
- Deployment baseline and monitoring

## 5) Out of Scope for MVP

- AI assistants/categorization
- Debts module
- Savings goals
- PWA/offline sync
- Shared household collaboration
