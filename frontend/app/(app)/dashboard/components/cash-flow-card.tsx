import { formatCurrency, progressPercent } from '@/lib/formatters'

type CashFlowCardProps = {
  currentIncome: number
  currentExpenses: number
  previousIncome: number
  previousExpenses: number
}

export function CashFlowCard({ currentIncome, currentExpenses, previousIncome, previousExpenses }: CashFlowCardProps) {
  const expenseProgress = progressPercent(currentExpenses, currentIncome)
  const incomeProgress = progressPercent(currentIncome, Math.max(currentIncome, currentExpenses))

  return (
    <article className="finance-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Resumen de flujo de caja</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Flujo de caja del mes</h2>
        </div>
        <span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-semibold text-navy-700">Mes actual</span>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="text-navy-700">Ingresos</span>
            <span className="finance-number text-emerald-700">{formatCurrency(currentIncome)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-navy-50">
            <div className="h-full rounded-full bg-emerald-700" style={{ width: `${incomeProgress}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="text-navy-700">Gastos</span>
            <span className="finance-number text-coral-700">{formatCurrency(currentExpenses)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-navy-50">
            <div className="h-full rounded-full bg-coral-700" style={{ width: `${expenseProgress}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        {previousExpenses > 0 || previousIncome > 0
          ? `Mes anterior: ingresos ${formatCurrency(previousIncome)} · gastos ${formatCurrency(previousExpenses)}`
          : 'Registra movimientos de meses distintos para habilitar comparacion historica.'}
      </p>
    </article>
  )
}
