'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { ALLOWED_OCR_MIME_TYPES, TRANSACTION_TYPES } from '@/lib/constants'
import { parseStatementWithMockOcr } from '@/lib/ocr/mock-parser'

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 200)
}

function suggestCategoryId(description: string, categories: Array<{ id: string; name: string; category_type: string }>, direction: 'income' | 'expense' | 'transfer') {
  if (direction === 'transfer') return null
  const target = categories.filter((category) => category.category_type === direction)
  const lowered = description.toLowerCase()
  const match = target.find((category) => lowered.includes(category.name.toLowerCase()))
  return match?.id ?? target[0]?.id ?? null
}

export async function uploadStatementAction(formData: FormData): Promise<void> {
  const accountId = String(formData.get('accountId') ?? '').trim() || null
  const file = formData.get('statementFile')

  if (!(file instanceof File) || file.size <= 0) {
    redirect('/statements?error=file-required')
  }

  if (!ALLOWED_OCR_MIME_TYPES.has(file.type)) {
    redirect('/statements?error=invalid-file-type')
  }

  const { supabase, user } = await requireUser()

  const sanitizedFilename = sanitizeFilename(file.name)
  const pendingPath = `${user.id}/pending-${Date.now()}-${sanitizedFilename}`

  const statementInsert = await supabase
    .from('bank_statements')
    .insert({
      user_id: user.id,
      account_id: accountId,
      original_filename: file.name,
      mime_type: file.type,
      storage_bucket: 'statements',
      storage_path: pendingPath,
      status: 'uploaded',
    })
    .select('id')
    .single()

  if (statementInsert.error || !statementInsert.data) {
    redirect('/statements?error=operation-failed')
  }

  const statementId = statementInsert.data.id
  const storagePath = `${user.id}/${statementId}/${sanitizedFilename}`

  const uploadResult = await supabase.storage.from('statements').upload(storagePath, file, {
    upsert: false,
    contentType: file.type,
  })

  if (uploadResult.error) {
    await supabase.from('bank_statements').delete().eq('id', statementId)
    redirect('/statements?error=storage-failed')
  }

  const updateResult = await supabase
    .from('bank_statements')
    .update({
      storage_path: storagePath,
      status: 'processed',
    })
    .eq('id', statementId)

  if (updateResult.error) {
    redirect('/statements?error=operation-failed')
  }

  const draftRows = parseStatementWithMockOcr(file.name)
  if (draftRows.length > 0) {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id,name,category_type,is_active')
      .eq('is_active', true)

    if (categoriesError) {
      redirect('/statements?error=operation-failed')
    }

    const activeCategories = categories ?? []

    const payload = draftRows.map((row, idx) => ({
      user_id: user.id,
      statement_id: statementId,
      category_id: suggestCategoryId(row.description, activeCategories, row.direction),
      row_index: idx,
      raw_text: row.rawText,
      extracted_date: row.extractedDate,
      description: row.description,
      amount: row.amount,
      direction: row.direction,
      confidence: row.confidence,
      status: 'draft',
    }))

    const insertResult = await supabase.from('ocr_extracted_transactions').insert(payload)

    if (insertResult.error) {
      redirect('/statements?error=operation-failed')
    }
  }

  revalidatePath('/statements')
  redirect('/statements?saved=1')
}

export async function confirmOcrDraftAction(formData: FormData): Promise<void> {
  const rowId = String(formData.get('rowId') ?? '').trim()
  const accountIdInput = String(formData.get('accountId') ?? '').trim()
  const categoryId = String(formData.get('categoryId') ?? '').trim() || null
  const direction = String(formData.get('direction') ?? 'expense') as 'income' | 'expense' | 'transfer'
  const amount = Number(formData.get('amount') ?? 0)
  const happenedAt = String(formData.get('extractedDate') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!rowId || !description || !happenedAt || amount <= 0 || !TRANSACTION_TYPES.includes(direction as typeof TRANSACTION_TYPES[number])) {
    redirect('/statements?error=confirm-invalid-fields')
  }

  const { supabase, user } = await requireUser()

  const { data: row, error: rowError } = await supabase
    .from('ocr_extracted_transactions')
    .select('id,user_id,statement_id,status')
    .eq('id', rowId)
    .single()

  if (rowError || !row || row.user_id !== user.id || row.status !== 'draft') {
    redirect('/statements?error=confirm-not-found')
  }

  const { data: statement } = await supabase
    .from('bank_statements')
    .select('id,user_id,account_id')
    .eq('id', row.statement_id)
    .single()

  const accountId = accountIdInput || statement?.account_id
  if (!accountId) {
    redirect('/statements?error=confirm-account-required')
  }

  const { error: txError } = await supabase.rpc('create_finance_transaction', {
    p_account_id: accountId,
    p_to_account_id: null,
    p_category_id: categoryId,
    p_type: direction,
    p_amount: amount,
    p_happened_at: happenedAt,
    p_description: description,
  })

  if (txError) {
    redirect('/statements?error=confirm-operation-failed')
  }

  const updateResult = await supabase
    .from('ocr_extracted_transactions')
    .update({
      description,
      amount,
      direction,
      extracted_date: happenedAt,
      category_id: categoryId,
      status: 'confirmed',
    })
    .eq('id', rowId)

  if (updateResult.error) {
    redirect('/statements?error=confirm-operation-failed')
  }

  revalidatePath('/dashboard')
  revalidatePath('/statements')
  redirect('/statements?confirmed=1')
}
