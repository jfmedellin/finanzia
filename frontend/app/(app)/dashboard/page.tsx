import { getAccounts } from '@/lib/data/accounts'
import { getActiveCategories } from '@/lib/data/categories'
import { getRecentTransactions } from '@/lib/data/transactions'
import { computeDashboardMetrics } from '@/lib/dashboard/metrics'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, progressPercent } from '@/lib/formatters'
import { DashboardHero } from './components/dashboard-hero'
import { DashboardSummaryCards } from './components/dashboard-summary-cards'
import { CashFlowCard } from './components/cash-flow-card'
import { TopCategoriesChart } from './components/top-categories-chart'
import { RecentTransactionsList } from './components/recent-transactions-list'
import { CreateTransactionForm } from './components/create-transaction-form'
import { FinancialInsightCard } from './components/financial-insight-card'

export const dynamic = 'force-dynamic'

type DashboardPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  'invalid-amount-or-fields': 'Los datos de la transaccion no son validos.',
  'operation-failed': 'No se pudo guardar el movimiento. Intenta de nuevo.',
  'validation-validation_category_required': 'Selecciona una categoria para ingresos o gastos.',
  'validation-validation_category_inactive': 'La categoria seleccionada esta inactiva.',
  'validation-validation_category_type_mismatch': 'La categoria no corresponde al tipo de movimiento.',
  'validation-validation_transfer_same_account': 'La cuenta origen y destino no pueden ser la misma.',
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {}
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (!profile) {
    redirect('/onboarding')
  }

  const [accounts, categories, transactions] = await Promise.all([
    getAccounts(),
    getActiveCategories(),
    getRecentTransactions(),
  ])

  const metrics = computeDashboardMetrics(accounts, categories, transactions)
  const currentMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.happened_at)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })

  const successMessage = params.saved === '1' ? 'Movimiento guardado correctamente.' : null
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? 'Ocurrio un error al procesar el movimiento.') : null
  const latestTransaction = transactions[0]
  const expenseProgress = progressPercent(metrics.currentExpenses, metrics.currentIncome)
  const topCategories = metrics.categoryTotals.slice(0, 5)
  const pendingBreakdown = topCategories.slice(0, 3)
  const insightBody =
    transactions.length === 0
      ? 'Registra tus primeros movimientos para que FinanzaIA pueda leer patrones reales y anticipar riesgos del mes.'
      : metrics.savings >= 0
        ? `Tu mes mantiene un margen positivo de ${formatCurrency(metrics.savings)}. Los gastos consumen ${expenseProgress}% de tus ingresos actuales.`
        : `Tus gastos superan los ingresos por ${formatCurrency(Math.abs(metrics.savings))}. Revisa las categorias principales antes del siguiente pago fijo.`

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <DashboardHero
        insightBody={insightBody}
        currentMonthTransactionsCount={currentMonthTransactions.length}
      />

      <DashboardSummaryCards
        totalBalance={metrics.totalBalance}
        savings={metrics.savings}
        currentIncome={metrics.currentIncome}
        currentExpenses={metrics.currentExpenses}
        accountsCount={accounts.length}
        pendingBreakdown={pendingBreakdown}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CashFlowCard
            currentIncome={metrics.currentIncome}
            currentExpenses={metrics.currentExpenses}
            previousIncome={metrics.previousIncome}
            previousExpenses={metrics.previousExpenses}
          />

          <TopCategoriesChart topCategories={topCategories} />
        </div>

        <RecentTransactionsList transactions={transactions} />
      </section>

      <section className="grid gap-6 lg:grid-cols-12">
        <CreateTransactionForm
          accounts={accounts}
          categories={categories}
          successMessage={successMessage}
          errorMessage={errorMessage}
        />

        <FinancialInsightCard
          transactionsCount={transactions.length}
          currentMonthTransactionsCount={currentMonthTransactions.length}
          categoriesCount={categories.length}
          latestTransactionDescription={latestTransaction?.description}
        />
      </section>
    </div>
  )
}
