import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/actions/savings', () => ({ createSavingsGoalAction: vi.fn() }))
vi.mock('@/lib/data/savings', () => ({
  getSavingsGoals: vi.fn(async () => [
    { id: 'sg-1', name: 'Fondo emergencia', target_amount: 1000, current_amount: 250, status: 'in_progress' },
    { id: 'sg-2', name: 'Viaje', target_amount: 2000, current_amount: 2000, status: 'completed' },
  ]),
}))

import SavingsPage from '@/app/(app)/savings/page'

describe('SavingsPage', () => {
  it('renders progress and percentages', async () => {
    const element = await SavingsPage({ searchParams: Promise.resolve({}) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Fondo emergencia')
    expect(html).toContain('Viaje')
    expect(html).toContain('25% completado')
    expect(html).toContain('100% completado')
  })

  it('renders error feedback message from query params', async () => {
    const element = await SavingsPage({ searchParams: Promise.resolve({ error: 'invalid-fields' }) })
    const html = renderToStaticMarkup(element)
    expect(html).toContain('No se pudo guardar. Revisa los campos e intenta de nuevo.')
  })
})
