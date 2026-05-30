import Link from 'next/link'
import { ArrowRight, Lock, Mail, MonitorUp } from 'lucide-react'
import { signInAction } from '@/lib/actions/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {}
  const hasInvalidCredentials = params.error === 'invalid-credentials'

  return (
    <section className="flex min-h-screen bg-[#f8f9ff] text-[#0b1c30] dark:bg-[#121413] dark:text-[#e3e2e1]">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <aside className="relative hidden w-1/2 overflow-hidden border-r border-[#c4c6cd] bg-[#e5eeff] dark:border-[#414846] dark:bg-[#1a1c1b] lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(46,204,113,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(4,22,39,0.1),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(183,200,222,0.22),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] via-[#f8f9ff]/70 to-transparent dark:from-[#121413] dark:via-[#121413]/70" />

        <div className="relative z-10 flex h-full flex-col justify-end p-10">
          <div className="mb-6 flex items-center gap-3">
              <span className="text-4xl text-[#006d37] dark:text-[#accec5]">◈</span>
              <span className="text-4xl font-bold tracking-tight text-[#041627] dark:text-[#e3e2e1]">FinanzaIA</span>
            </div>
          <p className="max-w-md text-lg leading-8 text-[#44474c] dark:text-[#c1c8c5]">
            Inteligencia artificial aplicada a la gestión patrimonial. Precisión, seguridad y crecimiento sostenido en
            un entorno diseñado para profesionales.
          </p>

          <div className="mt-8 w-full max-w-sm rounded-2xl border border-[#c4c6cd] bg-white/80 p-5 shadow-[0_4px_20px_rgba(26,43,60,0.05)] backdrop-blur dark:border-[#414846] dark:bg-[#1e201f]/85 dark:shadow-black/30">
            <div className="flex items-start gap-3">
              <MonitorUp className="mt-0.5 h-5 w-5 text-[#006d37] dark:text-[#accec5]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#74777d] dark:text-[#8b9290]">Rendimiento institucional</p>
                <p className="mt-1 text-lg font-semibold text-[#041627] dark:text-[#e3e2e1]">+24.8%</p>
                <p className="mt-1 text-sm text-[#74777d] dark:text-[#c1c8c5]">Promedio anualizado de carteras gestionadas por IA.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex w-full items-center justify-center bg-[#f8f9ff] px-6 py-12 dark:bg-[#121413] sm:px-12 lg:w-1/2 lg:px-20">
        <Card className="w-full max-w-[460px] border-[#c4c6cd] bg-white text-[#0b1c30] shadow-[0_12px_32px_rgba(26,43,60,0.12)] dark:border-[#414846] dark:bg-[#1e201f] dark:text-[#e3e2e1] dark:shadow-black/30">
          <CardHeader className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#74777d] dark:text-[#8b9290] lg:hidden">FinanzaIA</p>
            <CardTitle className="text-[32px] leading-[40px] text-[#041627] dark:text-[#e3e2e1]">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-base text-[#44474c] dark:text-[#c1c8c5]">Ingresa a tu entorno seguro para continuar analizando tus finanzas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasInvalidCredentials ? (
              <p className="rounded-lg border border-[#ffdad6] bg-[#fff2f0] px-3 py-2 text-sm text-[#93000a]">
                Credenciales inválidas. Verifica tu email y contraseña.
              </p>
            ) : null}

            <form action={signInAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#44474c] dark:text-[#c1c8c5]">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777d] dark:text-[#8b9290]" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="usuario@empresa.com"
                    className="border-[#c4c6cd] bg-white pl-10 text-[#0b1c30] placeholder:text-[#74777d] focus-visible:ring-[#006d37] dark:border-[#414846] dark:bg-[#0d0f0e] dark:text-[#e3e2e1] dark:placeholder:text-[#8b9290] dark:focus-visible:ring-[#84a59d]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#44474c] dark:text-[#c1c8c5]">Contraseña</Label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-[#006d37] hover:text-[#00743a] dark:text-[#b7c8e1] dark:hover:text-[#d3e4fe]">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777d] dark:text-[#8b9290]" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="border-[#c4c6cd] bg-white pl-10 text-[#0b1c30] placeholder:text-[#74777d] focus-visible:ring-[#006d37] dark:border-[#414846] dark:bg-[#0d0f0e] dark:text-[#e3e2e1] dark:placeholder:text-[#8b9290] dark:focus-visible:ring-[#84a59d]"
                  />
                </div>
              </div>

              <Label className="flex items-center gap-3 text-sm text-[#44474c] dark:text-[#c1c8c5]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#c4c6cd] bg-white text-[#006d37] focus:ring-[#006d37]/30"
                />
                Recordarme en este dispositivo
              </Label>

              <Button className="h-12 w-full bg-[#006d37] font-semibold text-white hover:bg-[#00743a] dark:bg-[#84a59d] dark:text-[#163630] dark:hover:bg-[#accec5]" type="submit">
                Iniciar Sesión
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="my-6 flex items-center">
              <div className="h-px flex-1 bg-[#c4c6cd] dark:bg-[#414846]" />
              <span className="px-4 text-xs text-[#74777d] dark:text-[#8b9290]">o continúa con</span>
              <div className="h-px flex-1 bg-[#c4c6cd] dark:bg-[#414846]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="border-[#c4c6cd] bg-white text-[#041627] hover:bg-[#eff4ff] hover:text-[#041627] dark:border-[#414846] dark:bg-[#1a1c1b] dark:text-[#e3e2e1] dark:hover:bg-[#292a2a] dark:hover:text-[#e3e2e1]">
                Google
              </Button>
              <Button type="button" variant="outline" className="border-[#c4c6cd] bg-white text-[#041627] hover:bg-[#eff4ff] hover:text-[#041627] dark:border-[#414846] dark:bg-[#1a1c1b] dark:text-[#e3e2e1] dark:hover:bg-[#292a2a] dark:hover:text-[#e3e2e1]">
                Apple
              </Button>
            </div>

            <p className="mt-8 text-center text-sm text-[#44474c] dark:text-[#c1c8c5]">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="font-medium text-[#006d37] hover:text-[#00743a] dark:text-[#b7c8e1] dark:hover:text-[#d3e4fe]">
                Regístrate aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
