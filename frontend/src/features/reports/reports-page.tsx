import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { apiFetch, apiUrl } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'

type Summary = { data: { income: string; expense: string; net: string } }
type Breakdown = { data: Array<{ category_id: number | null; category_name: string; total: string }> }

export function ReportsPage() {
  const [from, setFrom] = useState(() => dayjs().startOf('month').format('YYYY-MM-DD'))
  const [to, setTo] = useState(() => dayjs().endOf('month').format('YYYY-MM-DD'))

  const qs = useMemo(() => {
    const p = new URLSearchParams({ from, to })
    return p.toString()
  }, [from, to])

  const summaryQuery = useQuery({
    queryKey: ['reports-summary', from, to],
    queryFn: () => apiFetch<Summary>(`/api/reports/summary?${qs}`),
  })

  const breakdownQuery = useQuery({
    queryKey: ['reports-breakdown', from, to],
    queryFn: () => apiFetch<Breakdown>(`/api/reports/category-breakdown?${qs}`),
  })

  async function downloadCsv() {
    await fetchCsrfCookie()
    const res = await fetch(apiUrl('/api/exports/csv'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/csv' },
      body: JSON.stringify({ from, to }),
    })
    if (!res.ok) {
      alert('Export failed')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${from}-to-${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadJson() {
    await fetchCsrfCookie()
    const data = await apiFetch<{ data: unknown[] }>('/api/exports/json', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    })
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${from}-to-${to}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const s = summaryQuery.data?.data

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Reports & export</h1>
        <p className="mt-1 text-sm text-zinc-500">Summaries for any date range, plus CSV/JSON export.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
        <label className="text-sm text-zinc-400">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="ml-2 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
          />
        </label>
        <label className="text-sm text-zinc-400">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="ml-2 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadCsv()}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => downloadJson()}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/80"
          >
            Download JSON
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <p className="text-xs uppercase text-zinc-500">Income</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">{s?.income ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <p className="text-xs uppercase text-zinc-500">Expense</p>
          <p className="mt-1 text-xl font-semibold text-rose-400">{s?.expense ?? '—'}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
          <p className="text-xs uppercase text-zinc-500">Net</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{s?.net ?? '—'}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Spending by category</h2>
        <ul className="mt-3 divide-y divide-zinc-800/80">
          {(breakdownQuery.data?.data ?? []).map((row) => (
            <li key={`${row.category_id ?? 'none'}-${row.category_name}`} className="flex justify-between py-2 text-sm">
              <span className="text-zinc-400">{row.category_name}</span>
              <span className="tabular-nums text-zinc-100">{row.total}</span>
            </li>
          ))}
        </ul>
        {!breakdownQuery.isLoading && (breakdownQuery.data?.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No expense data in this range.</p>
        ) : null}
      </section>
    </main>
  )
}
