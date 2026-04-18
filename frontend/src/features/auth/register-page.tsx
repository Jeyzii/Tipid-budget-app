import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from './auth-context'

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Create account</h1>
          <p className="mt-1 text-sm text-zinc-500">Start tracking in a few seconds.</p>
        </div>
        <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
          Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/25"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/25"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/25"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-zinc-300">
          Confirm password
          <input
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-violet-500/80 focus:ring-2 focus:ring-violet-500/25"
          />
        </label>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:shadow-none"
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
