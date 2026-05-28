export type TransactionType = 'income' | 'expense' | 'transfer'

export type TransactionInput = {
  accountId: string
  toAccountId?: string
  categoryId?: string
  type: TransactionType
  amount: number
  happenedAt: string
  description: string
}

export function validateTransactionInput(input: TransactionInput) {
  const errors: string[] = []

  if (!input.accountId) errors.push('Account is required.')
  if (!['income', 'expense', 'transfer'].includes(input.type)) errors.push('Transaction type is invalid.')
  if (!Number.isFinite(input.amount) || input.amount <= 0) errors.push('Amount must be greater than zero.')
  if (!input.happenedAt) errors.push('Date is required.')
  if (!input.description?.trim()) errors.push('Description is required.')

  if (input.type === 'transfer') {
    if (!input.toAccountId) errors.push('Destination account is required for transfers.')
    if (input.toAccountId === input.accountId) errors.push('Source and destination accounts must be different.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
