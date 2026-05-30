export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function progressPercent(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

export function transactionLabel(type: 'income' | 'expense' | 'transfer'): string {
  if (type === 'income') return 'Ingreso'
  if (type === 'expense') return 'Gasto'
  return 'Transferencia'
}
