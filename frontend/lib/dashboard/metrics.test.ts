import { describe, expect, it } from 'vitest'
import { computeDashboardMetrics } from '@/lib/dashboard/metrics'

describe('computeDashboardMetrics', () => {
  it('computes savings, income/expense deltas and category totals', () => {
    const metrics = computeDashboardMetrics(
      [{ current_balance: 1200 }, { current_balance: '800' }],
      [
        { id: 'cat-food', name: 'Comida' },
        { id: 'cat-salary', name: 'Salario' },
      ],
      [
        { happened_at: '2026-05-10', transaction_type: 'income', amount: 1000, category_id: 'cat-salary' },
        { happened_at: '2026-05-11', transaction_type: 'expense', amount: 300, category_id: 'cat-food' },
        { happened_at: '2026-04-12', transaction_type: 'income', amount: 900, category_id: 'cat-salary' },
        { happened_at: '2026-04-13', transaction_type: 'expense', amount: 200, category_id: 'cat-food' },
      ],
      new Date('2026-05-20T10:00:00.000Z'),
    )

    expect(metrics.totalBalance).toBe(2000)
    expect(metrics.savings).toBe(700)
    expect(metrics.currentIncome).toBe(1000)
    expect(metrics.currentExpenses).toBe(300)
    expect(metrics.previousIncome).toBe(900)
    expect(metrics.previousExpenses).toBe(200)
    expect(metrics.incomeDeltaPercent).toBeCloseTo(11.11, 1)
    expect(metrics.expenseDeltaPercent).toBeCloseTo(50, 1)
    expect(metrics.categoryTotals).toEqual([{ categoryId: 'cat-salary', categoryName: 'Salario', total: 1000 }, { categoryId: 'cat-food', categoryName: 'Comida', total: 300 }])
  })

  it('returns null deltas when previous month has no base', () => {
    const metrics = computeDashboardMetrics(
      [{ current_balance: 100 }],
      [{ id: 'cat-food', name: 'Comida' }],
      [{ happened_at: '2026-05-11', transaction_type: 'expense', amount: 30, category_id: 'cat-food' }],
      new Date('2026-05-20T10:00:00.000Z'),
    )

    expect(metrics.incomeDeltaPercent).toBeNull()
    expect(metrics.expenseDeltaPercent).toBeNull()
  })
})
