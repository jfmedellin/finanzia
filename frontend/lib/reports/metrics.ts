type TransactionLike = {
  id?: string
  amount: number | string
  transaction_type: 'income' | 'expense' | 'transfer'
  happened_at: string
  account_id?: string | null
  description?: string | null
}

export type ReportFilters = {
  from: string
  to: string
  accountId?: string
  type?: 'income' | 'expense' | 'transfer'
}

export function filterTransactions(transactions: TransactionLike[], filters: ReportFilters) {
  const fromDate = new Date(filters.from)
  const toDate = new Date(filters.to)

  return transactions.filter((tx) => {
    const date = new Date(tx.happened_at)
    const inRange = date >= fromDate && date <= toDate
    const accountOk = filters.accountId ? tx.account_id === filters.accountId : true
    const typeOk = filters.type ? tx.transaction_type === filters.type : true
    return inRange && accountOk && typeOk
  })
}

export function summarizeTransactions(transactions: TransactionLike[]) {
  const income = transactions.filter((tx) => tx.transaction_type === 'income').reduce((acc, tx) => acc + Number(tx.amount), 0)
  const expense = transactions.filter((tx) => tx.transaction_type === 'expense').reduce((acc, tx) => acc + Number(tx.amount), 0)
  return {
    income,
    expense,
    net: income - expense,
    total: transactions.length,
  }
}

export function comparePeriods(current: ReturnType<typeof summarizeTransactions>, previous: ReturnType<typeof summarizeTransactions>) {
  const delta = (actual: number, base: number) => (base > 0 ? ((actual - base) / base) * 100 : null)
  return {
    incomeDeltaPercent: delta(current.income, previous.income),
    expenseDeltaPercent: delta(current.expense, previous.expense),
  }
}
