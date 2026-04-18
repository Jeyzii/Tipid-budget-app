import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { apiFetch } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'

type BudgetRow = {
  id: number
  category_id: number
  category: { id: number; name: string } | null
  month: number
  year: number
  amount: string
  spent: string
  remaining: string
  usage_percent: number | null
}

type BudgetsResponse = { data: BudgetRow[] }
type CategoriesResponse = { data: Array<{ id: number; name: string; type: string }> }

export function BudgetsPage() {
  const qc = useQueryClient()
  const [month, setMonth] = useState(() => dayjs().month() + 1)
  const [year, setYear] = useState(() => dayjs().year())
  const [error, setError] = useState<string | null>(null)

  const budgetsQuery = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () =>
      apiFetch<BudgetsResponse>(
        `/api/budgets?month=${month}&year=${year}`,
      ),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<CategoriesResponse>('/api/categories'),
  })

  const expenseCategories = useMemo(
    () => (categoriesQuery.data?.data ?? []).filter((c) => c.type === 'expense'),
    [categoriesQuery.data],
  )

  const createMut = useMutation({
    mutationFn: async (body: { category_id: number; month: number; year: number; amount: number }) => {
      await fetchCsrfCookie()
      return apiFetch<{ data: unknown }>('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setError(null)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to save budget'),
  })

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetchCsrfCookie()
      return apiFetch<undefined>(`/api/budgets/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMut.mutate({
      category_id: Number(fd.get('category_id')),
      month,
      year,
      amount: Number(fd.get('amount')),
    })
    e.currentTarget.reset()
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Budgets</h1>
        <p className="mt-1 text-sm text-zinc-500">Monthly limits per expense category (includes subcategory spend).</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
        <label className="text-sm text-zinc-400">
          Month
          <select
            value={month}
            onChange={(ev) => setMonth(Number(ev.target.value))}
            className="ml-2 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {dayjs().month(m - 1).format('MMMM')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-zinc-400">
          Year
          <input
            type="number"
            value={year}
            onChange={(ev) => setYear(Number(ev.target.value))}
            className="ml-2 w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
          />
        </label>
      </div>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Add budget</h2>
        <form onSubmit={onCreate} className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <select
            name="category_id"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            defaultValue=""
          >
            <option value="" disabled>
              Category
            </option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="Budget amount"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            Save
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Spent</th>
              <th className="px-4 py-3">Left</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {(budgetsQuery.data?.data ?? []).map((b) => (
              <tr key={b.id} className="border-b border-zinc-800/80">
                <td className="px-4 py-3">{b.category?.name ?? '—'}</td>
                <td className="px-4 py-3 tabular-nums">{b.amount}</td>
                <td className="px-4 py-3 tabular-nums text-rose-400">{b.spent}</td>
                <td className="px-4 py-3 tabular-nums text-emerald-400">{b.remaining}</td>
                <td className="px-4 py-3 tabular-nums">
                  {b.usage_percent != null ? `${b.usage_percent}%` : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => deleteMut.mutate(b.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!budgetsQuery.isLoading && (budgetsQuery.data?.data ?? []).length === 0 ? (
          <p className="p-4 text-sm text-zinc-500">No budgets for this month.</p>
        ) : null}
      </section>
    </main>
  )
}
