import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getFixedExpenses() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('fixed_expenses')
    .select('id,name,amount,recurrence,due_day,status,starts_on,ends_on,account_id,category_id')
    .order('due_day', { ascending: true })

  if (error) return []
  return data
}
