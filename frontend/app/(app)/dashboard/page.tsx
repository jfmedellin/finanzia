import { createTransactionAction } from '@/lib/actions/finance'
import { getAccounts } from '@/lib/data/accounts'
import { getActiveCategories } from '@/lib/data/categories'
import { getRecentTransactions } from '@/lib/data/transactions'
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

  const successMessage = params.saved === '1' ? 'Movimiento guardado correctamente.' : null
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? 'Ocurrio un error al procesar el movimiento.') : null

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-4">
        <h1 className="text-xl font-semibold text-primary">Registrar movimiento</h1>
        {successMessage ? (
          <p className="mt-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{errorMessage}</p>
        ) : null}
        <form action={createTransactionAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <select name="type" className="rounded-md border px-3 py-2" defaultValue="expense">
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="transfer">Transferencia</option>
          </select>
          <input name="amount" type="number" min="0.01" step="0.01" required className="rounded-md border px-3 py-2" />
          <select name="accountId" required className="rounded-md border px-3 py-2">
            <option value="">Cuenta origen</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <select name="toAccountId" className="rounded-md border px-3 py-2">
            <option value="">Cuenta destino (solo transferencia)</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <select name="categoryId" className="rounded-md border px-3 py-2">
            <option value="">Categoria (ingreso/gasto)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.category_type})
              </option>
            ))}
          </select>
          <input name="happenedAt" type="date" required className="rounded-md border px-3 py-2" />
          <input
            name="description"
            type="text"
            required
            placeholder="Descripción"
            className="rounded-md border px-3 py-2 md:col-span-2"
          />
          <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground md:col-span-2">Guardar</button>
        </form>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="text-lg font-semibold text-primary">Movimientos recientes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>
                {tx.description} · {tx.transaction_type}
              </span>
              <span className="font-medium">{tx.amount}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
