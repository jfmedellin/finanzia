'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { SAVINGS_GOAL_STATUSES } from '@/lib/constants'

export async function createSavingsGoalAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim()
  const targetAmount = Number(formData.get('targetAmount') ?? 0)
  const currentAmount = Number(formData.get('currentAmount') ?? 0)
  const targetDateRaw = String(formData.get('targetDate') ?? '').trim()
  const status = String(formData.get('status') ?? 'in_progress')

  if (!name || targetAmount <= 0 || currentAmount < 0 || currentAmount > targetAmount || !SAVINGS_GOAL_STATUSES.includes(status as typeof SAVINGS_GOAL_STATUSES[number])) {
    redirect('/savings?error=invalid-fields')
  }

  const { supabase, user } = await requireUser()

  const { error } = await supabase.from('savings_goals').insert({
    user_id: user.id,
    name,
    target_amount: targetAmount,
    current_amount: currentAmount,
    target_date: targetDateRaw || null,
    status,
  })

  if (error) {
    redirect('/savings?error=operation-failed')
  }

  revalidatePath('/savings')
  redirect('/savings?saved=1')
}
