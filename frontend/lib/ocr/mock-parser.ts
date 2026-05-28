export type MockOcrRow = {
  extractedDate: string
  description: string
  amount: number
  direction: 'income' | 'expense' | 'transfer'
  confidence: number
  rawText: string
}

export function parseStatementWithMockOcr(fileName: string): MockOcrRow[] {
  const lowered = fileName.toLowerCase()
  const isIncomeHint = lowered.includes('nomina') || lowered.includes('salary')

  return [
    {
      extractedDate: new Date().toISOString().slice(0, 10),
      description: isIncomeHint ? 'Ingreso detectado (mock OCR)' : 'Gasto detectado (mock OCR)',
      amount: isIncomeHint ? 1200000 : 85000,
      direction: isIncomeHint ? 'income' : 'expense',
      confidence: 0.82,
      rawText: `mock:${fileName}`,
    },
  ]
}
