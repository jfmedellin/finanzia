import Link from 'next/link'
import { signInAction } from '@/lib/actions/auth'

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {}
  const hasInvalidCredentials = params.error === 'invalid-credentials'

  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-primary">Iniciar sesión</h1>
      {hasInvalidCredentials ? (
        <p className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Credenciales inválidas. Verifica tu email y contraseña.
        </p>
      ) : null}
      <form action={signInAction} className="mt-6 space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          placeholder="Contraseña"
          className="w-full rounded-md border px-3 py-2"
        />
        <button className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground">Entrar</button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-muted-foreground">
        <Link href="/register">Crear cuenta</Link>
        <Link href="/forgot-password">Recuperar contraseña</Link>
      </div>
    </section>
  )
}
