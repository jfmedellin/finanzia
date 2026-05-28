import { getAccounts } from '@/lib/data/accounts'
import { getTransactionsForReports } from '@/lib/data/reports'
import { comparePeriods, filterTransactions, summarizeTransactions } from '@/lib/reports/metrics'

type ReportsPageProps = {
  searchParams?: Promise<{ from?: string; to?: string; accountId?: string; type?: 'income' | 'expense' | 'transfer' }>
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = (await searchParams) ?? {}
  const now = new Date()
  const fromDefault = new Date(now.getFullYear(), now.getMonth(), 1)
  const toDefault = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const filters = {
    from: params.from ?? isoDate(fromDefault),
    to: params.to ?? isoDate(toDefault),
    accountId: params.accountId,
    type: params.type,
  }

  const [accounts, transactions] = await Promise.all([getAccounts(), getTransactionsForReports()])
  const filtered = filterTransactions(transactions, filters)
  const currentSummary = summarizeTransactions(filtered)

  const fromDate = new Date(filters.from)
  const toDate = new Date(filters.to)
  const rangeDays = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1)
  const previousTo = new Date(fromDate)
  previousTo.setDate(previousTo.getDate() - 1)
  const previousFrom = new Date(previousTo)
  previousFrom.setDate(previousFrom.getDate() - (rangeDays - 1))

  const previousFiltered = filterTransactions(transactions, {
    from: isoDate(previousFrom),
    to: isoDate(previousTo),
    accountId: filters.accountId,
    type: filters.type,
  })

  const previousSummary = summarizeTransactions(previousFiltered)
  const comparison = comparePeriods(currentSummary, previousSummary)

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-xl border bg-card p-4">
        <h1 className="text-xl font-semibold text-navy-900">Reportes financieros</h1>
        <p className="mt-1 text-sm text-muted-foreground">Filtra por período, cuenta o tipo para comparar resultados entre intervalos equivalentes.</p>

        <form className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm text-navy-700">
            <span>Desde</span>
            <input name="from" type="date" defaultValue={filters.from} className="w-full rounded-md border bg-background px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm text-navy-700">
            <span>Hasta</span>
            <input name="to" type="date" defaultValue={filters.to} className="w-full rounded-md border bg-background px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm text-navy-700">
            <span>Cuenta</span>
            <select name="accountId" defaultValue={filters.accountId ?? ''} className="w-full rounded-md border bg-background px-3 py-2">
              <option value="">Todas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm text-navy-700">
            <span>Tipo</span>
            <select name="type" defaultValue={filters.type ?? ''} className="w-full rounded-md border bg-background px-3 py-2">
              <option value="">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
              <option value="transfer">Transferencias</option>
            </select>
          </label>
          <button className="rounded-md bg-navy-900 px-3 py-2 font-medium text-white hover:bg-navy-700 md:col-span-4">Aplicar filtros</button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-5 shadow-sm md:col-span-4">
          <p className="text-sm text-muted-foreground">Ingresos del período</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900">{formatCurrency(currentSummary.income)}</p>
        </article>
        <article className="rounded-xl border bg-card p-5 shadow-sm md:col-span-4">
          <p className="text-sm text-muted-foreground">Gastos del período</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900">{formatCurrency(currentSummary.expense)}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm md:col-span-4">
          <p className="text-sm text-navy-700">Resultado neto</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900">{formatCurrency(currentSummary.net)}</p>
        </article>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold text-navy-900">Comparación con período anterior</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresos:{' '}
          {comparison.incomeDeltaPercent === null ? 'N/A' : `${comparison.incomeDeltaPercent > 0 ? '+' : ''}${comparison.incomeDeltaPercent.toFixed(1)}%`}
          {' · '}Gastos:{' '}
          {comparison.expenseDeltaPercent === null ? 'N/A' : `${comparison.expenseDeltaPercent > 0 ? '+' : ''}${comparison.expenseDeltaPercent.toFixed(1)}%`}
        </p>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold text-navy-900">Movimientos del período</h2>
        {filtered.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">No hay movimientos para el filtro seleccionado.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {filtered.map((tx) => (
              <li key={tx.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border px-3 py-2">
                <span>
                  <span className="font-medium text-navy-900">{tx.description ?? 'Sin descripción'}</span>
                  <span className="ml-2 text-muted-foreground">{tx.transaction_type} · {tx.happened_at}</span>
                </span>
                <span className="font-semibold text-navy-900">{formatCurrency(Number(tx.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
