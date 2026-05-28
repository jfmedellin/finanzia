'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VALID_RECURRENCES = new Set(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
const VALID_STATUSES = new Set(['paid', 'pending', 'overdue'])

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

  if (!name || !categoryId || !startsOn || amount <= 0 || dueDay < 1 || dueDay > 31 || !VALID_RECURRENCES.has(recurrence) || !VALID_STATUSES.has(status)) {
    redirect('/fixed-expenses?error=invalid-fields')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
