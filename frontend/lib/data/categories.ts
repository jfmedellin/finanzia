import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getActiveCategories() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,category_type,is_active')
    .eq('is_active', true)
    .in('category_type', ['expense', 'income'])
    .order('name', { ascending: true })

  if (error) return []
  return data
}
