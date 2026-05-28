import { describe, expect, it, vi } from 'vitest'

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/lib/actions/auth', () => ({ signOutAction: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  })),
}))

import PrivateLayout from '@/app/(app)/layout'

describe('PrivateLayout', () => {
  it('redirects to /login when there is no active session', async () => {
    await expect(PrivateLayout({ children: null })).rejects.toThrow('REDIRECT:/login')
  })
})
