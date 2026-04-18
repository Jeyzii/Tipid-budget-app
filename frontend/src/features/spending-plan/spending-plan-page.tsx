import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { apiFetch } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'

type SummaryResponse = { data: { income: string; expense: string; net: string } }

type BucketProgress = {
  key: string
  label: string
  budget: string
  spent: string
  remaining: string
  usage_percent: number | null
}

type SpendingPlanResponse = {
  data: {
    month: number
    year: number
    needs_amount: string
    wants_amount: string
    savings_amount: string
    buckets: BucketProgress[]
    unassigned_spent: string
  }
}

export function SpendingPlanPage() {
  const qc = useQueryClient()
  const [month, setMonth] = useState(() => dayjs().month() + 1)
  const [year, setYear] = useState(() => dayjs().year())
  const [needsAmt, setNeedsAmt] = useState('0.00')
  const [wantsAmt, setWantsAmt] = useState('0.00')
  const [savingsAmt, setSavingsAmt] = useState('0.00')
  const [error, setError] = useState<string | null>(null)
  const [suggestMsg, setSuggestMsg] = useState<string | null>(null)

  const planQuery = useQuery({
    queryKey: ['spending-plan', month, year],
    queryFn: () =>
      apiFetch<SpendingPlanResponse>(`/api/spending-plan?month=${month}&year=${year}`),
  })

  useEffect(() => {
    const p = planQuery.data?.data
    if (!p) return
    setNeedsAmt(p.needs_amount)
    setWantsAmt(p.wants_amount)
    setSavingsAmt(p.savings_amount)
  }, [planQuery.data])

  const saveMut = useMutation({
    mutationFn: async (body: {
      month: number
      year: number
      needs_amount: number
      wants_amount: number
      savings_amount: number
    }) => {
      await fetchCsrfCookie()
      return apiFetch<SpendingPlanResponse>('/api/spending-plan', {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spending-plan', month, year] })
      setError(null)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed to save'),
  })

  async function onSuggestFromIncome() {
    setSuggestMsg(null)
    const from = dayjs()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .format('YYYY-MM-DD')
    const to = dayjs()
      .year(year)
      .month(month - 1)
      .endOf('month')
      .format('YYYY-MM-DD')
    try {
      const res = await apiFetch<SummaryResponse>(
        `/api/reports/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      )
      const income = Number.parseFloat(res.data.income)
      if (!Number.isFinite(income) || income <= 0) {
        setSuggestMsg('No income logged for this month yet — log income first, or enter caps manually.')
        return
      }
      setNeedsAmt((income * 0.5).toFixed(2))
      setWantsAmt((income * 0.3).toFixed(2))
      setSavingsAmt((income * 0.2).toFixed(2))
      setSuggestMsg('Filled from 50/30/20 of income logged this month. Adjust if needed, then save.')
    } catch {
      setSuggestMsg('Could not load income summary.')
    }
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault()
    saveMut.mutate({
      month,
      year,
      needs_amount: Number(needsAmt),
      wants_amount: Number(wantsAmt),
      savings_amount: Number(savingsAmt),
    })
  }

  const plan = planQuery.data?.data
  const fieldClass =
    'box-border h-11 w-full min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-0 text-sm text-zinc-100 outline-none transition focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/25'

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Spending plan (50/30/20)</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tag expenses as Needs, Wants, or Savings on the Transactions page, set monthly caps here, and track progress.
        </p>
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
            min={2000}
            max={2100}
            onChange={(ev) => setYear(Number(ev.target.value))}
            className="ml-2 w-24 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-zinc-100"
          />
        </label>
      </div>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-zinc-100">Monthly caps</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Suggestion uses income already logged in the selected month (not a forecast).
        </p>
        <form onSubmit={onSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-sm text-zinc-400">
              Needs (50%)
              <input
                type="number"
                step="0.01"
                min={0}
                value={needsAmt}
                onChange={(ev) => setNeedsAmt(ev.target.value)}
                className={`${fieldClass} mt-1`}
                required
              />
            </label>
            <label className="block text-sm text-zinc-400">
              Wants (30%)
              <input
                type="number"
                step="0.01"
                min={0}
                value={wantsAmt}
                onChange={(ev) => setWantsAmt(ev.target.value)}
                className={`${fieldClass} mt-1`}
                required
              />
            </label>
            <label className="block text-sm text-zinc-400">
              Savings (20%)
              <input
                type="number"
                step="0.01"
                min={0}
                value={savingsAmt}
                onChange={(ev) => setSavingsAmt(ev.target.value)}
                className={`${fieldClass} mt-1`}
                required
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onSuggestFromIncome()}
              className="rounded-lg border border-zinc-600 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              Suggest from 50/30/20 of income
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
            >
              {saveMut.isPending ? 'Saving…' : 'Save caps'}
            </button>
          </div>
        </form>
        {suggestMsg ? <p className="mt-3 text-sm text-zinc-400">{suggestMsg}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-zinc-100">Progress</h2>
        {planQuery.isLoading ? (
          <p className="mt-2 text-sm text-zinc-500">Loading…</p>
        ) : plan ? (
          <div className="mt-4 space-y-5">
            {plan.buckets.map((b) => {
              const pct = b.usage_percent != null ? Math.min(100, b.usage_percent) : 0
              return (
                <div key={b.key}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-zinc-200">{b.label}</span>
                    <span className="tabular-nums text-zinc-400">
                      {b.spent} / {b.budget}
                      {b.usage_percent != null ? ` (${b.usage_percent}%)` : ''}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Remaining: {b.remaining}</p>
                </div>
              )
            })}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
              <p className="text-sm text-amber-200/90">
                Unassigned expenses (no Needs/Wants/Savings tag):{' '}
                <span className="font-medium tabular-nums">{plan.unassigned_spent}</span>
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
