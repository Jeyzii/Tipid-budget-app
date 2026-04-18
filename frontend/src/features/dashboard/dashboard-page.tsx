import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { apiFetch } from '../../lib/api'

type SummaryResponse = { data: { income: string; expense: string; net: string } }
type BalancesResponse = {
  data: Array<{ id: number; name: string; type: string; current_balance: string }>
}

export function DashboardPage() {
  const from = dayjs().startOf('month').format('YYYY-MM-DD')
  const to = dayjs().endOf('month').format('YYYY-MM-DD')

  const summaryQuery = useQuery({
    queryKey: ['reports-summary', from, to],
    queryFn: () =>
      apiFetch<SummaryResponse>(`/api/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  })

  const balancesQuery = useQuery({
    queryKey: ['account-balances'],
    queryFn: () => apiFetch<BalancesResponse>('/api/reports/account-balances'),
  })

  const s = summaryQuery.data?.data

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">This month ({dayjs().format('MMMM YYYY')})</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Income</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-400">
            {summaryQuery.isLoading ? '…' : s?.income ?? '0.00'}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Expenses</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-rose-400">
            {summaryQuery.isLoading ? '…' : s?.expense ?? '0.00'}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Net</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-100">
            {summaryQuery.isLoading ? '…' : s?.net ?? '0.00'}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-zinc-100">Account balances</h2>
        {balancesQuery.isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="mt-3 divide-y divide-zinc-800/80">
            {(balancesQuery.data?.data ?? []).map((a) => (
              <li key={a.id} className="flex justify-between py-2 text-sm">
                <span className="text-zinc-400">
                  {a.name}{' '}
                  <span className="text-zinc-600">({a.type})</span>
                </span>
                <span className="tabular-nums font-medium text-zinc-100">{a.current_balance}</span>
              </li>
            ))}
            {(balancesQuery.data?.data ?? []).length === 0 ? (
              <li className="py-2 text-sm text-zinc-500">
                No accounts yet.{' '}
                <Link to="/accounts" className="text-violet-400 hover:text-violet-300">
                  Create an account
                </Link>
                .
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          to="/transactions"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 hover:bg-violet-500"
        >
          Add transactions
        </Link>
        <Link
          to="/budgets"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80"
        >
          Manage budgets
        </Link>
        <Link
          to="/reports"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80"
        >
          View reports
        </Link>
      </section>
    </main>
  )
}
