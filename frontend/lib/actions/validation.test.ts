import { describe, expect, it } from 'vitest'
import { validateTransactionInput } from '@/lib/actions/validation'

describe('validateTransactionInput', () => {
  it('rejects invalid amount', () => {
    const result = validateTransactionInput({
      accountId: 'acc-1',
      type: 'expense',
      amount: 0,
      happenedAt: '2026-01-01',
      description: 'Test',
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Amount must be greater than zero.')
  })
})
