import { createFixedExpenseAction } from '@/lib/actions/fixed-expenses'
import { getAccounts } from '@/lib/data/accounts'
import { getActiveCategories } from '@/lib/data/categories'
import { getFixedExpenses } from '@/lib/data/fixed-expenses'
import { formatCurrency } from '@/lib/formatters'
import Link from 'next/link'

type FixedExpensesPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string }>
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Vencido',
}

const RECURRENCE_LABELS: Record<string, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'border-emerald-500/30 bg-emerald-50 text-emerald-700',
  pending: 'border-navy-900/15 bg-navy-50 text-navy-700',
  overdue: 'border-coral-500/30 bg-coral-50 text-coral-700',
}

const STATUS_DOT_STYLES: Record<string, string> = {
  paid: 'bg-emerald-700',
  pending: 'bg-navy-700',
  overdue: 'bg-coral-700',
}

export default async function FixedExpensesPage({ searchParams }: FixedExpensesPageProps) {
  const params = (await searchParams) ?? {}
  const [accounts, categories, fixedExpenses] = await Promise.all([getAccounts(), getActiveCategories(), getFixedExpenses()])
  const expenseCategories = categories.filter((category) => category.category_type === 'expense')
  const hasExpenseCategories = expenseCategories.length > 0

  const successMessage = params.saved === '1' ? 'Gasto fijo guardado correctamente.' : null
  const errorMessage = params.error ? 'No se pudo guardar. Revisa los campos e intenta de nuevo.' : null
  const monthlyCommitment = fixedExpenses.filter((item) => item.recurrence === 'monthly').reduce((acc, item) => acc + Number(item.amount), 0)
  const totalCommitment = fixedExpenses.reduce((acc, item) => acc + Number(item.amount), 0)
  const pendingCount = fixedExpenses.filter((item) => item.status === 'pending').length
  const overdueCount = fixedExpenses.filter((item) => item.status === 'overdue').length
  const nextExpense = fixedExpenses.find((item) => item.status === 'pending' || item.status === 'overdue') ?? fixedExpenses[0]
  const accountNames = new Map(accounts.map((account) => [account.id, account.name]))
  const categoryNames = new Map(expenseCategories.map((category) => [category.id, category.name]))
  const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Presupuesto</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy-950 md:text-5xl">Gastos fijos</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
            Gestiona pagos recurrentes, vencimientos y obligaciones mensuales sin perder visibilidad del flujo de caja.
          </p>
        </div>
        <a
          href="#new-fixed-expense"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-cardHover"
        >
          Agregar gasto fijo
        </a>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <article className="finance-card">
            <p className="text-sm font-medium text-muted-foreground">Compromiso mensual</p>
            <p className="finance-number mt-3 text-4xl font-semibold tracking-tight text-navy-950">{formatCurrency(monthlyCommitment)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Calculado con los gastos marcados como frecuencia mensual.</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-navy-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total</p>
                <p className="finance-number mt-2 text-2xl font-semibold text-navy-950">{fixedExpenses.length}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Pendientes</p>
                <p className="finance-number mt-2 text-2xl font-semibold text-navy-950">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-coral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-700">Vencidos</p>
                <p className="finance-number mt-2 text-2xl font-semibold text-coral-700">{overdueCount}</p>
              </div>
              <div className="rounded-2xl bg-navy-950 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Todos los ciclos</p>
                <p className="finance-number mt-2 text-xl font-semibold">{formatCurrency(totalCommitment)}</p>
              </div>
            </div>
          </article>

          <article className="finance-card ai-insight-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Analisis IA</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy-950">Prioriza compromisos antes de registrar gasto variable</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Los gastos fijos definen el piso de salida mensual. Mantener estados al dia mejora el calculo de liquidez disponible.
            </p>
            <div className="mt-5 rounded-xl border border-white/80 bg-white/70 p-4 shadow-card">
              <p className="text-sm font-medium text-muted-foreground">Siguiente foco</p>
              <p className="mt-2 font-semibold text-navy-950">{nextExpense ? `${nextExpense.name} · dia ${nextExpense.due_day}` : 'Sin compromisos registrados'}</p>
            </div>
          </article>
        </div>

        <article className="finance-card lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">{monthLabel}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Lista de gastos</h2>
            </div>
            <p className="rounded-full border border-border/80 bg-white px-3 py-1 text-sm font-medium text-muted-foreground">
              {fixedExpenses.length} compromisos
            </p>
          </div>

          {fixedExpenses.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">Sin gastos fijos registrados.</p>
          ) : (
            <ul className="mt-6 divide-y divide-border/80 text-sm">
              {fixedExpenses.map((item) => {
                const accountName = item.account_id ? accountNames.get(item.account_id) : null
                const categoryName = item.category_id ? categoryNames.get(item.category_id) : null

                return (
                  <li key={item.id} className="grid gap-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-lg font-semibold text-navy-950" aria-hidden="true">
                        {item.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-navy-950">{item.name}</p>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[item.status] ?? STATUS_STYLES.pending}`}>
                            {STATUS_LABELS[item.status] ?? item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {RECURRENCE_LABELS[item.recurrence] ?? item.recurrence} · Dia {item.due_day}
                          {accountName ? ` · ${accountName}` : ''}
                          {categoryName ? ` · ${categoryName}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="finance-number text-xl font-semibold tracking-tight text-coral-700 sm:text-right">{formatCurrency(Number(item.amount))}</p>
                      <span className="flex items-center gap-2 rounded-full border border-border/80 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700">
                        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_STYLES[item.status] ?? STATUS_DOT_STYLES.pending}`} aria-hidden="true" />
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </article>
      </section>

      <section id="new-fixed-expense" className="finance-card scroll-mt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Nuevo compromiso</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Registrar gasto fijo</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Formulario secundario para mantener la capacidad de creacion sin dominar la composicion principal de Stitch.
          </p>

          <div aria-live="polite" aria-atomic="true" className="mt-4 space-y-2">
            {successMessage ? (
              <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-navy-950">{successMessage}</p>
            ) : null}
            {errorMessage ? (
              <p
                id="fixed-expenses-form-error"
                role="alert"
                className="rounded-lg border border-coral-500/40 bg-coral-50 px-3 py-2 text-sm font-medium text-rose-900"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <form action={createFixedExpenseAction} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm font-medium text-navy-700 md:col-span-2">
              <span>Nombre</span>
              <input
                name="name"
                type="text"
                required
                className="finance-field"
                placeholder="Ej. Arriendo"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Monto</span>
              <p className="text-xs font-normal text-muted-foreground">Valor en COP (pesos colombianos).</p>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="finance-field finance-number"
                placeholder="Ej. 1200000"
                inputMode="decimal"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Dia de cobro</span>
              <input
                name="dueDay"
                type="number"
                min="1"
                max="31"
                required
                className="finance-field finance-number"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Frecuencia</span>
              <select
                name="recurrence"
                defaultValue="monthly"
                className="finance-field"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Estado</span>
              <select
                name="status"
                defaultValue="pending"
                className="finance-field"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Cuenta</span>
              <select name="accountId" className="finance-field" aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}>
                <option value="">Opcional</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Categoria</span>
              <select
                name="categoryId"
                required
                disabled={!hasExpenseCategories}
                className="finance-field"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              >
                <option value="">{hasExpenseCategories ? 'Selecciona' : 'Sin categorias de gasto activas'}</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {!hasExpenseCategories ? (
                <p className="text-xs font-normal text-coral-700">
                  No tienes categorias de tipo gasto activas. Crea o activa una categoria desde{' '}
                  <Link href="/admin/categories" className="font-semibold underline underline-offset-2 hover:text-coral-800">
                    Configuracion &gt; Categorias
                  </Link>
                  .
                </p>
              ) : null}
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Inicio de vigencia</span>
              <p className="text-xs font-normal text-muted-foreground">Fecha desde la que este gasto fijo empieza a aplicar.</p>
              <input
                name="startsOn"
                type="date"
                required
                className="finance-field"
                aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined}
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Fin de vigencia (opcional)</span>
              <p className="text-xs font-normal text-muted-foreground">Dejalo vacio si no tiene fecha de finalizacion.</p>
              <input name="endsOn" type="date" className="finance-field" aria-describedby={errorMessage ? 'fixed-expenses-form-error' : undefined} />
            </label>

            <button
              disabled={!hasExpenseCategories}
              className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-cardHover disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2 xl:col-span-4"
            >
              Guardar gasto fijo
            </button>
          </form>
      </section>
    </div>
  )
}
