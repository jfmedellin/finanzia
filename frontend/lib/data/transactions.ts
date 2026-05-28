import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getRecentTransactions(limit = 10) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('id,transaction_type,amount,description,happened_at')
    .order('happened_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}
