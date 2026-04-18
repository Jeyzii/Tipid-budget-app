export type Account = {
  id: number
  name: string
  type: string
  current_balance: string
}

export type Category = {
  id: number
  name: string
  type: 'income' | 'expense'
}

export type SpendingBucket = 'need' | 'want' | 'savings'

export type Transaction = {
  id: number
  account_id: number
  category_id: number | null
  spending_bucket: SpendingBucket | null
  type: 'income' | 'expense' | 'transfer'
  amount: string
  description: string | null
  transaction_date: string
}
