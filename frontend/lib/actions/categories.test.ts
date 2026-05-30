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

import {
  createCategoryAction,
  deleteCategoryAction,
  toggleCategoryStatusAction,
  updateCategoryAction,
} from '@/lib/actions/categories'

function makeForm(input: Record<string, string>) {
  const form = new FormData()
  Object.entries(input).forEach(([key, value]) => form.set(key, value))
  return form
}

describe('categories actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a category and redirects with success', async () => {
    const insertMock = vi.fn(async () => ({ error: null }))
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn(() => ({ insert: insertMock })),
    })

    await expect(createCategoryAction(makeForm({ name: 'Mascotas', categoryType: 'expense' }))).rejects.toThrow(
      'REDIRECT:/admin/categories?saved=1',
    )

    expect(insertMock).toHaveBeenCalled()
    expect(revalidatePathMock).toHaveBeenCalledWith('/admin/categories')
  })

  it('updates a user category name', async () => {
    const eqMock = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })) }))
    const updateMock = vi.fn(() => ({ eq: eqMock }))

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn(() => ({ update: updateMock })),
    })

    await expect(updateCategoryAction(makeForm({ id: 'cat-1', name: 'Mascotas hogar' }))).rejects.toThrow(
      'REDIRECT:/admin/categories?updated=1',
    )

    expect(updateMock).toHaveBeenCalledWith({ name: 'Mascotas hogar' })
  })

  it('toggles category status', async () => {
    const eqMock = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })) }))
    const updateMock = vi.fn(() => ({ eq: eqMock }))

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn(() => ({ update: updateMock })),
    })

    await expect(toggleCategoryStatusAction(makeForm({ id: 'cat-1', nextActive: 'false' }))).rejects.toThrow(
      'REDIRECT:/admin/categories?updated=1',
    )

    expect(updateMock).toHaveBeenCalledWith({ is_active: false })
  })

  it('deletes a user category', async () => {
    const countBuilder = { eq: vi.fn(async () => ({ count: 0, error: null })) }
    const eqMock = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })) }))
    const deleteMock = vi.fn(() => ({ eq: eqMock }))

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn((table: string) => {
        if (table === 'transactions' || table === 'fixed_expenses' || table === 'classification_rules') {
          return { select: vi.fn(() => countBuilder) }
        }
        return { delete: deleteMock }
      }),
    })

    await expect(deleteCategoryAction(makeForm({ id: 'cat-1', confirm: 'ELIMINAR' }))).rejects.toThrow('REDIRECT:/admin/categories?deleted=1')

    expect(deleteMock).toHaveBeenCalled()
  })

  it('blocks delete when category has usage', async () => {
    const countBuilder = { eq: vi.fn(async () => ({ count: 1, error: null })) }
    const deleteMock = vi.fn()

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: vi.fn((table: string) => {
        if (table === 'transactions' || table === 'fixed_expenses' || table === 'classification_rules') {
          return { select: vi.fn(() => countBuilder) }
        }
        return { delete: deleteMock }
      }),
    })

    await expect(deleteCategoryAction(makeForm({ id: 'cat-1', confirm: 'ELIMINAR' }))).rejects.toThrow(
      'REDIRECT:/admin/categories?error=in-use',
    )

    expect(deleteMock).not.toHaveBeenCalled()
  })

  it('blocks delete when confirmation text is missing', async () => {
    await expect(deleteCategoryAction(makeForm({ id: 'cat-1', confirm: '' }))).rejects.toThrow(
      'REDIRECT:/admin/categories?error=invalid-fields',
    )
  })
})
