import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/actions/ocr', () => ({ uploadStatementAction: vi.fn(), confirmOcrDraftAction: vi.fn() }))
vi.mock('@/lib/data/accounts', () => ({ getAccounts: vi.fn(async () => [{ id: 'acc-1', name: 'Cuenta Principal' }]) }))
vi.mock('@/lib/data/categories', () => ({ getActiveCategories: vi.fn(async () => [{ id: 'cat-1', name: 'Mercado', category_type: 'expense' }]) }))
vi.mock('@/lib/data/statements', () => ({
  getStatementUploads: vi.fn(async () => [{ id: 's1', original_filename: 'extracto.pdf', mime_type: 'application/pdf', status: 'processed' }]),
  getOcrDraftRows: vi.fn(async () => [{ id: 'r1', description: 'Compra', amount: 10000, direction: 'expense', confidence: 0.9, extracted_date: '2026-06-01', category_id: null }]),
}))

import StatementsPage from '@/app/(app)/statements/page'

describe('StatementsPage', () => {
  it('renders upload and draft sections', async () => {
    const element = await StatementsPage({ searchParams: Promise.resolve({}) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Cargar extracto')
    expect(html).toContain('Extractos cargados')
    expect(html).toContain('Borradores OCR')
    expect(html).toContain('extracto.pdf')
    expect(html).toContain('Compra')
  })
})
