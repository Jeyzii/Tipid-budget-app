# Database Schema (MVP)

## users

- id
- name
- email (unique)
- password
- timezone
- currency_code
- settings_json (nullable)
- timestamps

## accounts

- id
- user_id (fk -> users)
- name
- type: `cash|bank|ewallet|credit|savings`
- opening_balance (decimal)
- current_balance (decimal)
- is_archived (bool, default false)
- timestamps

Indexes:

- `(user_id, type)`
- `(user_id, is_archived)`

## categories

- id
- user_id (fk -> users)
- name
- type: `income|expense`
- parent_id (nullable fk -> categories)
- color (nullable)
- icon (nullable)
- timestamps

Indexes:

- `(user_id, type)`
- `(user_id, parent_id)`

## transactions

- id
- user_id (fk -> users)
- account_id (fk -> accounts)
- category_id (nullable fk -> categories)
- spending_bucket (nullable): `need|want|savings` for expenses; null for income/transfers or untagged expenses
- type: `income|expense|transfer`
- amount (decimal)
- description (nullable)
- transaction_date (date)
- reference_no (nullable)
- related_transfer_id (nullable fk -> transactions)
- created_by_source: `manual|recurring|import|ai`
- metadata_json (nullable)
- timestamps

Indexes:

- `(user_id, transaction_date)`
- `(user_id, account_id, transaction_date)`
- `(user_id, category_id, transaction_date)`
- `(user_id, type, transaction_date)`

## budgets

- id
- user_id (fk -> users)
- category_id (fk -> categories)
- month (tinyint)
- year (smallint)
- amount (decimal)
- timestamps

Constraint:

- unique `(user_id, category_id, month, year)`

## spending_plan_budgets

- id
- user_id (fk -> users)
- month (tinyint)
- year (smallint)
- needs_amount (decimal)
- wants_amount (decimal)
- savings_amount (decimal)
- timestamps

Constraint:

- unique `(user_id, month, year)`

## recurring_transactions

- id
- user_id (fk -> users)
- account_id (fk -> accounts)
- category_id (nullable fk -> categories)
- spending_bucket (nullable): `need|want|savings` when type is expense
- type: `income|expense`
- amount (decimal)
- description (nullable)
- frequency: `daily|weekly|monthly|custom`
- interval_value (int)
- start_date (date)
- end_date (nullable date)
- next_run_at (datetime)
- is_active (bool)
- timestamps

Indexes:

- `(user_id, is_active, next_run_at)`

## exports

- id
- user_id (fk -> users)
- type: `csv|json`
- file_path
- generated_at (datetime)
- timestamps
