import { Link } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { createTransaction, fetchAccounts, fetchCategories, fetchTransactions } from './api'

function blockManualDateEntry(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Tab' || event.key === 'Escape') return
  if (event.key.startsWith('Arrow')) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    event.currentTarget.showPicker?.()
    return
  }
  if (
    event.key.length === 1 ||
    event.key === 'Backspace' ||
    event.key === 'Delete' ||
    event.key === 'Home' ||
    event.key === 'End'
  ) {
    event.preventDefault()
  }
}

export function TransactionsPage() {
  const queryClient = useQueryClient()
  const transactionDateRef = useRef<HTMLInputElement>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [type, setType] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [addType, setAddType] = useState<'income' | 'expense'>('expense')
  const [error, setError] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      from,
      to,
      type,
      account_id: accountId,
      category_id: categoryId,
    }),
    [accountId, categoryId, from, to, type],
  )

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  })

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['spending-plan'] })
      setError(null)
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to create transaction.')
    },
  })

  function handleCreateTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    const type = String(form.get('type')) as 'income' | 'expense'
    const bucketRaw = form.get('spending_bucket')
    const spending_bucket =
      type === 'expense' && bucketRaw && String(bucketRaw) !== ''
        ? (String(bucketRaw) as 'need' | 'want' | 'savings')
        : null

    createMutation.mutate({
      account_id: Number(form.get('account_id')),
      category_id: form.get('category_id') ? Number(form.get('category_id')) : null,
      type,
      amount: Number(form.get('amount')),
      description: String(form.get('description') || ''),
      transaction_date: String(form.get('transaction_date')),
      spending_bucket,
    })
    event.currentTarget.reset()
    setAddType('expense')
  }

  const fieldClass =
    'box-border h-11 w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-0 text-sm text-zinc-100 outline-none transition focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/25 [&::-webkit-calendar-picker-indicator]:invert'

  const dateFieldShellClass =
    'flex h-11 w-full min-w-0 overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950/80 transition focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/25'

  const dateFieldInputClass =
    'h-full min-w-0 flex-1 cursor-pointer border-0 bg-transparent px-3 py-0 text-sm text-zinc-100 outline-none [&::-webkit-calendar-picker-indicator]:invert'

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <header className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Transactions</h1>
        <p className="mt-1 text-sm text-zinc-500">Track and filter income and expense entries.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex text-sm font-medium text-violet-400 transition hover:text-violet-300"
        >
          ← Back to dashboard
        </Link>
      </header>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">Add transaction</h2>
        <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            name="type"
            required
            className={fieldClass}
            value={addType}
            onChange={(e) => setAddType(e.target.value as 'income' | 'expense')}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Amount"
            required
            className={`${fieldClass} placeholder:text-zinc-600`}
          />
          <div className="min-w-0">
            <label htmlFor="transaction_date" className="sr-only">
              Transaction date
            </label>
            <div className={dateFieldShellClass}>
              <input
                ref={transactionDateRef}
                id="transaction_date"
                name="transaction_date"
                type="date"
                required
                defaultValue={dayjs().format('YYYY-MM-DD')}
                title="Click to open calendar"
                onClick={(e) => e.currentTarget.showPicker?.()}
                onPaste={(e) => e.preventDefault()}
                onKeyDown={blockManualDateEntry}
                className={dateFieldInputClass}
              />
              <button
                type="button"
                title="Open calendar"
                className="flex h-full shrink-0 items-center justify-center border-l border-zinc-700/80 bg-transparent px-3 text-zinc-400 outline-none transition hover:bg-zinc-900/50 hover:text-violet-300 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:ring-inset"
                onClick={() => transactionDateRef.current?.showPicker?.()}
              >
                <span className="sr-only">Open calendar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            </div>
          </div>
          <select name="account_id" required className={fieldClass} defaultValue="">
            <option value="" disabled>
              Select account
            </option>
            {(accountsQuery.data?.data ?? []).map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <select name="category_id" className={fieldClass} defaultValue="">
            <option value="">No category</option>
            {(categoriesQuery.data?.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {addType === 'expense' ? (
            <select name="spending_bucket" className={fieldClass} defaultValue="">
              <option value="">50/30/20: unassigned</option>
              <option value="need">Needs</option>
              <option value="want">Wants</option>
              <option value="savings">Savings</option>
            </select>
          ) : (
            <div className="hidden min-h-[2.75rem] md:block" aria-hidden />
          )}
          <input
            name="description"
            type="text"
            placeholder="Description (optional)"
            className={`${fieldClass} placeholder:text-zinc-600`}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="md:col-span-3 box-border h-11 w-full rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:shadow-none"
          >
            {createMutation.isPending ? 'Saving...' : 'Save transaction'}
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">Filters</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={fieldClass}
          />
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className={fieldClass}
          />
          <select value={type} onChange={(event) => setType(event.target.value)} className={fieldClass}>
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            className={fieldClass}
          >
            <option value="">All accounts</option>
            {(accountsQuery.data?.data ?? []).map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={fieldClass}
          >
            <option value="">All categories</option>
            {(categoriesQuery.data?.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">Results</h2>
        {transactionsQuery.isLoading ? (
          <p className="text-sm text-zinc-500">Loading transactions…</p>
        ) : null}
        <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {(transactionsQuery.data?.data ?? []).map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-zinc-800/80 transition hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 tabular-nums text-zinc-200">{transaction.transaction_date}</td>
                  <td className="px-4 py-3 capitalize">{transaction.type}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {transaction.type === 'expense'
                      ? transaction.spending_bucket === 'need'
                        ? 'Needs'
                        : transaction.spending_bucket === 'want'
                          ? 'Wants'
                          : transaction.spending_bucket === 'savings'
                            ? 'Savings'
                            : '—'
                      : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium text-zinc-100">{transaction.amount}</td>
                  <td className="px-4 py-3 text-zinc-400">{transaction.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
