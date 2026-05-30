import { upsertProfileAction } from '@/lib/actions/auth'

type OnboardingPageProps = {
  searchParams?: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  'invalid-profile': 'Escribe tu nombre completo para guardar el perfil.',
  'invalid-currency-code': 'La moneda base solo puede ser USD o COP.',
  'profile-save-failed': 'No se pudo guardar tu perfil. Intenta de nuevo en unos segundos.',
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = (await searchParams) ?? {}
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? 'No se pudo procesar el perfil. Revisa los datos e intenta de nuevo.') : null

  return (
    <section className="grid min-h-[calc(100vh-9rem)] items-center gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="ai-insight-card p-8 md:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-navy-50/70 via-white/40 to-emerald-50/80" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Primer paso</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy-950 md:text-5xl">Completa tu perfil financiero</h1>
            <p className="mt-4 text-base leading-7 text-navy-700 md:text-lg">
              FinanzIA necesita tu nombre y moneda base para activar el dashboard, calcular tus métricas y mantener una lectura coherente de tus movimientos.
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="finance-card">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Perfil</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Datos principales</h2>
          <div aria-live="polite" className="mt-4">
            {errorMessage ? (
              <p id="onboarding-form-error" role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900">
                {errorMessage}
              </p>
            ) : null}
          </div>
          <form action={upsertProfileAction} className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Nombre completo</span>
              <input
                name="fullName"
                type="text"
                required
                placeholder="Nombre completo"
                className="finance-field"
                aria-describedby={errorMessage ? 'onboarding-form-error' : undefined}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-navy-700">
              <span>Moneda base</span>
              <select
                name="currencyCode"
                defaultValue="USD"
                className="finance-field"
                aria-describedby={errorMessage ? 'onboarding-form-error' : undefined}
              >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
              </select>
            </label>
            <button className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-cardHover">Guardar perfil</button>
          </form>
        </div>
      </div>
    </section>
  )
}
