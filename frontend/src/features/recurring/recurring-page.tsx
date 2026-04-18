import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { apiFetch } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'

type Recurring = {
  id: number
  account_id: number
  category_id: number | null
  spending_bucket: string | null
  type: string
  amount: string
  description: string | null
  frequency: string
  interval_value: number
  start_date: string
  end_date: string | null
  next_run_at: string
  is_active: boolean
  account?: { id: number; name: string }
}

type ListResponse = { data: Recurring[] }
type AccountsResponse = { data: Array<{ id: number; name: string }> }
type CategoriesResponse = { data: Array<{ id: number; name: string; type: string }> }

function planLabel(bucket: string | null, type: string) {
  if (type !== 'expense') return '—'
  if (bucket === 'need') return 'Needs'
  if (bucket === 'want') return 'Wants'
  if (bucket === 'savings') return 'Savings'
  return '—'
}

export function RecurringPage() {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [createType, setCreateType] = useState<'income' | 'expense'>('expense')

  const listQuery = useQuery({
    queryKey: ['recurring'],
    queryFn: () => apiFetch<ListResponse>('/api/recurring-transactions'),
  })

  const accountsQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiFetch<AccountsResponse>('/api/accounts'),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<CategoriesResponse>('/api/categories'),
  })

  const createMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      await fetchCsrfCookie()
      return apiFetch('/api/recurring-transactions', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      setError(null)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetchCsrfCookie()
      return apiFetch<undefined>(`/api/recurring-transactions/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const type = String(fd.get('type'))
    const bucketRaw = fd.get('spending_bucket')
    const spending_bucket =
      type === 'expense' && bucketRaw && String(bucketRaw) !== ''
        ? String(bucketRaw)
        : null

    const body: Record<string, unknown> = {
      account_id: Number(fd.get('account_id')),
      category_id: fd.get('category_id') ? Number(fd.get('category_id')) : null,
      type,
      amount: Number(fd.get('amount')),
      description: fd.get('description') || null,
      frequency: fd.get('frequency'),
      interval_value: Number(fd.get('interval_value') || 1),
      start_date: fd.get('start_date'),
      end_date: fd.get('end_date') || null,
      is_active: true,
    }
    if (type === 'expense') {
      body.spending_bucket = spending_bucket
    }

    createMut.mutate(body)
    e.currentTarget.reset()
    setCreateType('expense')
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Recurring</h1>
        <p className="mt-1 text-sm text-zinc-500">Automated income/expense entries. Scheduler runs daily (server).</p>
      </div>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">New rule</h2>
        <form onSubmit={onCreate} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            name="type"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            value={createType}
            onChange={(ev) => setCreateType(ev.target.value as 'income' | 'expense')}
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
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <select name="account_id" required className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" defaultValue="">
            <option value="" disabled>
              Account
            </option>
            {(accountsQuery.data?.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select name="category_id" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" defaultValue="">
            <option value="">No category</option>
            {(categoriesQuery.data?.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {createType === 'expense' ? (
            <select
              name="spending_bucket"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              defaultValue=""
            >
              <option value="">50/30/20: unassigned</option>
              <option value="need">Needs</option>
              <option value="want">Wants</option>
              <option value="savings">Savings</option>
            </select>
          ) : null}
          <select name="frequency" required className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom (monthly step)</option>
          </select>
          <input
            name="interval_value"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Every N periods"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <input
            name="start_date"
            type="date"
            required
            defaultValue={dayjs().format('YYYY-MM-DD')}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <input name="end_date" type="date" className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" />
          <input
            name="description"
            placeholder="Description"
            className="md:col-span-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <button
            type="submit"
            disabled={createMut.isPending}
            className="md:col-span-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            Create rule
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs uppercase text-zinc-500">
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Frequency</th>
              <th className="px-4 py-3">Next</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {(listQuery.data?.data ?? []).map((r) => (
              <tr key={r.id} className="border-b border-zinc-800/80">
                <td className="px-4 py-3">{r.account?.name ?? r.account_id}</td>
                <td className="px-4 py-3 capitalize">{r.type}</td>
                <td className="px-4 py-3 text-zinc-500">{planLabel(r.spending_bucket, r.type)}</td>
                <td className="px-4 py-3 tabular-nums">{r.amount}</td>
                <td className="px-4 py-3">
                  {r.frequency} ×{r.interval_value}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {dayjs(r.next_run_at).format('YYYY-MM-DD HH:mm')}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => deleteMut.mutate(r.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
