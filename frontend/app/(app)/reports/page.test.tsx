import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/data/accounts', () => ({ getAccounts: vi.fn(async () => [{ id: 'a1', name: 'Cuenta 1' }]) }))
vi.mock('@/lib/data/reports', () => ({
  getTransactionsForReports: vi.fn(async () => [
    { id: 't1', account_id: 'a1', transaction_type: 'income', amount: 1000, description: 'Pago', happened_at: '2026-06-10' },
    { id: 't2', account_id: 'a1', transaction_type: 'expense', amount: 300, description: 'Mercado', happened_at: '2026-06-12' },
  ]),
}))

import ReportsPage from '@/app/(app)/reports/page'

describe('ReportsPage', () => {
  it('renders report sections and comparison', async () => {
    const element = await ReportsPage({ searchParams: Promise.resolve({ from: '2026-06-01', to: '2026-06-30' }) })
    const html = renderToStaticMarkup(element)
    expect(html).toContain('Reportes financieros')
    expect(html).toContain('Comparación con período anterior')
    expect(html).toContain('Movimientos del período')
    expect(html).toContain('Pago')
  })

  it('renders empty-state for period without rows', async () => {
    const element = await ReportsPage({ searchParams: Promise.resolve({ from: '2026-01-01', to: '2026-01-31' }) })
    const html = renderToStaticMarkup(element)
    expect(html).toContain('No hay movimientos para el filtro seleccionado.')
  })
})
