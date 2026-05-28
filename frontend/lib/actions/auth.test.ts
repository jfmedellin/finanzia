import { beforeEach, describe, expect, it, vi } from 'vitest'

const { redirectMock, revalidatePathMock, createSupabaseServerClientMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  revalidatePathMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn(async () => ({
    auth: {
      signInWithPassword: vi.fn(async () => ({ error: { message: 'Invalid credentials' } })),
    },
  })),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: createSupabaseServerClientMock }))

import { signInAction } from '@/lib/actions/auth'

describe('signInAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects with non-sensitive error on invalid login', async () => {
    const form = new FormData()
    form.set('email', 'wrong@example.com')
    form.set('password', 'bad-pass')

    await expect(signInAction(form)).rejects.toThrow('REDIRECT:/login?error=invalid-credentials')
  })
})
