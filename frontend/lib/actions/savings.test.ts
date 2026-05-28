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

import { createSavingsGoalAction } from '@/lib/actions/savings'

function makeForm(input: Record<string, string>) {
  const form = new FormData()
  Object.entries(input).forEach(([key, value]) => form.set(key, value))
  return form
}

describe('createSavingsGoalAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates goal and redirects saved', async () => {
    const insertMock = vi.fn(async () => ({ error: null }))
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn(() => ({ insert: insertMock })),
    })

    await expect(
      createSavingsGoalAction(
        makeForm({
          name: 'Fondo',
          targetAmount: '5000',
          currentAmount: '1000',
          targetDate: '2026-12-31',
          status: 'in_progress',
        }),
      ),
    ).rejects.toThrow('REDIRECT:/savings?saved=1')

    expect(insertMock).toHaveBeenCalled()
    expect(revalidatePathMock).toHaveBeenCalledWith('/savings')
  })

  it('rejects invalid target amounts', async () => {
    await expect(
      createSavingsGoalAction(
        makeForm({
          name: 'Fondo',
          targetAmount: '100',
          currentAmount: '120',
          status: 'in_progress',
        }),
      ),
    ).rejects.toThrow('REDIRECT:/savings?error=invalid-fields')
  })
})
