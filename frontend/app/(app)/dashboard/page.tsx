import { createTransactionAction } from '@/lib/actions/finance'
import { getAccounts } from '@/lib/data/accounts'
import { getActiveCategories } from '@/lib/data/categories'
import { getRecentTransactions } from '@/lib/data/transactions'
import { computeDashboardMetrics } from '@/lib/dashboard/metrics'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' }).format(new Date(value))
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

  return (
    <div className="space-y-6 md:space-y-8">
      <section id="resumen" className="grid gap-4 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-5 shadow-sm md:col-span-4">
          <p className="text-sm text-muted-foreground">Balance total</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900 md:text-3xl">{formatCurrency(metrics.totalBalance)}</p>
          <p className="mt-2 text-xs text-muted-foreground">Cuentas activas: {accounts.length}</p>
        </article>

        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm md:col-span-4">
          <p className="text-sm text-navy-700">Ahorro del mes</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900 md:text-3xl">{formatCurrency(metrics.savings)}</p>
          <p className="mt-2 text-xs text-navy-700">
            Ingresos {formatCurrency(metrics.currentIncome)} · Gastos {formatCurrency(metrics.currentExpenses)}
          </p>
        </article>

        <article className="glass-surface rounded-xl border p-5 shadow-sm md:col-span-4">
          <p className="text-sm text-muted-foreground">Comparativo mensual</p>
          <p className="mt-2 text-lg font-semibold text-navy-900">
            {metrics.expenseDeltaPercent === null && metrics.incomeDeltaPercent === null
              ? 'Sin base comparativa'
              : `Ingresos ${
                  metrics.incomeDeltaPercent === null
                    ? 'N/A'
                    : `${metrics.incomeDeltaPercent > 0 ? '+' : ''}${metrics.incomeDeltaPercent.toFixed(1)}%`
                } · Gastos ${
                  metrics.expenseDeltaPercent === null
                    ? 'N/A'
                    : `${metrics.expenseDeltaPercent > 0 ? '+' : ''}${metrics.expenseDeltaPercent.toFixed(1)}%`
                }`}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {metrics.previousExpenses > 0 || metrics.previousIncome > 0
              ? `Mes anterior: ingresos ${formatCurrency(metrics.previousIncome)} · gastos ${formatCurrency(metrics.previousExpenses)}`
              : 'Registra movimientos de meses distintos para habilitar comparacion.'}
          </p>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-4 md:col-span-7">
          <h1 className="text-xl font-semibold text-navy-900">Registrar movimiento</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sigue el flujo guiado para mantener tus metricas correctas.</p>

          <div aria-live="polite" aria-atomic="true" className="mt-3 space-y-2">
            {successMessage ? (
              <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-navy-900">{successMessage}</p>
            ) : null}
            {errorMessage ? (
              <p
                id="dashboard-form-error"
                role="alert"
                className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                aria-label="Error de validacion"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <form action={createTransactionAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-navy-700">
              <span>Tipo</span>
              <select
                name="type"
                className="w-full rounded-md border bg-background px-3 py-2"
                defaultValue="expense"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
                <option value="transfer">Transferencia</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Monto</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="w-full rounded-md border bg-background px-3 py-2"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              />
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Cuenta origen</span>
              <select
                name="accountId"
                required
                className="w-full rounded-md border bg-background px-3 py-2"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              >
                <option value="">Selecciona</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Cuenta destino (transferencia)</span>
              <select
                name="toAccountId"
                className="w-full rounded-md border bg-background px-3 py-2"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              >
                <option value="">Opcional</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Categoria</span>
              <select
                name="categoryId"
                className="w-full rounded-md border bg-background px-3 py-2"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              >
                <option value="">Selecciona</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.category_type})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Fecha</span>
              <input
                name="happenedAt"
                type="date"
                required
                className="w-full rounded-md border bg-background px-3 py-2"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              />
            </label>

            <label className="space-y-1 text-sm text-navy-700 md:col-span-2">
              <span>Descripcion</span>
              <input
                name="description"
                type="text"
                required
                placeholder="Ej. Mercado semanal"
                className="w-full rounded-md border bg-background px-3 py-2"
                aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
              />
            </label>

            <button className="rounded-md bg-navy-900 px-3 py-2 font-medium text-white hover:bg-navy-700 md:col-span-2">Guardar movimiento</button>
          </form>
        </article>

        <article className="rounded-xl border bg-card p-4 md:col-span-5">
          <h2 className="text-lg font-semibold text-navy-900">Insight rapido</h2>
          {transactions.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Aun no hay movimientos. Registra tu primer gasto o ingreso para activar tendencias y comparativos.
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-lg bg-muted p-3 text-navy-700">Ultimo movimiento: {transactions[0]?.description}</li>
              <li className="rounded-lg bg-muted p-3 text-navy-700">Movimientos este mes: {currentMonthTransactions.length}</li>
              <li className="rounded-lg bg-muted p-3 text-navy-700">Categorias activas: {categories.length}</li>
            </ul>
          )}
        </article>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold text-navy-900">Totales por categoria (mes actual)</h2>
        {metrics.categoryTotals.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
            Sin totales por categoria en el periodo actual.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {metrics.categoryTotals.slice(0, 5).map((item) => (
              <li key={item.categoryId} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border px-3 py-2">
                <span className="font-medium text-navy-900">{item.categoryName}</span>
                <span className="font-semibold text-navy-900">{formatCurrency(item.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="movimientos" className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-semibold text-navy-900">Movimientos recientes</h2>
        {transactions.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">
            Sin movimientos recientes. Cuando registres operaciones apareceran aqui con su tipo y monto.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {transactions.map((tx) => (
              <li key={tx.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border px-3 py-2">
                <span>
                  <span className="font-medium text-navy-900">{tx.description}</span>
                  <span className="ml-2 text-muted-foreground">{tx.transaction_type} · {formatDate(tx.happened_at)}</span>
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
