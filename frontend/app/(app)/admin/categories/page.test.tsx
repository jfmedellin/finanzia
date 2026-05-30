import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/actions/categories', () => ({
  createCategoryAction: vi.fn(),
  updateCategoryAction: vi.fn(),
  toggleCategoryStatusAction: vi.fn(),
  deleteCategoryAction: vi.fn(),
}))

vi.mock('@/lib/data/categories', () => ({
  getCategoriesForAdmin: vi.fn(async () => [
    { id: 'sys-1', name: 'Salario', category_type: 'income', is_active: true, is_system: true },
    { id: 'own-1', name: 'Mascotas', category_type: 'expense', is_active: true, is_system: false },
  ]),
  getCategoryUsageForAdmin: vi.fn(async () =>
    new Map([
      ['sys-1', { transactions: 3, fixedExpenses: 0, rules: 1 }],
      ['own-1', { transactions: 1, fixedExpenses: 2, rules: 0 }],
    ]),
  ),
}))

import CategoriesAdminPage from '@/app/(app)/admin/categories/page'

describe('CategoriesAdminPage', () => {
  it('renders system and custom categories sections', async () => {
    const element = await CategoriesAdminPage({ searchParams: Promise.resolve({}) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Configuracion')
    expect(html).toContain('Nueva categoria')
    expect(html).toContain('Categorias del sistema')
    expect(html).toContain('Categorias personalizadas')
    expect(html).toContain('Salario')
    expect(html).toContain('Mascotas')
    expect(html).toContain('Desactivar')
    expect(html).toContain('Escribe ELIMINAR')
    expect(html).toContain('Uso: 1 mov. · 2 gastos fijos · 0 reglas')
    expect(html).toContain('Esta categoria tiene uso y no se puede eliminar; puedes desactivarla.')
  })
})
