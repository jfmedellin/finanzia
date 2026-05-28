import { describe, expect, it } from 'vitest'
import { parseStatementWithMockOcr } from '@/lib/ocr/mock-parser'

describe('parseStatementWithMockOcr', () => {
  it('returns deterministic expense draft for generic statement name', () => {
    const rows = parseStatementWithMockOcr('extracto-junio.pdf')
    expect(rows).toHaveLength(1)
    expect(rows[0].direction).toBe('expense')
    expect(rows[0].amount).toBe(85000)
    expect(rows[0].rawText).toContain('mock:extracto-junio.pdf')
  })

  it('returns deterministic income draft when salary hint exists', () => {
    const rows = parseStatementWithMockOcr('nomina-mayo.png')
    expect(rows).toHaveLength(1)
    expect(rows[0].direction).toBe('income')
    expect(rows[0].amount).toBe(1200000)
  })
})
