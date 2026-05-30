type FinancialInsightCardProps = {
  transactionsCount: number
  currentMonthTransactionsCount: number
  categoriesCount: number
  latestTransactionDescription: string | null | undefined
}

export function FinancialInsightCard({
  transactionsCount,
  currentMonthTransactionsCount,
  categoriesCount,
  latestTransactionDescription,
}: FinancialInsightCardProps) {
  return (
    <article className="finance-card ai-insight-card lg:col-span-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">IA financiera</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Lectura operativa</h2>
      {transactionsCount === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-navy-900/20 bg-white/60 p-5 text-sm leading-6 text-muted-foreground">
          Aun no hay movimientos. Registra tu primer gasto o ingreso para activar tendencias y comparativos.
        </div>
      ) : (
        <ul className="mt-4 space-y-3 text-sm">
          <li className="rounded-xl border border-white/80 bg-white/70 p-4 text-navy-700 shadow-card">Ultimo movimiento: {latestTransactionDescription}</li>
          <li className="rounded-xl border border-white/80 bg-white/70 p-4 text-navy-700 shadow-card">Movimientos este mes: <span className="finance-number font-semibold text-navy-950">{currentMonthTransactionsCount}</span></li>
          <li className="rounded-xl border border-white/80 bg-white/70 p-4 text-navy-700 shadow-card">Categorias activas: <span className="finance-number font-semibold text-navy-950">{categoriesCount}</span></li>
        </ul>
      )}
    </article>
  )
}
