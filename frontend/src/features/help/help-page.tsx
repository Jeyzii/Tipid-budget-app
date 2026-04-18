import { Link } from 'react-router-dom'

const steps = [
  {
    title: 'Set up your accounts',
    description:
      'Create the wallets, bank accounts, or cash balances you want to track so your dashboard starts from real balances.',
  },
  {
    title: 'Organize categories',
    description:
      'Add income and expense categories that match how you budget, such as salary, groceries, transport, bills, and savings.',
  },
  {
    title: 'Record transactions often',
    description:
      'Log income, expenses, and transfers regularly to keep your balances, reports, and budget progress accurate.',
  },
  {
    title: 'Create budgets and recurring entries',
    description:
      'Use budgets to cap spending and recurring rules for predictable transactions like rent, subscriptions, or paydays.',
  },
  {
    title: 'Review reports each month',
    description:
      'Check the dashboard and reports pages to compare your income, expenses, and account balances before planning the next month.',
  },
]

const terms = [
  'You are responsible for the accuracy of the financial data you enter into the app.',
  'This app is intended for personal budgeting and informational use only; it does not provide financial, legal, or tax advice.',
  'Keep your login credentials secure and sign out on shared devices to protect your account.',
  'Review transactions, budgets, and recurring rules regularly to avoid relying on outdated or incomplete information.',
  'Use reports and balances as budgeting aids, and confirm important financial decisions with your official bank or financial records.',
]

export function HelpPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">How to use Tipid</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Tipid helps you track accounts, categorize spending, plan budgets, and review reports. If you
          are just getting started, follow the steps below in order.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
              Step {index + 1}
            </p>
            <h2 className="mt-3 text-lg font-semibold text-zinc-100">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/accounts"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-900/30 hover:bg-violet-500"
          >
            Set up accounts
          </Link>
          <Link
            to="/transactions"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80"
          >
            Add transactions
          </Link>
          <Link
            to="/budgets"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/80"
          >
            Manage budgets
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-50">Terms & Conditions</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          By using this application, you agree to the following basic terms:
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
          {terms.map((term) => (
            <li key={term} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3">
              {term}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
