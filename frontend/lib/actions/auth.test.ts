import { beforeEach, describe, expect, it, vi } from 'vitest'

const { redirectMock, revalidatePathMock, createSupabaseServerClientMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  revalidatePathMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn(async (): Promise<unknown> => ({
    auth: {
      signInWithPassword: vi.fn(async () => ({ error: { message: 'Invalid credentials' } })),
    },
  })),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: createSupabaseServerClientMock }))

import { signInAction, upsertProfileAction } from '@/lib/actions/auth'

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

describe('upsertProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects with visible validation error when profile data is invalid', async () => {
    const form = new FormData()
    form.set('fullName', '   ')
    form.set('currencyCode', 'US')

    await expect(upsertProfileAction(form)).rejects.toThrow('REDIRECT:/onboarding?error=invalid-profile')
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled()
  })

  it('redirects with visible validation error when currency code is invalid', async () => {
    const form = new FormData()
    form.set('fullName', 'Ada Lovelace')
    form.set('currencyCode', 'US')

    await expect(upsertProfileAction(form)).rejects.toThrow('REDIRECT:/onboarding?error=invalid-currency-code')
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled()
  })

  it('normalizes currency, upserts by profile id and revalidates app paths', async () => {
    const upsertMock = vi.fn(async () => ({ error: null }))
    createSupabaseServerClientMock.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1', email: 'ada@example.com' } } })),
      },
      from: vi.fn(() => ({ upsert: upsertMock })),
    })
    const form = new FormData()
    form.set('fullName', '  Ada Lovelace  ')
    form.set('currencyCode', ' cop ')

    await expect(upsertProfileAction(form)).rejects.toThrow('REDIRECT:/dashboard')

    expect(upsertMock).toHaveBeenCalledWith(
      { id: 'user-1', user_id: 'user-1', email: 'ada@example.com', full_name: 'Ada Lovelace', currency_code: 'COP' },
      { onConflict: 'user_id' },
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard')
    expect(revalidatePathMock).toHaveBeenCalledWith('/onboarding')
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout')
  })

  it('logs safe Supabase error details before redirecting', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    createSupabaseServerClientMock.mockResolvedValueOnce({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1', email: 'ada@example.com' } } })),
      },
      from: vi.fn(() => ({
        upsert: vi.fn(async () => ({
          error: { code: '23514', message: 'constraint failed', details: 'currency_code length' },
        })),
      })),
    })
    const form = new FormData()
    form.set('fullName', 'Ada Lovelace')
    form.set('currencyCode', 'COP')

    await expect(upsertProfileAction(form)).rejects.toThrow('REDIRECT:/onboarding?error=profile-save-failed')

    expect(consoleErrorSpy).toHaveBeenCalledWith('Profile upsert failed', {
      code: '23514',
      message: 'constraint failed',
      details: 'currency_code length',
    })
    consoleErrorSpy.mockRestore()
  })
})
