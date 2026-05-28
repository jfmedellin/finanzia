'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createSavingsGoalAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim()
  const targetAmount = Number(formData.get('targetAmount') ?? 0)
  const currentAmount = Number(formData.get('currentAmount') ?? 0)
  const targetDateRaw = String(formData.get('targetDate') ?? '').trim()
  const status = String(formData.get('status') ?? 'in_progress')

  if (!name || targetAmount <= 0 || currentAmount < 0 || currentAmount > targetAmount || !['in_progress', 'completed', 'paused'].includes(status)) {
    redirect('/savings?error=invalid-fields')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
