import { apiFetch } from '../../lib/api'
import type { AuthUser } from './types'

type ApiEnvelope<T> = { data: T }

export async function fetchCsrfCookie() {
  await apiFetch<undefined>('/sanctum/csrf-cookie')
}

export async function fetchMe() {
  return apiFetch<AuthUser>('/api/me')
}

export async function login(payload: { email: string; password: string }) {
  await fetchCsrfCookie()
  return apiFetch<ApiEnvelope<AuthUser>>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function register(payload: {
  name: string
  email: string
  password: string
  password_confirmation: string
}) {
  await fetchCsrfCookie()
  return apiFetch<ApiEnvelope<AuthUser>>('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout() {
  return apiFetch<{ message: string }>('/api/logout', { method: 'POST' })
}
