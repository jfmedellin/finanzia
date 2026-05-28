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

import { createTransactionAction } from '@/lib/actions/finance'

function createSupabaseMock(options?: {
  userId?: string | null
  rpcErrorMessage?: string | null
}) {
  const rpcMock = vi.fn(async () => {
    if (options?.rpcErrorMessage) {
      return { data: null, error: { message: options.rpcErrorMessage } }
    }
    return { data: { id: 'tx-1' }, error: null }
  })

  return {
    supabase: {
      auth: {
        getUser: async () => ({ data: { user: options?.userId === null ? null : { id: options?.userId ?? 'user-1' } } }),
      },
      rpc: rpcMock,
    },
    rpcMock,
  }
}

function makeForm(input: Record<string, string>) {
  const form = new FormData()
  Object.entries(input).forEach(([key, value]) => form.set(key, value))
  return form
}

describe('createTransactionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits expense through RPC and redirects saved', async () => {
    const mock = createSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      categoryId: 'cat-1',
      type: 'expense',
      amount: '100',
      happenedAt: '2026-01-10',
      description: 'Supermercado',
    })

    await expect(createTransactionAction(form)).rejects.toThrow('REDIRECT:/dashboard?saved=1')
    expect(mock.rpcMock).toHaveBeenCalledWith('create_finance_transaction', expect.objectContaining({ p_type: 'expense', p_amount: 100 }))
    expect(revalidatePathMock).toHaveBeenCalledWith('/dashboard')
  })

  it('submits income through RPC and redirects saved', async () => {
    const mock = createSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      categoryId: 'cat-inc',
      type: 'income',
      amount: '50',
      happenedAt: '2026-01-10',
      description: 'Salario',
    })

    await expect(createTransactionAction(form)).rejects.toThrow('REDIRECT:/dashboard?saved=1')
    expect(mock.rpcMock).toHaveBeenCalledWith('create_finance_transaction', expect.objectContaining({ p_type: 'income', p_amount: 50 }))
  })

  it('submits transfer through RPC and redirects saved', async () => {
    const mock = createSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      toAccountId: 'a2',
      type: 'transfer',
      amount: '25',
      happenedAt: '2026-01-10',
      description: 'Transferencia',
    })

    await expect(createTransactionAction(form)).rejects.toThrow('REDIRECT:/dashboard?saved=1')
    expect(mock.rpcMock).toHaveBeenCalledWith('create_finance_transaction', expect.objectContaining({ p_type: 'transfer', p_to_account_id: 'a2' }))
  })

  it('rejects invalid amount before calling RPC', async () => {
    const mock = createSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      type: 'expense',
      amount: '0',
      happenedAt: '2026-01-10',
      description: 'Monto invalido',
    })

    await expect(createTransactionAction(form)).rejects.toThrow('REDIRECT:/dashboard?error=invalid-amount-or-fields')
    expect(mock.rpcMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('maps validation RPC errors to dashboard validation redirects', async () => {
    const mock = createSupabaseMock({ rpcErrorMessage: 'VALIDATION_CATEGORY_INACTIVE' })
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      categoryId: 'cat-1',
      type: 'expense',
      amount: '10',
      happenedAt: '2026-01-10',
      description: 'Categoria deshabilitada',
    })

    await expect(createTransactionAction(form)).rejects.toThrow(
      'REDIRECT:/dashboard?error=validation-validation_category_inactive',
    )
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('maps operation failures to generic operation error and does not revalidate', async () => {
    const mock = createSupabaseMock({ rpcErrorMessage: 'OPERATION_FAILED' })
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      categoryId: 'cat-1',
      type: 'expense',
      amount: '25',
      happenedAt: '2026-01-10',
      description: 'Operacion fallida',
    })

    await expect(createTransactionAction(form)).rejects.toThrow('REDIRECT:/dashboard?error=operation-failed')
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('redirects unauthenticated users to login', async () => {
    const mock = createSupabaseMock({ userId: null })
    createSupabaseServerClientMock.mockResolvedValue(mock.supabase)

    const form = makeForm({
      accountId: 'a1',
      categoryId: 'cat-1',
      type: 'expense',
      amount: '15',
      happenedAt: '2026-01-10',
      description: 'No auth',
    })

    await expect(createTransactionAction(form)).rejects.toThrow('REDIRECT:/login')
    expect(mock.rpcMock).not.toHaveBeenCalled()
  })
})
