import { beforeEach, describe, expect, it, vi } from 'vitest'

const { redirectMock, revalidatePathMock, createSupabaseServerClientMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
  revalidatePathMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('next/cache', () => ({ revalidatePath: revalidatePathMock }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: createSupabaseServerClientMock }))

import { createFixedExpenseAction } from '@/lib/actions/fixed-expenses'

function makeForm(input: Record<string, string>) {
  const form = new FormData()
  Object.entries(input).forEach(([key, value]) => form.set(key, value))
  return form
}

describe('createFixedExpenseAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates fixed expense and redirects saved', async () => {
    const insertMock = vi.fn(async () => ({ error: null }))
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn(() => ({ insert: insertMock })),
    })

    await expect(
      createFixedExpenseAction(
        makeForm({
          name: 'Arriendo',
          amount: '1500',
          recurrence: 'monthly',
          dueDay: '5',
          status: 'pending',
          startsOn: '2026-05-01',
          endsOn: '',
          categoryId: 'cat-1',
          accountId: 'acc-1',
        }),
      ),
    ).rejects.toThrow('REDIRECT:/fixed-expenses?saved=1')

    expect(insertMock).toHaveBeenCalled()
    expect(revalidatePathMock).toHaveBeenCalledWith('/fixed-expenses')
  })

  it('rejects invalid due day', async () => {
    await expect(
      createFixedExpenseAction(
        makeForm({
          name: 'Arriendo',
          amount: '1500',
          recurrence: 'monthly',
          dueDay: '99',
          status: 'pending',
          startsOn: '2026-05-01',
          categoryId: 'cat-1',
        }),
      ),
    ).rejects.toThrow('REDIRECT:/fixed-expenses?error=invalid-fields')
  })
})
