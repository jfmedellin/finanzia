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

export async function getCategoriesForAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,category_type,is_active,is_system,created_at')
    .in('category_type', ['expense', 'income'])
    .order('is_system', { ascending: false })
    .order('name', { ascending: true })

  if (error) return []
  return data
}

export async function getCategoryUsageForAdmin() {
  const supabase = await createSupabaseServerClient()

  const [transactionsResult, fixedExpensesResult, rulesResult] = await Promise.all([
    supabase.from('transactions').select('category_id').not('category_id', 'is', null),
    supabase.from('fixed_expenses').select('category_id').not('category_id', 'is', null),
    supabase.from('classification_rules').select('category_id').not('category_id', 'is', null),
  ])

  const usage = new Map<string, { transactions: number; fixedExpenses: number; rules: number }>()

  if (!transactionsResult.error) {
    for (const row of transactionsResult.data ?? []) {
      const categoryId = row.category_id as string | null
      if (!categoryId) continue
      const current = usage.get(categoryId) ?? { transactions: 0, fixedExpenses: 0, rules: 0 }
      current.transactions += 1
      usage.set(categoryId, current)
    }
  }

  if (!fixedExpensesResult.error) {
    for (const row of fixedExpensesResult.data ?? []) {
      const categoryId = row.category_id as string | null
      if (!categoryId) continue
      const current = usage.get(categoryId) ?? { transactions: 0, fixedExpenses: 0, rules: 0 }
      current.fixedExpenses += 1
      usage.set(categoryId, current)
    }
  }

  if (!rulesResult.error) {
    for (const row of rulesResult.data ?? []) {
      const categoryId = row.category_id as string | null
      if (!categoryId) continue
      const current = usage.get(categoryId) ?? { transactions: 0, fixedExpenses: 0, rules: 0 }
      current.rules += 1
      usage.set(categoryId, current)
    }
  }

  return usage
}
