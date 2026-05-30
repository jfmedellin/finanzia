'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { validateTransactionInput, type TransactionInput } from '@/lib/actions/validation'

type ActionResult = { ok: boolean; error: string }

function mapRpcError(message: string | null | undefined): ActionResult {
  if (!message) return { ok: false, error: 'operation-failed' }

  if (message.startsWith('VALIDATION_')) {
    return { ok: false, error: `validation-${message.toLowerCase()}` }
  }

  if (message === 'AUTH_REQUIRED') {
    return { ok: false, error: 'auth-required' }
  }

  return { ok: false, error: 'operation-failed' }
}

export async function createTransactionAction(formData: FormData): Promise<void> {
  const input: TransactionInput = {
    accountId: String(formData.get('accountId') ?? ''),
    toAccountId: String(formData.get('toAccountId') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    type: String(formData.get('type') ?? 'expense') as TransactionInput['type'],
    amount: Number(formData.get('amount') ?? 0),
    happenedAt: String(formData.get('happenedAt') ?? ''),
    description: String(formData.get('description') ?? ''),
  }

  const validation = validateTransactionInput(input)
  if (!validation.valid) {
    redirect('/dashboard?error=invalid-amount-or-fields')
  }

  const { supabase } = await requireUser()

  const { error } = await supabase.rpc('create_finance_transaction', {
    p_account_id: input.accountId,
    p_to_account_id: input.toAccountId || null,
    p_category_id: input.categoryId || null,
    p_type: input.type,
    p_amount: input.amount,
    p_happened_at: input.happenedAt,
    p_description: input.description,
  })

  if (error) {
    const mapped = mapRpcError(error.message)
    if (mapped.error === 'auth-required') {
      redirect('/login')
    }
    redirect(`/dashboard?error=${mapped.error}`)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard?saved=1')
}
