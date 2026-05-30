'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const desktopNavItems = [
  { label: 'Panel', href: '/dashboard', match: '/dashboard' },
  { label: 'Presupuesto', href: '/fixed-expenses', match: '/fixed-expenses' },
  { label: 'Ahorros', href: '/savings', match: '/savings' },
  { label: 'Extractos', href: '/statements', match: '/statements' },
  { label: 'Configuracion', href: '/admin/categories', match: '/admin' },
]

const mobileNavItems = [
  { label: 'Panel', href: '/dashboard', match: '/dashboard' },
  { label: 'Presupuesto', href: '/fixed-expenses', match: '/fixed-expenses' },
  { label: 'Ahorros', href: '/savings', match: '/savings' },
  { label: 'Config', href: '/admin/categories', match: '/admin' },
]

const breadcrumbs = [
  { match: '/fixed-expenses', label: 'Presupuesto > Gastos fijos' },
  { match: '/savings', label: 'Presupuesto > Ahorros' },
  { match: '/statements', label: 'Extractos' },
  { match: '/reports', label: 'Reportes' },
  { match: '/admin', label: 'Configuracion > Categorias' },
  { match: '/dashboard', label: 'Panel' },
]

function isActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`)
}

export function DesktopNavigation() {
  const pathname = usePathname()

  return (
    <nav className="mt-8 flex flex-1 flex-col gap-2" aria-label="Navegacion principal">
      {desktopNavItems.map((item) => {
        const active = isActive(pathname, item.match)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition ${
              active ? 'bg-navy-950 text-white shadow-card' : 'text-navy-700 hover:bg-navy-50 hover:text-navy-950'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <span>{item.label}</span>
            {active ? <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> : null}
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-card/95 px-4 py-3 shadow-ai backdrop-blur md:hidden" aria-label="Navegacion movil">
      <ul className="grid grid-cols-4 gap-3">
        {mobileNavItems.map((item) => {
          const active = isActive(pathname, item.match)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-xl px-3 py-3 text-center text-sm font-semibold transition ${
                  active ? 'bg-navy-950 text-white shadow-card' : 'text-navy-700 hover:bg-navy-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const current = breadcrumbs.find((item) => isActive(pathname, item.match))?.label ?? 'FinanzIA'

  return <p className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground md:block">{current}</p>
}
