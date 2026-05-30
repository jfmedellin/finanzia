'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { FIXED_EXPENSE_RECURRENCES, FIXED_EXPENSE_STATUSES } from '@/lib/constants'

export async function createFixedExpenseAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim()
  const amount = Number(formData.get('amount') ?? 0)
  const recurrence = String(formData.get('recurrence') ?? 'monthly')
  const dueDay = Number(formData.get('dueDay') ?? 0)
  const status = String(formData.get('status') ?? 'pending')
  const startsOn = String(formData.get('startsOn') ?? '')
  const endsOnRaw = String(formData.get('endsOn') ?? '').trim()
  const accountIdRaw = String(formData.get('accountId') ?? '').trim()
  const categoryId = String(formData.get('categoryId') ?? '').trim()

  if (!name || !categoryId || !startsOn || amount <= 0 || dueDay < 1 || dueDay > 31 || !FIXED_EXPENSE_RECURRENCES.includes(recurrence as typeof FIXED_EXPENSE_RECURRENCES[number]) || !FIXED_EXPENSE_STATUSES.includes(status as typeof FIXED_EXPENSE_STATUSES[number])) {
    redirect('/fixed-expenses?error=invalid-fields')
  }

  const { supabase, user } = await requireUser()

  const { error } = await supabase.from('fixed_expenses').insert({
    user_id: user.id,
    account_id: accountIdRaw || null,
    category_id: categoryId,
    name,
    amount,
    recurrence,
    due_day: dueDay,
    status,
    starts_on: startsOn,
    ends_on: endsOnRaw || null,
  })

  if (error) {
    redirect('/fixed-expenses?error=operation-failed')
  }

  revalidatePath('/fixed-expenses')
  redirect('/fixed-expenses?saved=1')
}
