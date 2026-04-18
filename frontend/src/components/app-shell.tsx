import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../features/auth/auth-context'

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-violet-600/20 text-violet-300' : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200',
  )

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition',
    isActive
      ? 'bg-violet-600/20 text-violet-300'
      : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200',
  )

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                <span className="text-lg font-semibold tracking-tight text-zinc-100">Tipid</span>
                {user?.email ? (
                  <span className="truncate text-xs text-zinc-500 sm:text-sm">{user.email}</span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:bg-zinc-800/80 hover:text-zinc-100 lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 6 18 18M6 18 18 6" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          <nav className="mt-3 hidden flex-wrap items-center gap-2 lg:flex">
            <NavLink to="/dashboard" className={desktopLinkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/accounts" className={desktopLinkClass}>
              Accounts
            </NavLink>
            <NavLink to="/categories" className={desktopLinkClass}>
              Categories
            </NavLink>
            <NavLink to="/transactions" className={desktopLinkClass}>
              Transactions
            </NavLink>
            <NavLink to="/budgets" className={desktopLinkClass}>
              Budgets
            </NavLink>
            <NavLink to="/spending-plan" className={desktopLinkClass}>
              Spending plan
            </NavLink>
            <NavLink to="/recurring" className={desktopLinkClass}>
              Recurring
            </NavLink>
            <NavLink to="/reports" className={desktopLinkClass}>
              Reports
            </NavLink>
            <NavLink to="/help" className={desktopLinkClass}>
              Guide
            </NavLink>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300"
            >
              Logout
            </button>
          </nav>

          {isMobileMenuOpen ? (
            <nav
              id="mobile-navigation"
              className="mt-3 flex flex-col gap-2 border-t border-zinc-800/80 pt-3 lg:hidden"
            >
              <NavLink to="/dashboard" className={mobileLinkClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/accounts" className={mobileLinkClass}>
                Accounts
              </NavLink>
              <NavLink to="/categories" className={mobileLinkClass}>
                Categories
              </NavLink>
              <NavLink to="/transactions" className={mobileLinkClass}>
                Transactions
              </NavLink>
              <NavLink to="/budgets" className={mobileLinkClass}>
                Budgets
              </NavLink>
              <NavLink to="/spending-plan" className={mobileLinkClass}>
                Spending plan
              </NavLink>
              <NavLink to="/recurring" className={mobileLinkClass}>
                Recurring
              </NavLink>
              <NavLink to="/reports" className={mobileLinkClass}>
                Reports
              </NavLink>
              <NavLink to="/help" className={mobileLinkClass}>
                Guide
              </NavLink>
              <button
                type="button"
                onClick={() => logout()}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-500 transition hover:bg-zinc-800/80 hover:text-zinc-300"
              >
                Logout
              </button>
            </nav>
          ) : null}
        </div>
      </header>
      <Outlet />
    </div>
  )
}
