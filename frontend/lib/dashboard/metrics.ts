type AccountLike = { current_balance: number | string | null }

type CategoryLike = {
  id: string
  name: string
}

type TransactionLike = {
  amount: number | string
  happened_at: string
  transaction_type: 'income' | 'expense' | 'transfer'
  category_id?: string | null
}

export type CategoryPeriodTotal = {
  categoryId: string
  categoryName: string
  total: number
}

export type DashboardMetrics = {
  totalBalance: number
  currentIncome: number
  previousIncome: number
  currentExpenses: number
  previousExpenses: number
  savings: number
  incomeDeltaPercent: number | null
  expenseDeltaPercent: number | null
  categoryTotals: CategoryPeriodTotal[]
}

function isSameMonth(date: Date, month: number, year: number) {
  return date.getMonth() === month && date.getFullYear() === year
}

function percentDelta(current: number, previous: number) {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

export function computeDashboardMetrics(
  accounts: AccountLike[],
  categories: CategoryLike[],
  transactions: TransactionLike[],
  referenceDate = new Date(),
): DashboardMetrics {
  const currentMonth = referenceDate.getMonth()
  const currentYear = referenceDate.getFullYear()
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)

  const totalBalance = accounts.reduce((acc, account) => acc + Number(account.current_balance ?? 0), 0)

  const currentMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.happened_at)
    return isSameMonth(date, currentMonth, currentYear)
  })

  const previousMonthTransactions = transactions.filter((tx) => {
    const date = new Date(tx.happened_at)
    return isSameMonth(date, previousMonthDate.getMonth(), previousMonthDate.getFullYear())
  })

  const currentIncome = currentMonthTransactions
    .filter((tx) => tx.transaction_type === 'income')
    .reduce((acc, tx) => acc + Number(tx.amount), 0)
  const currentExpenses = currentMonthTransactions
    .filter((tx) => tx.transaction_type === 'expense')
    .reduce((acc, tx) => acc + Number(tx.amount), 0)
  const previousIncome = previousMonthTransactions
    .filter((tx) => tx.transaction_type === 'income')
    .reduce((acc, tx) => acc + Number(tx.amount), 0)
  const previousExpenses = previousMonthTransactions
    .filter((tx) => tx.transaction_type === 'expense')
    .reduce((acc, tx) => acc + Number(tx.amount), 0)

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))
  const categoryTotalsMap = new Map<string, number>()

  for (const tx of currentMonthTransactions) {
    if (tx.transaction_type !== 'expense' && tx.transaction_type !== 'income') continue
    if (!tx.category_id) continue
    categoryTotalsMap.set(tx.category_id, (categoryTotalsMap.get(tx.category_id) ?? 0) + Number(tx.amount))
  }

  const categoryTotals = Array.from(categoryTotalsMap.entries())
    .map(([categoryId, total]) => ({
      categoryId,
      categoryName: categoryNameById.get(categoryId) ?? 'Categoria sin nombre',
      total,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    totalBalance,
    currentIncome,
    previousIncome,
    currentExpenses,
    previousExpenses,
    savings: currentIncome - currentExpenses,
    incomeDeltaPercent: percentDelta(currentIncome, previousIncome),
    expenseDeltaPercent: percentDelta(currentExpenses, previousExpenses),
    categoryTotals,
  }
}
