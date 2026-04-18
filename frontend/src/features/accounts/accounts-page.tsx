import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'

type Account = {
  id: number
  name: string
  type: string
  opening_balance: string
  current_balance: string
  is_archived: boolean
}

type ListResponse = { data: Account[] }

const types = ['cash', 'bank', 'ewallet', 'credit', 'savings'] as const

export function AccountsPage() {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiFetch<ListResponse>('/api/accounts'),
  })

  const createMut = useMutation({
    mutationFn: async (body: { name: string; type: string; opening_balance: number }) => {
      await fetchCsrfCookie()
      return apiFetch('/api/accounts', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      setError(null)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  })

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMut.mutate({
      name: String(fd.get('name')),
      type: String(fd.get('type')),
      opening_balance: Number(fd.get('opening_balance') || 0),
    })
    e.currentTarget.reset()
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Accounts</h1>
        <p className="mt-1 text-sm text-zinc-500">Cash, bank, e-wallet, credit, and savings.</p>
      </div>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Add account</h2>
        <form onSubmit={onCreate} className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <select name="type" required className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            name="opening_balance"
            type="number"
            step="0.01"
            defaultValue={0}
            placeholder="Opening balance"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <button
            type="submit"
            disabled={createMut.isPending}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/50">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/40 text-xs uppercase text-zinc-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody className="text-zinc-300">
            {(listQuery.data?.data ?? []).map((a) => (
              <tr key={a.id} className="border-b border-zinc-800/80">
                <td className="px-4 py-3">{a.name}</td>
                <td className="px-4 py-3 capitalize">{a.type}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-100">{a.current_balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
