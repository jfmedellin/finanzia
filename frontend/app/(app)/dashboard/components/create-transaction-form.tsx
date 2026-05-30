import { createTransactionAction } from '@/lib/actions/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Account = { id: string; name: string }
type Category = { id: string; name: string; category_type: string }

type CreateTransactionFormProps = {
  accounts: Account[]
  categories: Category[]
  successMessage: string | null
  errorMessage: string | null
}

export function CreateTransactionForm({ accounts, categories, successMessage, errorMessage }: CreateTransactionFormProps) {
  return (
    <article className="finance-card lg:col-span-8">
      <h2 className="text-2xl font-semibold tracking-tight text-navy-950">Registrar movimiento</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Formulario secundario para mantener tus metricas correctas sin competir con el resumen analitico.</p>

      <div aria-live="polite" aria-atomic="true" className="mt-3 space-y-2">
        {successMessage ? (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-50 px-3 py-2 text-sm font-medium text-navy-950">{successMessage}</p>
        ) : null}
        {errorMessage ? (
          <p
            id="dashboard-form-error"
            role="alert"
            className="rounded-lg border border-coral-500/40 bg-coral-50 px-3 py-2 text-sm font-medium text-rose-900"
          >
            {errorMessage}
          </p>
        ) : null}
      </div>

      <form action={createTransactionAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <Label className="space-y-2 text-sm font-medium text-navy-700">
          <span className="block">Tipo</span>
          <select
            name="type"
            className="finance-field"
            defaultValue="expense"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
            <option value="transfer">Transferencia</option>
          </select>
        </Label>

        <Label className="space-y-2 text-sm font-medium text-navy-700">
          <span className="block">Monto</span>
          <Input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="finance-number border-input bg-white text-navy-900"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          />
        </Label>

        <Label className="space-y-2 text-sm font-medium text-navy-700">
          <span className="block">Cuenta origen</span>
          <select
            name="accountId"
            required
            className="finance-field"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          >
            <option value="">Selecciona</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </Label>

        <Label className="space-y-2 text-sm font-medium text-navy-700">
          <span className="block">Cuenta destino (transferencia)</span>
          <select
            name="toAccountId"
            className="finance-field"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          >
            <option value="">Opcional</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </Label>

        <Label className="space-y-2 text-sm font-medium text-navy-700">
          <span className="block">Categoria</span>
          <select
            name="categoryId"
            className="finance-field"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          >
            <option value="">Selecciona</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.category_type})
              </option>
            ))}
          </select>
        </Label>

        <Label className="space-y-2 text-sm font-medium text-navy-700">
          <span className="block">Fecha</span>
          <Input
            name="happenedAt"
            type="date"
            required
            className="border-input bg-white text-navy-900"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          />
        </Label>

        <Label className="space-y-2 text-sm font-medium text-navy-700 md:col-span-2">
          <span className="block">Descripcion</span>
          <Input
            name="description"
            type="text"
            required
            placeholder="Ej. Mercado semanal"
            className="border-input bg-white text-navy-900"
            aria-describedby={errorMessage ? 'dashboard-form-error' : undefined}
          />
        </Label>

        <Button className="h-12 bg-emerald-700 text-white hover:bg-emerald-800 md:col-span-2" type="submit">Guardar movimiento</Button>
      </form>
    </article>
  )
}
