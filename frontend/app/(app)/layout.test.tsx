import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const { redirectMock, createSupabaseServerClientMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  createSupabaseServerClientMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock, usePathname: () => '/fixed-expenses' }))
vi.mock('@/lib/actions/auth', () => ({ signOutAction: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: createSupabaseServerClientMock }))

import PrivateLayout from '@/app/(app)/layout'

describe('PrivateLayout', () => {
  it('redirects to /login when there is no active session', async () => {
    createSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null } })),
      },
    })
    await expect(PrivateLayout({ children: null })).rejects.toThrow('REDIRECT:/login')
  })

  it('renders desktop and mobile navigation when user is authenticated', async () => {
    createSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })),
      },
    })

    const element = await PrivateLayout({ children: <div>Contenido</div> })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('aria-label="Navegacion principal"')
    expect(html).toContain('aria-label="Navegacion movil"')
    expect(html).toContain('grid-cols-4')
    expect(html).toContain('Presupuesto')
  })
})
