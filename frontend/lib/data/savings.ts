import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getSavingsGoals() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('savings_goals')
    .select('id,name,target_amount,current_amount,target_date,status')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
