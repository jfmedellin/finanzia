import Link from 'next/link'
import { signInAction } from '@/lib/actions/auth'

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {}
  const hasInvalidCredentials = params.error === 'invalid-credentials'

  return (
    <section className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      <aside className="relative hidden w-1/2 overflow-hidden border-r border-[#3c4a42] bg-[#060e20] lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(123,208,255,0.2),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(150,153,255,0.15),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/70 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-end p-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl text-[#4edea3]">◈</span>
            <span className="text-4xl font-bold tracking-tight text-[#dae2fd]">FinanzaIA</span>
          </div>
          <p className="max-w-md text-lg leading-8 text-[#bbcabf]">
            Inteligencia artificial aplicada a la gestión patrimonial. Precisión, seguridad y crecimiento sostenido en
            un entorno diseñado para profesionales.
          </p>
        </div>
      </aside>

      <div className="flex w-full items-center justify-center bg-[#0b1326] px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <p className="text-2xl font-bold tracking-tight text-[#dae2fd]">FinanzaIA</p>
          </div>

          <h1 className="text-[32px] font-semibold leading-[40px] text-[#dae2fd]">Bienvenido de nuevo</h1>
          <p className="mb-10 mt-2 text-base leading-6 text-[#bbcabf]">
            Ingresa a tu entorno seguro para continuar analizando tus finanzas.
          </p>

          <div className="space-y-4">
            {hasInvalidCredentials ? (
              <p className="rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
                Credenciales inválidas. Verifica tu email y contraseña.
              </p>
            ) : null}

            <form action={signInAction} className="space-y-6">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#bbcabf]">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  className="w-full rounded-lg border border-[#3c4a42] bg-[#171f33] px-4 py-3 text-[#dae2fd] placeholder:text-[#86948a] outline-none transition focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3]"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-[#bbcabf]">
                    Contraseña
                  </label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-[#4edea3] hover:text-[#6ffbbe]">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#3c4a42] bg-[#171f33] px-4 py-3 text-[#dae2fd] placeholder:text-[#86948a] outline-none transition focus:border-[#4edea3] focus:ring-1 focus:ring-[#4edea3]"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-[#bbcabf]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#3c4a42] bg-[#171f33] text-[#4edea3] focus:ring-[#4edea3]/30"
                />
                Recordarme en este dispositivo
              </label>

              <button className="mt-2 flex w-full items-center justify-center rounded-lg bg-[#4edea3] px-4 py-3.5 font-medium text-[#003824] transition hover:bg-[#6ffbbe]">
                Iniciar Sesión
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="h-px flex-1 bg-[#3c4a42]/70" />
              <span className="px-4 text-xs text-[#86948a]">o continúa con</span>
              <div className="h-px flex-1 bg-[#3c4a42]/70" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="rounded-lg border border-[#3c4a42] bg-[#131b2e] py-2.5 text-sm text-[#dae2fd] transition hover:bg-[#171f33]">
                Google
              </button>
              <button className="rounded-lg border border-[#3c4a42] bg-[#131b2e] py-2.5 text-sm text-[#dae2fd] transition hover:bg-[#171f33]">
                Apple
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-[#bbcabf]">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-[#4edea3] hover:text-[#6ffbbe]">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
