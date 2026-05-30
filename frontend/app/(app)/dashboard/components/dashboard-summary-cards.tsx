import { formatCurrency, progressPercent } from '@/lib/formatters'

type DashboardSummaryCardsProps = {
  totalBalance: number
  savings: number
  currentIncome: number
  currentExpenses: number
  accountsCount: number
  pendingBreakdown: Array<{ categoryId: string; categoryName: string; total: number }>
}

export function DashboardSummaryCards({
  totalBalance,
  savings,
  currentIncome,
  currentExpenses,
  accountsCount,
  pendingBreakdown,
}: DashboardSummaryCardsProps) {
  const savingsProgress = progressPercent(savings, currentIncome)

  return (
    <section id="resumen" className="grid gap-4 md:grid-cols-3 md:gap-6">
      <article className="finance-card finance-card-interactive">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Balance total</p>
        <p className="finance-number mt-4 text-4xl font-semibold tracking-tight text-navy-950 md:text-5xl">{formatCurrency(totalBalance)}</p>
        <p className="mt-4 text-sm font-medium text-navy-700">Cuentas activas: {accountsCount}</p>
      </article>

      <article className="finance-card finance-card-interactive border-emerald-500/25 bg-emerald-50/80">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Ahorro mensual</p>
        <p className="finance-number mt-4 text-4xl font-semibold tracking-tight text-navy-950 md:text-5xl">{formatCurrency(savings)}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-emerald-700" style={{ width: `${savingsProgress}%` }} />
        </div>
        <p className="mt-3 text-sm font-medium text-navy-700">{savingsProgress}% de ingresos preservados</p>
      </article>

      <article className="finance-card finance-card-interactive">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Gastos fijos pendientes</p>
        <p className="finance-number mt-4 text-4xl font-semibold tracking-tight text-navy-950 md:text-5xl">{formatCurrency(currentExpenses)}</p>
        {pendingBreakdown.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">Sin gastos categorizados este mes.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {pendingBreakdown.map((item) => (
              <li key={item.categoryId} className="flex items-center justify-between gap-3 rounded-xl bg-navy-50 px-3 py-2">
                <span className="truncate font-medium text-navy-700">{item.categoryName}</span>
                <span className="finance-number font-semibold text-coral-700">{formatCurrency(item.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}
