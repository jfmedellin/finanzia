import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/actions/fixed-expenses', () => ({ createFixedExpenseAction: vi.fn() }))
vi.mock('@/lib/data/accounts', () => ({ getAccounts: vi.fn(async () => [{ id: 'acc-1', name: 'Cuenta 1' }]) }))
vi.mock('@/lib/data/categories', () => ({
  getActiveCategories: vi.fn(async () => [
    { id: 'cat-1', name: 'Arriendo', category_type: 'expense' },
    { id: 'cat-2', name: 'Salario', category_type: 'income' },
  ]),
}))
vi.mock('@/lib/data/fixed-expenses', () => ({
  getFixedExpenses: vi.fn(async () => [
    { id: 'fx-1', name: 'Arriendo', amount: 1000, recurrence: 'monthly', due_day: 5, status: 'pending' },
    { id: 'fx-2', name: 'Internet', amount: 100, recurrence: 'monthly', due_day: 10, status: 'paid' },
    { id: 'fx-3', name: 'Seguro', amount: 200, recurrence: 'monthly', due_day: 20, status: 'overdue' },
  ]),
}))

import FixedExpensesPage from '@/app/(app)/fixed-expenses/page'
import { getActiveCategories } from '@/lib/data/categories'

const getActiveCategoriesMock = vi.mocked(getActiveCategories)

describe('FixedExpensesPage', () => {
  it('renders fixed-expense states paid/pending/overdue', async () => {
    const element = await FixedExpensesPage({ searchParams: Promise.resolve({}) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Pendiente')
    expect(html).toContain('Pagado')
    expect(html).toContain('Vencido')
    expect(html).toContain('Registrar gasto fijo')
    expect(html).toContain('Valor en COP (pesos colombianos).')
    expect(html).toContain('Inicio de vigencia')
    expect(html).toContain('Fin de vigencia (opcional)')
  })

  it('shows guidance when there are no active expense categories', async () => {
    getActiveCategoriesMock.mockResolvedValueOnce([{ id: 'cat-2', name: 'Salario', category_type: 'income', is_active: true }])

    const element = await FixedExpensesPage({ searchParams: Promise.resolve({}) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Sin categorias de gasto activas')
    expect(html).toContain('No tienes categorias de tipo gasto activas. Crea o activa una categoria desde')
    expect(html).toContain('Configuracion &gt; Categorias')
    expect(html).toContain('Guardar gasto fijo')
    expect(html).toContain('disabled')
  })
})
