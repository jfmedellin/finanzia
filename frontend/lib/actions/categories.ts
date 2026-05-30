'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VALID_TYPES = new Set(['income', 'expense'])

function cleanName(value: FormDataEntryValue | null) {
  return String(value ?? '').trim()
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const name = cleanName(formData.get('name'))
  const categoryType = String(formData.get('categoryType') ?? 'expense')

  if (!name || !VALID_TYPES.has(categoryType)) {
    redirect('/admin/categories?error=invalid-fields')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name,
    category_type: categoryType,
    is_system: false,
    is_active: true,
  })

  if (error) {
    redirect('/admin/categories?error=create-failed')
  }

  revalidatePath('/admin/categories')
  revalidatePath('/dashboard')
  revalidatePath('/fixed-expenses')
  redirect('/admin/categories?saved=1')
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim()
  const name = cleanName(formData.get('name'))

  if (!id || !name) {
    redirect('/admin/categories?error=invalid-fields')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_system', false)

  if (error) {
    redirect('/admin/categories?error=update-failed')
  }

  revalidatePath('/admin/categories')
  revalidatePath('/dashboard')
  revalidatePath('/fixed-expenses')
  redirect('/admin/categories?updated=1')
}

export async function toggleCategoryStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim()
  const nextActive = String(formData.get('nextActive') ?? 'false') === 'true'

  if (!id) {
    redirect('/admin/categories?error=invalid-fields')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('categories')
    .update({ is_active: nextActive })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_system', false)

  if (error) {
    redirect('/admin/categories?error=status-failed')
  }

  revalidatePath('/admin/categories')
  revalidatePath('/dashboard')
  revalidatePath('/fixed-expenses')
  redirect('/admin/categories?updated=1')
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim()
  const confirm = String(formData.get('confirm') ?? '').trim().toUpperCase()

  if (!id || confirm !== 'ELIMINAR') {
    redirect('/admin/categories?error=invalid-fields')
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [transactionsRef, fixedExpensesRef, rulesRef] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('fixed_expenses').select('id', { count: 'exact', head: true }).eq('category_id', id),
    supabase.from('classification_rules').select('id', { count: 'exact', head: true }).eq('category_id', id),
  ])

  const references = (transactionsRef.count ?? 0) + (fixedExpensesRef.count ?? 0) + (rulesRef.count ?? 0)
  if (references > 0) {
    redirect('/admin/categories?error=in-use')
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('is_system', false)

  if (error) {
    redirect('/admin/categories?error=delete-failed')
  }

  revalidatePath('/admin/categories')
  revalidatePath('/dashboard')
  revalidatePath('/fixed-expenses')
  redirect('/admin/categories?deleted=1')
}
