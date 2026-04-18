import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '../components/app-shell'
import { LoginPage } from '../features/auth/login-page'
import { RegisterPage } from '../features/auth/register-page'
import { RequireAuth } from '../features/auth/require-auth'
import { AccountsPage } from '../features/accounts/accounts-page'
import { CategoriesPage } from '../features/categories/categories-page'
import { BudgetsPage } from '../features/budgets/budgets-page'
import { DashboardPage } from '../features/dashboard/dashboard-page'
import { RecurringPage } from '../features/recurring/recurring-page'
import { ReportsPage } from '../features/reports/reports-page'
import { SpendingPlanPage } from '../features/spending-plan/spending-plan-page'
import { TransactionsPage } from '../features/transactions/transactions-page'
import { HelpPage } from '../features/help/help-page'

const basename =
  import.meta.env.BASE_URL.replace(/\/$/, '') === ''
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        {
          element: <AppShell />,
          children: [
            { path: 'dashboard', element: <DashboardPage /> },
            { path: 'accounts', element: <AccountsPage /> },
            { path: 'categories', element: <CategoriesPage /> },
            { path: 'transactions', element: <TransactionsPage /> },
            { path: 'budgets', element: <BudgetsPage /> },
            { path: 'spending-plan', element: <SpendingPlanPage /> },
            { path: 'recurring', element: <RecurringPage /> },
            { path: 'reports', element: <ReportsPage /> },
            { path: 'help', element: <HelpPage /> },
          ],
        },
      ],
    },
  ],
  { basename },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
