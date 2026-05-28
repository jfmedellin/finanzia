import { createFixedExpenseAction } from '@/lib/actions/fixed-expenses'
import { getAccounts } from '@/lib/data/accounts'
import { getActiveCategories } from '@/lib/data/categories'
import { getFixedExpenses } from '@/lib/data/fixed-expenses'

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

export default async function FixedExpensesPage({ searchParams }: FixedExpensesPageProps) {
  const params = (await searchParams) ?? {}
  const [accounts, categories, fixedExpenses] = await Promise.all([getAccounts(), getActiveCategories(), getFixedExpenses()])
  const expenseCategories = categories.filter((category) => category.category_type === 'expense')

  const successMessage = params.saved === '1' ? 'Gasto fijo guardado correctamente.' : null
  const errorMessage = params.error ? 'No se pudo guardar. Revisa los campos e intenta de nuevo.' : null

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="grid gap-4 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-5 shadow-sm md:col-span-5">
          <p className="text-sm text-muted-foreground">Total de gastos fijos</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900 md:text-3xl">{fixedExpenses.length}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm md:col-span-7">
          <p className="text-sm text-navy-700">Compromiso mensual estimado</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900 md:text-3xl">
            {formatCurrency(fixedExpenses.filter((item) => item.recurrence === 'monthly').reduce((acc, item) => acc + Number(item.amount), 0))}
          </p>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-4 md:col-span-6">
          <h1 className="text-xl font-semibold text-navy-900">Registrar gasto fijo</h1>
          <div aria-live="polite" className="mt-3 space-y-2">
            {successMessage ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-navy-900">{successMessage}</p> : null}
            {errorMessage ? <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{errorMessage}</p> : null}
          </div>

          <form action={createFixedExpenseAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-navy-700 md:col-span-2">
              <span>Nombre</span>
              <input name="name" type="text" required className="w-full rounded-md border bg-background px-3 py-2" placeholder="Ej. Arriendo" />
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Monto</span>
              <input name="amount" type="number" min="0.01" step="0.01" required className="w-full rounded-md border bg-background px-3 py-2" />
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Dia de cobro</span>
              <input name="dueDay" type="number" min="1" max="31" required className="w-full rounded-md border bg-background px-3 py-2" />
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Frecuencia</span>
              <select name="recurrence" defaultValue="monthly" className="w-full rounded-md border bg-background px-3 py-2">
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Estado</span>
              <select name="status" defaultValue="pending" className="w-full rounded-md border bg-background px-3 py-2">
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="overdue">Vencido</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Cuenta</span>
              <select name="accountId" className="w-full rounded-md border bg-background px-3 py-2">
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
              <select name="categoryId" required className="w-full rounded-md border bg-background px-3 py-2">
                <option value="">Selecciona</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Inicio</span>
              <input name="startsOn" type="date" required className="w-full rounded-md border bg-background px-3 py-2" />
            </label>

            <label className="space-y-1 text-sm text-navy-700">
              <span>Fin</span>
              <input name="endsOn" type="date" className="w-full rounded-md border bg-background px-3 py-2" />
            </label>

            <button className="rounded-md bg-navy-900 px-3 py-2 font-medium text-white hover:bg-navy-700 md:col-span-2">Guardar gasto fijo</button>
          </form>
        </article>

        <article className="rounded-xl border bg-card p-4 md:col-span-6">
          <h2 className="text-lg font-semibold text-navy-900">Listado</h2>
          {fixedExpenses.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">Sin gastos fijos registrados.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {fixedExpenses.map((item) => (
                <li key={item.id} className="rounded-md border px-3 py-2">
                  <p className="font-medium text-navy-900">{item.name}</p>
                  <p className="text-muted-foreground">
                    {formatCurrency(Number(item.amount))} · {RECURRENCE_LABELS[item.recurrence] ?? item.recurrence} · Dia {item.due_day} · {STATUS_LABELS[item.status] ?? item.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  )
}
