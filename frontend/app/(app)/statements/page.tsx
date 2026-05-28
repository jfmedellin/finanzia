import { confirmOcrDraftAction, uploadStatementAction } from '@/lib/actions/ocr'
import { getAccounts } from '@/lib/data/accounts'
import { getActiveCategories } from '@/lib/data/categories'
import { getOcrDraftRows, getStatementUploads } from '@/lib/data/statements'

type StatementsPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string; confirmed?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  'file-required': 'Debes seleccionar un archivo para procesar.',
  'invalid-file-type': 'Solo se permiten archivos PDF, PNG o JPG.',
  'storage-failed': 'No se pudo cargar el archivo al storage privado.',
  'operation-failed': 'No se pudo registrar el extracto. Intenta nuevamente.',
  'confirm-invalid-fields': 'Revisa los datos antes de confirmar la transacción.',
  'confirm-not-found': 'No se encontró el borrador OCR o ya no está disponible.',
  'confirm-account-required': 'Debes seleccionar una cuenta para confirmar la transacción.',
  'confirm-operation-failed': 'No se pudo confirmar el borrador como transacción.',
}

export default async function StatementsPage({ searchParams }: StatementsPageProps) {
  const params = (await searchParams) ?? {}
  const [accounts, categories, uploads, draftRows] = await Promise.all([getAccounts(), getActiveCategories(), getStatementUploads(), getOcrDraftRows()])

  const successMessage = params.saved === '1' ? 'Extracto cargado y borrador OCR generado.' : null
  const confirmMessage = params.confirmed === '1' ? 'Borrador confirmado y convertido en transacción.' : null
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? 'Error al procesar el extracto.') : null

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-xl border bg-card p-4">
        <h1 className="text-xl font-semibold text-navy-900">Cargar extracto</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sube PDF/JPG/PNG para generar borradores OCR y revisar antes de confirmar.</p>

        <div aria-live="polite" className="mt-3 space-y-2">
          {successMessage ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-navy-900">{successMessage}</p> : null}
          {confirmMessage ? <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-navy-900">{confirmMessage}</p> : null}
          {errorMessage ? <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">{errorMessage}</p> : null}
        </div>

        <form action={uploadStatementAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm text-navy-700">
            <span>Cuenta destino</span>
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
            <span>Archivo</span>
            <input name="statementFile" type="file" required accept="application/pdf,image/png,image/jpeg" className="w-full rounded-md border bg-background px-3 py-2" />
          </label>

          <button className="rounded-md bg-navy-900 px-3 py-2 font-medium text-white hover:bg-navy-700 md:col-span-2">Procesar extracto</button>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-12">
        <article className="rounded-xl border bg-card p-4 md:col-span-6">
          <h2 className="text-lg font-semibold text-navy-900">Extractos cargados</h2>
          {uploads.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">Aún no hay extractos cargados.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {uploads.map((upload) => (
                <li key={upload.id} className="rounded-md border px-3 py-2">
                  <p className="font-medium text-navy-900">{upload.original_filename}</p>
                  <p className="text-muted-foreground">{upload.mime_type} · estado: {upload.status}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border bg-card p-4 md:col-span-6">
          <h2 className="text-lg font-semibold text-navy-900">Borradores OCR</h2>
          {draftRows.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">No hay filas OCR en borrador.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {draftRows.map((row) => (
                <li key={row.id} className="rounded-md border px-3 py-2">
                  <form action={confirmOcrDraftAction} className="grid gap-2">
                    <input type="hidden" name="rowId" value={row.id} />
                    <label className="space-y-1 text-xs text-navy-700">
                      <span>Descripción</span>
                      <input name="description" defaultValue={row.description ?? ''} required className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
                    </label>

                    <div className="grid gap-2 md:grid-cols-2">
                      <label className="space-y-1 text-xs text-navy-700">
                        <span>Monto</span>
                        <input name="amount" type="number" min="0.01" step="0.01" defaultValue={Number(row.amount ?? 0)} required className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
                      </label>
                      <label className="space-y-1 text-xs text-navy-700">
                        <span>Fecha</span>
                        <input name="extractedDate" type="date" defaultValue={row.extracted_date ?? ''} required className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
                      </label>
                    </div>

                    <div className="grid gap-2 md:grid-cols-3">
                      <label className="space-y-1 text-xs text-navy-700">
                        <span>Tipo</span>
                        <select name="direction" defaultValue={row.direction ?? 'expense'} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                          <option value="expense">Gasto</option>
                          <option value="income">Ingreso</option>
                          <option value="transfer">Transferencia</option>
                        </select>
                      </label>

                      <label className="space-y-1 text-xs text-navy-700">
                        <span>Categoría</span>
                        <select name="categoryId" defaultValue={row.category_id ?? ''} className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                          <option value="">Sin categoría</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name} ({category.category_type})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 text-xs text-navy-700">
                        <span>Cuenta</span>
                        <select name="accountId" defaultValue="" className="w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                          <option value="">Usar cuenta del extracto</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <p className="text-xs text-muted-foreground">conf: {row.confidence ?? 0} · sugerida: {row.category_id ? 'sí' : 'no'}</p>
                    <button className="rounded-md bg-navy-900 px-2 py-1.5 text-sm font-medium text-white hover:bg-navy-700">Confirmar transacción</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  )
}
