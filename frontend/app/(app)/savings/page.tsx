import { createSavingsGoalAction } from '@/lib/actions/savings'
import { getSavingsGoals } from '@/lib/data/savings'
import { formatCurrency, progressPercent } from '@/lib/formatters'

type SavingsPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string }>
}

export default async function SavingsPage({ searchParams }: SavingsPageProps) {
  const params = (await searchParams) ?? {}
  const goals = await getSavingsGoals()
  const successMessage = params.saved === '1' ? 'Meta de ahorro guardada correctamente.' : null
  const errorMessage = params.error ? 'No se pudo guardar. Revisa los campos e intenta de nuevo.' : null

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="grid gap-4 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-5 shadow-sm md:col-span-6">
          <p className="text-sm text-muted-foreground">Metas activas</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900 md:text-3xl">{goals.filter((goal) => goal.status === 'in_progress').length}</p>
        </article>
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm md:col-span-6">
          <p className="text-sm text-navy-700">Saldo acumulado</p>
          <p className="mt-2 text-2xl font-semibold text-navy-900 md:text-3xl">{formatCurrency(goals.reduce((acc, goal) => acc + Number(goal.current_amount), 0))}</p>
        </article>
      </section>

      <section className="grid gap-6 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-4 md:col-span-5">
          <h1 className="text-xl font-semibold text-navy-900">Crear meta de ahorro</h1>
          <div aria-live="polite" className="mt-3 space-y-2">
            {successMessage ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-navy-900">{successMessage}</p> : null}
            {errorMessage ? <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{errorMessage}</p> : null}
          </div>

          <form action={createSavingsGoalAction} className="mt-4 grid gap-3">
            <label className="space-y-1 text-sm text-navy-700">
              <span>Nombre</span>
              <input name="name" type="text" required className="w-full rounded-md border bg-background px-3 py-2" placeholder="Ej. Fondo de emergencia" />
            </label>
            <label className="space-y-1 text-sm text-navy-700">
              <span>Meta objetivo</span>
              <input name="targetAmount" type="number" min="0.01" step="0.01" required className="w-full rounded-md border bg-background px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm text-navy-700">
              <span>Ahorro actual</span>
              <input name="currentAmount" type="number" min="0" step="0.01" required defaultValue="0" className="w-full rounded-md border bg-background px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm text-navy-700">
              <span>Fecha objetivo</span>
              <input name="targetDate" type="date" className="w-full rounded-md border bg-background px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm text-navy-700">
              <span>Estado</span>
              <select name="status" defaultValue="in_progress" className="w-full rounded-md border bg-background px-3 py-2">
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="paused">Pausada</option>
              </select>
            </label>

            <button className="rounded-md bg-navy-900 px-3 py-2 font-medium text-white hover:bg-navy-700">Guardar meta</button>
          </form>
        </article>

        <article className="rounded-xl border bg-card p-4 md:col-span-7">
          <h2 className="text-lg font-semibold text-navy-900">Progreso de metas</h2>
          {goals.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">Sin metas de ahorro registradas.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {goals.map((goal) => {
                const pct = progressPercent(Number(goal.current_amount), Number(goal.target_amount))
                return (
                  <li key={goal.id} className="rounded-md border px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-navy-900">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">{goal.status}</p>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      {formatCurrency(Number(goal.current_amount))} de {formatCurrency(Number(goal.target_amount))}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{pct}% completado</p>
                  </li>
                )
              })}
            </ul>
          )}
        </article>
      </section>
    </div>
  )
}
