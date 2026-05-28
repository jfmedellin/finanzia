import { describe, expect, it } from 'vitest'
import { comparePeriods, filterTransactions, summarizeTransactions } from '@/lib/reports/metrics'

const txs = [
  { amount: 1000, transaction_type: 'income' as const, happened_at: '2026-06-02', account_id: 'a1' },
  { amount: 200, transaction_type: 'expense' as const, happened_at: '2026-06-04', account_id: 'a1' },
  { amount: 50, transaction_type: 'expense' as const, happened_at: '2026-05-30', account_id: 'a2' },
]

describe('reports metrics', () => {
  it('filters by period/account/type', () => {
    const filtered = filterTransactions(txs, { from: '2026-06-01', to: '2026-06-30', accountId: 'a1', type: 'expense' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].amount).toBe(200)
  })

  it('summarizes and compares periods', () => {
    const current = summarizeTransactions([{ amount: 1000, transaction_type: 'income', happened_at: '2026-06-01' }, { amount: 400, transaction_type: 'expense', happened_at: '2026-06-02' }])
    const previous = summarizeTransactions([{ amount: 500, transaction_type: 'income', happened_at: '2026-05-01' }, { amount: 200, transaction_type: 'expense', happened_at: '2026-05-02' }])
    const comparison = comparePeriods(current, previous)
    expect(current.net).toBe(600)
    expect(comparison.incomeDeltaPercent).toBeCloseTo(100, 1)
    expect(comparison.expenseDeltaPercent).toBeCloseTo(100, 1)
  })
})
