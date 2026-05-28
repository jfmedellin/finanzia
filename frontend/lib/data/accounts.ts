import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getAccounts() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('id,name,kind,current_balance,is_active')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) return []
  return data
}
