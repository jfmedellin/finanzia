import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryStatusAction,
  updateCategoryAction,
} from '@/lib/actions/categories'
import { getCategoriesForAdmin, getCategoryUsageForAdmin } from '@/lib/data/categories'

type CategoriesAdminPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string; updated?: string; deleted?: string }>
}

const TYPE_LABELS: Record<string, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
}

const ERROR_MESSAGES: Record<string, string> = {
  'invalid-fields': 'Revisa los datos del formulario e intenta de nuevo.',
  'create-failed': 'No se pudo crear la categoria. Verifica que no exista otra con el mismo nombre y tipo.',
  'update-failed': 'No se pudo actualizar la categoria.',
  'status-failed': 'No se pudo cambiar el estado de la categoria.',
  'delete-failed': 'No se pudo eliminar la categoria. Si tiene uso historico, desactívala en su lugar.',
  'in-use': 'La categoria tiene uso en movimientos, gastos fijos o reglas. Desactívala en lugar de eliminarla.',
}

export default async function CategoriesAdminPage({ searchParams }: CategoriesAdminPageProps) {
  const params = (await searchParams) ?? {}
  const [categories, usageMap] = await Promise.all([getCategoriesForAdmin(), getCategoryUsageForAdmin()])
  const systemCategories = categories.filter((item) => item.is_system)
  const customCategories = categories.filter((item) => !item.is_system)

  const successMessage = params.saved === '1' ? 'Categoria creada correctamente.' : null
  const updatedMessage = params.updated === '1' ? 'Categoria actualizada correctamente.' : null
  const deletedMessage = params.deleted === '1' ? 'Categoria eliminada correctamente.' : null
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? 'No se pudo completar la operacion.') : null

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Configuracion</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy-950 md:text-5xl">Categorias</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
            Administra las categorias que usa tu sistema para gastos, ingresos y reglas. Las categorias del sistema son de solo lectura.
          </p>
        </div>
      </section>

      <section className="finance-card">
        <h2 className="text-2xl font-semibold tracking-tight text-navy-950">Nueva categoria</h2>
        <p className="mt-2 text-sm text-muted-foreground">Crea una categoria personalizada para clasificar mejor tus movimientos y gastos fijos.</p>

        <div aria-live="polite" aria-atomic="true" className="mt-4 space-y-2">
          {successMessage ? <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-navy-950">{successMessage}</p> : null}
          {updatedMessage ? <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-navy-950">{updatedMessage}</p> : null}
          {deletedMessage ? <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-navy-950">{deletedMessage}</p> : null}
          {errorMessage ? <p className="rounded-lg border border-coral-500/40 bg-coral-50 px-3 py-2 text-sm font-medium text-rose-900">{errorMessage}</p> : null}
        </div>

        <form action={createCategoryAction} className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium text-navy-700 md:col-span-2">
            <span>Nombre</span>
            <input name="name" type="text" required className="finance-field" placeholder="Ej. Mascotas" />
          </label>
          <label className="space-y-2 text-sm font-medium text-navy-700">
            <span>Tipo</span>
            <select name="categoryType" defaultValue="expense" className="finance-field">
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </label>
          <button className="rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-cardHover md:col-span-3">
            Crear categoria
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="finance-card">
          <h2 className="text-xl font-semibold text-navy-950">Categorias del sistema</h2>
          <p className="mt-2 text-sm text-muted-foreground">Se incluyen por defecto y no se pueden editar ni eliminar.</p>
          {systemCategories.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">No hay categorias del sistema registradas.</p>
          ) : (
            <ul className="mt-5 space-y-3 text-sm">
              {systemCategories.map((category) => (
                <li key={category.id} className="rounded-xl border border-border/80 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy-950">{category.name}</p>
                    <span className="rounded-full border border-border/80 bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">{TYPE_LABELS[category.category_type] ?? category.category_type}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Uso: {usageMap.get(category.id)?.transactions ?? 0} mov. · {usageMap.get(category.id)?.fixedExpenses ?? 0} gastos fijos · {usageMap.get(category.id)?.rules ?? 0} reglas
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="finance-card">
          <h2 className="text-xl font-semibold text-navy-950">Categorias personalizadas</h2>
          <p className="mt-2 text-sm text-muted-foreground">Puedes renombrar, activar/desactivar y eliminar tus categorias propias.</p>
          {customCategories.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">Aun no tienes categorias personalizadas.</p>
          ) : (
            <ul className="mt-5 space-y-3 text-sm">
              {customCategories.map((category) => {
                const usage = usageMap.get(category.id) ?? { transactions: 0, fixedExpenses: 0, rules: 0 }
                const hasUsage = usage.transactions + usage.fixedExpenses + usage.rules > 0

                return (
                <li key={category.id} className="rounded-xl border border-border/80 bg-white px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full border border-border/80 bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">{TYPE_LABELS[category.category_type] ?? category.category_type}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${category.is_active ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700' : 'border-coral-500/40 bg-coral-50 text-coral-700'}`}>
                      {category.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Uso: {usage.transactions} mov. · {usage.fixedExpenses} gastos fijos · {usage.rules} reglas
                  </p>

                  <form action={updateCategoryAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <input type="hidden" name="id" value={category.id} />
                    <label className="flex-1 space-y-1 text-sm font-medium text-navy-700">
                      <span>Nombre</span>
                      <input name="name" type="text" required defaultValue={category.name} className="finance-field" />
                    </label>
                    <button className="rounded-xl border border-border bg-card px-4 py-3 font-semibold text-navy-900 transition hover:bg-muted">Guardar</button>
                  </form>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={toggleCategoryStatusAction}>
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="nextActive" value={category.is_active ? 'false' : 'true'} />
                      <button className="rounded-xl border border-border bg-card px-4 py-2 font-semibold text-navy-900 transition hover:bg-muted">
                        {category.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>

                    <form action={deleteCategoryAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={category.id} />
                      <input
                        name="confirm"
                        type="text"
                        required
                        placeholder="Escribe ELIMINAR"
                        disabled={hasUsage}
                        className="finance-field h-10 w-40 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <button
                        disabled={hasUsage}
                        className="rounded-xl border border-coral-500/40 bg-coral-50 px-4 py-2 font-semibold text-coral-700 transition hover:bg-coral-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </form>
                    {hasUsage ? <p className="text-xs text-coral-700">Esta categoria tiene uso y no se puede eliminar; puedes desactivarla.</p> : null}
                  </div>
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
