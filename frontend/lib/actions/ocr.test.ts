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

import { confirmOcrDraftAction, uploadStatementAction } from '@/lib/actions/ocr'

function mockFile(name: string, type: string, content = 'dummy') {
  return new File([content], name, { type })
}

describe('uploadStatementAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects invalid mime type', async () => {
    const form = new FormData()
    form.set('statementFile', mockFile('x.txt', 'text/plain'))

    await expect(uploadStatementAction(form)).rejects.toThrow('REDIRECT:/statements?error=invalid-file-type')
  })

  it('uploads statement and redirects saved', async () => {
    const insertSingleMock = vi.fn(async () => ({ data: { id: 'stmt-1' }, error: null }))
    const updateEqMock = vi.fn(async () => ({ error: null }))
    const deleteEqMock = vi.fn(async () => ({ error: null }))
    const ocrInsertMock = vi.fn(async () => ({ error: null }))

    const fromMock = vi.fn((table: string) => {
      if (table === 'categories') {
        return {
          select: vi.fn(() => ({ eq: vi.fn(async () => ({ data: [{ id: 'cat-1', name: 'Mercado', category_type: 'expense', is_active: true }], error: null })) })),
        }
      }

      if (table === 'bank_statements') {
        return {
          insert: vi.fn(() => ({ select: vi.fn(() => ({ single: insertSingleMock })) })),
          update: vi.fn(() => ({ eq: updateEqMock })),
          delete: vi.fn(() => ({ eq: deleteEqMock })),
        }
      }

      if (table === 'ocr_extracted_transactions') {
        return { insert: ocrInsertMock }
      }

      return { insert: vi.fn() }
    })

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: fromMock,
      storage: {
        from: vi.fn(() => ({ upload: vi.fn(async () => ({ error: null })) })),
      },
    })

    const form = new FormData()
    form.set('statementFile', mockFile('extracto.pdf', 'application/pdf'))
    form.set('accountId', 'acc-1')

    await expect(uploadStatementAction(form)).rejects.toThrow('REDIRECT:/statements?saved=1')
    expect(revalidatePathMock).toHaveBeenCalledWith('/statements')
    expect(ocrInsertMock).toHaveBeenCalled()
  })
})

describe('confirmOcrDraftAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects invalid payload', async () => {
    const form = new FormData()
    form.set('rowId', '')
    await expect(confirmOcrDraftAction(form)).rejects.toThrow('REDIRECT:/statements?error=confirm-invalid-fields')
  })

  it('confirms draft into finance transaction', async () => {
    const updateEqMock = vi.fn(async () => ({ error: null }))
    const rpcMock = vi.fn(async () => ({ error: null }))

    const fromMock = vi.fn((table: string) => {
      if (table === 'ocr_extracted_transactions') {
        return {
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'row-1', user_id: 'user-1', statement_id: 'stmt-1', status: 'draft' }, error: null })) })) })),
          update: vi.fn(() => ({ eq: updateEqMock })),
        }
      }

      if (table === 'bank_statements') {
        return {
          select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'stmt-1', user_id: 'user-1', account_id: 'acc-1' }, error: null })) })) })),
        }
      }

      return {}
    })

    createSupabaseServerClientMock.mockResolvedValue({
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })) },
      from: fromMock,
      rpc: rpcMock,
    })

    const form = new FormData()
    form.set('rowId', 'row-1')
    form.set('accountId', '')
    form.set('categoryId', 'cat-1')
    form.set('direction', 'expense')
    form.set('amount', '35000')
    form.set('extractedDate', '2026-06-01')
    form.set('description', 'Mercado OCR')

    await expect(confirmOcrDraftAction(form)).rejects.toThrow('REDIRECT:/statements?confirmed=1')
    expect(rpcMock).toHaveBeenCalled()
    expect(revalidatePathMock).toHaveBeenCalledWith('/statements')
  })
})
