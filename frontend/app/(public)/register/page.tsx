import Link from 'next/link'
import { signUpAction } from '@/lib/actions/auth'
import { ThemeToggle } from '@/components/theme-toggle'

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = (await searchParams) ?? {}
  const hasSignupError = params.error === 'signup-failed'
  const hasServerError = params.error === 'server-unavailable'

  return (
    <section className="flex min-h-screen flex-col bg-[#f8f9ff] text-[#0b1c30] dark:bg-[#121413] dark:text-[#e3e2e1] md:flex-row">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <aside className="relative flex w-full flex-col justify-between overflow-hidden border-b border-[#c4c6cd] bg-[#e5eeff] p-6 dark:border-[#414846] dark:bg-[#1a1c1b] md:w-1/2 md:border-b-0 md:border-r md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(46,204,113,0.16),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(4,22,39,0.1),transparent_35%)]" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006d37] text-white dark:bg-[#3a4a5f] dark:text-[#d3e4fe]">◈</div>
          <span className="text-2xl font-bold tracking-tight text-[#041627] dark:text-[#e3e2e1]">FinanzaIA</span>
        </div>

        <div className="relative z-10 mt-16 md:mt-0">
          <h1 className="max-w-lg text-3xl font-bold leading-tight text-[#041627] dark:text-[#e3e2e1] md:text-5xl md:leading-[56px]">
            Empieza a transformar tus finanzas hoy.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-[#44474c] dark:text-[#c1c8c5]">
            Únete a la plataforma impulsada por IA diseñada para profesionales que exigen precisión y control absoluto
            sobre su capital.
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f9ff] px-6 py-10 dark:bg-[#121413] md:w-1/2 md:px-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-10">
            <h2 className="text-[32px] font-semibold leading-[40px] text-[#041627] dark:text-[#e3e2e1]">Crear Cuenta</h2>
            <p className="mt-2 text-base text-[#44474c] dark:text-[#c1c8c5]">Ingresa tus datos para comenzar tu viaje financiero.</p>
          </div>

          <div className="space-y-4">
            {hasSignupError ? (
              <p className="rounded-lg border border-[#ffdad6] bg-[#fff2f0] px-3 py-2 text-sm text-[#93000a]">
                No se pudo completar el registro. Revisa tus datos e inténtalo de nuevo.
              </p>
            ) : null}
            {hasServerError ? (
              <p className="rounded-lg border border-[#ffdad6] bg-[#fff2f0] px-3 py-2 text-sm text-[#93000a]">
                El servicio de autenticación no está disponible. Intenta nuevamente en unos minutos.
              </p>
            ) : null}

            <form action={signUpAction} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[#44474c] dark:text-[#c1c8c5]">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full rounded-lg border border-[#c4c6cd] bg-white px-4 py-3 text-[#0b1c30] placeholder:text-[#74777d] outline-none transition focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] dark:border-[#414846] dark:bg-[#0d0f0e] dark:text-[#e3e2e1] dark:placeholder:text-[#8b9290] dark:focus:border-[#84a59d] dark:focus:ring-[#84a59d]"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#44474c] dark:text-[#c1c8c5]">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@empresa.com"
                  className="w-full rounded-lg border border-[#c4c6cd] bg-white px-4 py-3 text-[#0b1c30] placeholder:text-[#74777d] outline-none transition focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] dark:border-[#414846] dark:bg-[#0d0f0e] dark:text-[#e3e2e1] dark:placeholder:text-[#8b9290] dark:focus:border-[#84a59d] dark:focus:ring-[#84a59d]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#44474c] dark:text-[#c1c8c5]">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#c4c6cd] bg-white px-4 py-3 text-[#0b1c30] placeholder:text-[#74777d] outline-none transition focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] dark:border-[#414846] dark:bg-[#0d0f0e] dark:text-[#e3e2e1] dark:placeholder:text-[#8b9290] dark:focus:border-[#84a59d] dark:focus:ring-[#84a59d]"
                />
                <div className="mt-2">
                  <div className="mb-1.5 flex h-1.5 w-full gap-1.5">
                    <div className="w-1/4 rounded-full bg-[#006d37] dark:bg-[#84a59d]" />
                    <div className="w-1/4 rounded-full bg-[#006d37] dark:bg-[#84a59d]" />
                    <div className="w-1/4 rounded-full bg-[#006d37] dark:bg-[#84a59d]" />
                    <div className="w-1/4 rounded-full bg-[#c4c6cd] dark:bg-[#414846]" />
                  </div>
                  <p className="text-right text-xs font-semibold text-[#006d37] dark:text-[#accec5]">Nivel: Fuerte</p>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#44474c] dark:text-[#c1c8c5]">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#c4c6cd] bg-white px-4 py-3 text-[#0b1c30] placeholder:text-[#74777d] outline-none transition focus:border-[#006d37] focus:ring-1 focus:ring-[#006d37] dark:border-[#414846] dark:bg-[#0d0f0e] dark:text-[#e3e2e1] dark:placeholder:text-[#8b9290] dark:focus:border-[#84a59d] dark:focus:ring-[#84a59d]"
                />
              </div>

              <label className="flex items-start gap-3 text-sm text-[#44474c] dark:text-[#c1c8c5]">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-[#c4c6cd] bg-white text-[#006d37] focus:ring-[#006d37]/30"
                />
                <span>
                  Acepto los <span className="text-[#006d37] dark:text-[#b7c8e1]">Términos y Condiciones</span> y la{' '}
                  <span className="text-[#006d37] dark:text-[#b7c8e1]">Política de Privacidad</span>.
                </span>
              </label>

              <button className="mt-2 flex w-full items-center justify-center rounded-lg border border-[#006d37]/20 bg-[#006d37] px-4 py-3.5 font-bold text-white transition hover:bg-[#00743a] dark:border-[#84a59d] dark:bg-[#84a59d] dark:text-[#163630] dark:hover:bg-[#accec5]">
                Crear Cuenta
              </button>
            </form>

            <p className="pt-2 text-center text-sm text-[#44474c] dark:text-[#c1c8c5]">
              ¿Ya tienes una cuenta?
              <Link href="/login" className="ml-1 font-medium text-[#006d37] hover:text-[#00743a] dark:text-[#b7c8e1] dark:hover:text-[#d3e4fe]">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
