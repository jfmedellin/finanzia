import Link from 'next/link'
import { signUpAction } from '@/lib/actions/auth'

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = (await searchParams) ?? {}
  const hasSignupError = params.error === 'signup-failed'
  const hasServerError = params.error === 'server-unavailable'

  return (
    <section className="flex min-h-screen flex-col bg-[#0b1326] text-[#dae2fd] md:flex-row">
      <aside className="relative flex w-full flex-col justify-between overflow-hidden border-b border-[#3c4a42] bg-[#131b2e] p-6 md:w-1/2 md:border-b-0 md:border-r md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(123,208,255,0.16),transparent_35%)]" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10b981] text-[#002113]">◈</div>
          <span className="text-2xl font-bold tracking-tight text-[#4edea3]">FinanzaIA</span>
        </div>

        <div className="relative z-10 mt-16 md:mt-0">
          <h1 className="max-w-lg text-3xl font-bold leading-tight text-[#dae2fd] md:text-5xl md:leading-[56px]">
            Empieza a transformar tus finanzas hoy.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-[#bbcabf]">
            Únete a la plataforma impulsada por IA diseñada para profesionales que exigen precisión y control absoluto
            sobre su capital.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen w-full items-center justify-center bg-[#0b1326] px-6 py-10 md:w-1/2 md:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-10">
            <h2 className="text-[32px] font-semibold leading-[40px] text-[#dae2fd]">Crear Cuenta</h2>
            <p className="mt-2 text-base text-[#bbcabf]">Ingresa tus datos para comenzar tu viaje financiero.</p>
          </div>

          <div className="space-y-4">
            {hasSignupError ? (
              <p className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                No se pudo completar el registro. Revisa tus datos e inténtalo de nuevo.
              </p>
            ) : null}
            {hasServerError ? (
              <p className="rounded-lg border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
                El servicio de autenticación no está disponible. Intenta nuevamente en unos minutos.
              </p>
            ) : null}

            <form action={signUpAction} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#dae2fd]">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full rounded-lg border border-[#3c4a42] bg-[#2d3449] px-4 py-3 text-[#dae2fd] placeholder:text-[#86948a] outline-none transition focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3]"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#dae2fd]">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@empresa.com"
                  className="w-full rounded-lg border border-[#3c4a42] bg-[#2d3449] px-4 py-3 text-[#dae2fd] placeholder:text-[#86948a] outline-none transition focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#dae2fd]">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#3c4a42] bg-[#2d3449] px-4 py-3 text-[#dae2fd] placeholder:text-[#86948a] outline-none transition focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3]"
                />
                <div className="mt-2">
                  <div className="mb-1.5 flex h-1.5 w-full gap-1.5">
                    <div className="w-1/4 rounded-full bg-[#10b981]" />
                    <div className="w-1/4 rounded-full bg-[#10b981]" />
                    <div className="w-1/4 rounded-full bg-[#10b981]" />
                    <div className="w-1/4 rounded-full bg-[#2d3449]" />
                  </div>
                  <p className="text-right text-xs font-semibold text-[#4edea3]">Nivel: Fuerte</p>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#dae2fd]">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#3c4a42] bg-[#2d3449] px-4 py-3 text-[#dae2fd] placeholder:text-[#86948a] outline-none transition focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3]"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-[#bbcabf]">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-[#3c4a42] bg-[#2d3449] text-[#4edea3] focus:ring-[#4edea3]/30"
                />
                <span>
                  Acepto los <span className="text-[#4edea3]">Términos y Condiciones</span> y la{' '}
                  <span className="text-[#4edea3]">Política de Privacidad</span>.
                </span>
              </label>

              <button className="mt-2 flex w-full items-center justify-center rounded-lg border border-[#4edea3]/20 bg-[#10b981] px-4 py-3.5 font-bold text-[#002113] transition hover:bg-[#4edea3]">
                Crear Cuenta
              </button>
            </form>

            <p className="pt-2 text-center text-sm text-[#bbcabf]">
              ¿Ya tienes una cuenta?
              <Link href="/login" className="ml-1 font-medium text-[#4edea3] hover:text-[#6ffbbe]">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
