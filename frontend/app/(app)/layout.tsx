import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AppBreadcrumb, DesktopNavigation, MobileNavigation } from '@/components/app-navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
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

  const profileLabel = user.user_metadata?.full_name || user.email || 'Usuario FinanzIA'

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground md:flex md:pb-0">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-border/80 bg-card/95 px-5 py-6 shadow-card backdrop-blur md:flex">
        <div>
          <Link href="/dashboard" className="block text-2xl font-semibold tracking-tight text-navy-950">
            FinanzaIA
          </Link>
          <p className="mt-1 text-sm font-medium text-muted-foreground">AI Financial Assistant</p>
        </div>

        <DesktopNavigation />

          <div className="mt-auto space-y-4">
          <Link
            href="/fixed-expenses#new-fixed-expense"
            className="block rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-cardHover"
          >
            Add Expense
          </Link>
          <div className="rounded-2xl border border-border/80 bg-navy-50 p-4">
            <p className="truncate text-sm font-semibold text-navy-950">{profileLabel}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Cuenta activa</p>
            <form action={signOutAction} className="mt-3">
              <Button type="submit" variant="outline" className="w-full border-border bg-card text-foreground hover:bg-muted">Salir</Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 h-16 border-b border-border/70 glass-surface">
          <div className="flex h-full items-center justify-between px-4 md:px-10">
            <div>
              <AppBreadcrumb />
              <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-navy-950 md:hidden">
                FinanzaIA
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="hidden rounded-xl border border-border bg-card/80 px-3 py-2 text-sm font-semibold text-foreground shadow-card sm:block">
                Search
              </span>
              <span className="rounded-xl border border-border bg-card/80 px-3 py-2 text-sm font-semibold text-foreground shadow-card">
                Alerts
              </span>
              <form action={signOutAction} className="md:hidden">
                <Button type="submit" variant="outline" className="h-10 border-border bg-card/80 px-3 text-foreground shadow-card hover:bg-muted">Salir</Button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-shell px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>

      <MobileNavigation />
    </div>
  )
}
