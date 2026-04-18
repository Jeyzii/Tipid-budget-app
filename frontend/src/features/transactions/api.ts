import { apiFetch } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'
import type { Account, Category, SpendingBucket, Transaction } from './types'

type ListResponse<T> = {
  data: T[]
}

type TransactionFilters = {
  from?: string
  to?: string
  type?: string
  account_id?: string
  category_id?: string
}

export async function fetchAccounts() {
  return apiFetch<ListResponse<Account>>('/api/accounts')
}

export async function fetchCategories() {
  return apiFetch<ListResponse<Category>>('/api/categories')
}

export async function fetchTransactions(filters: TransactionFilters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  const query = params.toString()
  return apiFetch<ListResponse<Transaction>>(`/api/transactions${query ? `?${query}` : ''}`)
}

export async function createTransaction(payload: {
  account_id: number
  category_id: number | null
  type: 'income' | 'expense'
  amount: number
  description?: string
  transaction_date: string
  spending_bucket?: SpendingBucket | null
}) {
  await fetchCsrfCookie()

  const body: Record<string, unknown> = {
    account_id: payload.account_id,
    category_id: payload.category_id,
    type: payload.type,
    amount: payload.amount,
    transaction_date: payload.transaction_date,
  }
  if (payload.description !== undefined && payload.description !== '') {
    body.description = payload.description
  }
  if (payload.type === 'expense') {
    body.spending_bucket = payload.spending_bucket ?? null
  }

  return apiFetch<{ data: Transaction }>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
