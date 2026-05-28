import { upsertProfileAction } from '@/lib/actions/auth'

export default function OnboardingPage() {
  return (
    <section className="mx-auto max-w-lg rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-primary">Completa tu perfil</h1>
      <form action={upsertProfileAction} className="mt-6 space-y-3">
        <input
          name="fullName"
          type="text"
          required
          placeholder="Nombre completo"
          className="w-full rounded-md border px-3 py-2"
        />
        <input
          name="currencyCode"
          type="text"
          defaultValue="USD"
          maxLength={3}
          className="w-full rounded-md border px-3 py-2 uppercase"
        />
        <button className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground">Guardar perfil</button>
      </form>
    </section>
  )
}
