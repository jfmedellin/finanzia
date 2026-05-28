import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
}))

vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/lib/actions/finance', () => ({ createTransactionAction: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: 'user-1' } })) })),
      })),
    })),
  })),
}))

vi.mock('@/lib/data/accounts', () => ({
  getAccounts: vi.fn(async () => [{ id: 'acc-1', name: 'Caja', current_balance: 2000 }]),
}))

vi.mock('@/lib/data/categories', () => ({
  getActiveCategories: vi.fn(async () => [
    { id: 'cat-food', name: 'Comida', category_type: 'expense' },
    { id: 'cat-salary', name: 'Salario', category_type: 'income' },
  ]),
}))

vi.mock('@/lib/data/transactions', () => ({
  getRecentTransactions: vi.fn(async () => [
    { id: 'tx-1', transaction_type: 'income', amount: 1000, description: 'Pago', happened_at: '2026-05-11', category_id: 'cat-salary' },
    { id: 'tx-2', transaction_type: 'expense', amount: 300, description: 'Mercado', happened_at: '2026-05-10', category_id: 'cat-food' },
    { id: 'tx-3', transaction_type: 'income', amount: 900, description: 'Pago', happened_at: '2026-04-11', category_id: 'cat-salary' },
    { id: 'tx-4', transaction_type: 'expense', amount: 200, description: 'Mercado', happened_at: '2026-04-10', category_id: 'cat-food' },
  ]),
}))

import DashboardPage from '@/app/(app)/dashboard/page'

describe('DashboardPage', () => {
  it('renders savings, comparison and category totals sections', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T10:00:00.000Z'))
    const element = await DashboardPage({ searchParams: Promise.resolve({}) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Ahorro del mes')
    expect(html).toContain('Comparativo mensual')
    expect(html).toContain('Totales por categoria (mes actual)')
    expect(html).toContain('Salario')
    expect(html).toContain('Comida')
    vi.useRealTimers()
  })

  it('associates form fields with validation alert', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T10:00:00.000Z'))
    const element = await DashboardPage({ searchParams: Promise.resolve({ error: 'operation-failed' }) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('id="dashboard-form-error"')
    expect(html).toContain('aria-describedby="dashboard-form-error"')
    vi.useRealTimers()
  })
})
