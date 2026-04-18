/**
 * Empty string = same origin (use Vite `server.proxy` in dev, or host API + SPA together in prod).
 * Set VITE_API_BASE_URL only when the API is on another origin (e.g. API subdomain).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/** Same-origin in production; set VITE_API_BASE_URL only for a separate API host. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = apiUrl(path)
  let response: Response
  try {
    response = await fetch(url, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })
  } catch (error) {
    const hint =
      import.meta.env.DEV && API_BASE_URL !== ''
        ? ' Tip: clear VITE_API_BASE_URL to use the Vite proxy, or open the app at the same host as FRONTEND_URL in backend .env.'
        : ' Is the Laravel API running (e.g. php artisan serve)?'
    throw new Error(
      error instanceof TypeError
        ? `Network error (${url}).${hint}`
        : String(error),
    )
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const data = (await response.json()) as { message?: string }
      if (data?.message) {
        message = data.message
      }
    } catch {
      // Ignore JSON parse errors and keep default message.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
