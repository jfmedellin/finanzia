import Link from 'next/link'
import { signUpAction } from '@/lib/actions/auth'

export default function RegisterPage() {
  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-primary">Crear cuenta</h1>
      <form action={signUpAction} className="mt-6 space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Contraseña"
          className="w-full rounded-md border px-3 py-2"
        />
        <button className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground">Registrarme</button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </section>
  )
}
