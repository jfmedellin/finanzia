import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/lib/actions/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-border/70 glass-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Smart Finance</p>
            <Link href="/dashboard" className="text-lg font-semibold text-navy-900">
              FinanzIA
            </Link>
          </div>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Navegacion principal">
            <Link href="/dashboard#resumen" className="rounded-full px-3 py-1.5 text-sm text-navy-700 hover:bg-muted">
              Resumen
            </Link>
            <Link href="/dashboard#movimientos" className="rounded-full px-3 py-1.5 text-sm text-navy-700 hover:bg-muted">
              Movimientos
            </Link>
            <Link href="/fixed-expenses" className="rounded-full px-3 py-1.5 text-sm text-navy-700 hover:bg-muted">
              Fijos
            </Link>
            <Link href="/savings" className="rounded-full px-3 py-1.5 text-sm text-navy-700 hover:bg-muted">
              Ahorros
            </Link>
            <Link href="/statements" className="rounded-full px-3 py-1.5 text-sm text-navy-700 hover:bg-muted">
              OCR
            </Link>
            <Link href="/reports" className="rounded-full px-3 py-1.5 text-sm text-navy-700 hover:bg-muted">
              Reportes
            </Link>
          </nav>
          <form action={signOutAction}>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted">Salir</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-card/95 p-3 backdrop-blur md:hidden"
        aria-label="Navegacion movil"
      >
        <ul className="grid grid-cols-6 gap-2">
          <li>
            <Link href="/dashboard#resumen" className="block rounded-lg bg-muted px-3 py-2 text-center text-sm font-medium text-navy-900">
              Resumen
            </Link>
          </li>
          <li>
            <Link href="/dashboard#movimientos" className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-navy-700">
              Movimientos
            </Link>
          </li>
          <li>
            <Link href="/fixed-expenses" className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-navy-700">
              Fijos
            </Link>
          </li>
          <li>
            <Link href="/savings" className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-navy-700">
              Ahorros
            </Link>
          </li>
          <li>
            <Link href="/statements" className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-navy-700">
              OCR
            </Link>
          </li>
          <li>
            <Link href="/reports" className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-navy-700">
              Reportes
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
