export const TRANSACTION_TYPES = ['income', 'expense', 'transfer'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const FIXED_EXPENSE_STATUSES = ['paid', 'pending', 'overdue'] as const
export type FixedExpenseStatus = (typeof FIXED_EXPENSE_STATUSES)[number]

export const FIXED_EXPENSE_RECURRENCES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] as const
export type FixedExpenseRecurrence = (typeof FIXED_EXPENSE_RECURRENCES)[number]

export const SAVINGS_GOAL_STATUSES = ['in_progress', 'completed', 'paused'] as const
export type SavingsGoalStatus = (typeof SAVINGS_GOAL_STATUSES)[number]

export const ALLOWED_OCR_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])
