import Link from 'next/link'
import { requestPasswordRecoveryAction } from '@/lib/actions/auth'

export default function ForgotPasswordPage() {
  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-primary">Recuperar contraseña</h1>
      <form action={requestPasswordRecoveryAction} className="mt-6 space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border px-3 py-2" />
        <button className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground">Enviar enlace</button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        <Link href="/login">Volver a iniciar sesión</Link>
      </p>
    </section>
  )
}
