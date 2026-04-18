import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import { fetchCsrfCookie } from '../auth/api'

type Category = {
  id: number
  name: string
  type: string
}

type ListResponse = { data: Category[] }

export function CategoriesPage() {
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<ListResponse>('/api/categories'),
  })

  const createMut = useMutation({
    mutationFn: async (body: { name: string; type: string }) => {
      await fetchCsrfCookie()
      return apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(body) })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
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
    })
    e.currentTarget.reset()
  }

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Categories</h1>
        <p className="mt-1 text-sm text-zinc-500">Income and expense labels for transactions and budgets.</p>
      </div>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Add category</h2>
        <form onSubmit={onCreate} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <select name="type" required className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
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

      <div className="grid gap-4 md:grid-cols-2">
        {(['expense', 'income'] as const).map((kind) => (
          <section key={kind} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{kind}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-300">
              {(listQuery.data?.data ?? [])
                .filter((c) => c.type === kind)
                .map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
