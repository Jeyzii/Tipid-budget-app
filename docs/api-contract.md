# API Contract (MVP Draft)

Base path: `/api`

Auth: Sanctum SPA session

## Auth

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /me`

## Accounts

- `GET /accounts`
- `POST /accounts`
- `PUT /accounts/{id}`
- `DELETE /accounts/{id}`

## Categories

- `GET /categories`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

## Transactions

- `GET /transactions`
- `POST /transactions`
- `GET /transactions/{id}`
- `PUT /transactions/{id}`
- `DELETE /transactions/{id}`
- `POST /transactions/transfer`

Transaction resources may include `spending_bucket`: `need` | `want` | `savings` | `null` (expenses only; must be null for income and transfers).

Query examples:

- `/transactions?from=2026-04-01&to=2026-04-30`
- `/transactions?account_id=1&type=expense`
- `/transactions?category_id=4&search=coffee`

## Budgets

- `GET /budgets?month=4&year=2026`
- `POST /budgets`
- `PUT /budgets/{id}`
- `DELETE /budgets/{id}`

## Spending plan (50/30/20 caps)

- `GET /spending-plan?month=4&year=2026` — monthly caps and per-bucket spend progress, plus `unassigned_spent`
- `PUT /spending-plan` — body: `month`, `year`, `needs_amount`, `wants_amount`, `savings_amount` (numeric, ≥ 0); upserts caps for that month

## Recurring

- `GET /recurring-transactions`
- `POST /recurring-transactions`
- `PUT /recurring-transactions/{id}`
- `DELETE /recurring-transactions/{id}`
- `GET /recurring-transactions/preview-upcoming`

## Reports

- `GET /reports/summary?from=2026-04-01&to=2026-04-30`
- `GET /reports/category-breakdown?from=...&to=...`
- `GET /reports/account-balances`
- `GET /reports/statement?from=...&to=...&account_id=...`

## Exports

- `POST /exports/csv` (includes `spending_bucket` column when present)
- `POST /exports/json`

## Response Shape Guideline

Prefer stable envelope:

```json
{
  "data": {},
  "meta": {},
  "message": "optional"
}
```

Validation errors use Laravel default `422` JSON format (or customized standard consistently).
