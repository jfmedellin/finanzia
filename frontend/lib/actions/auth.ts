'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/login?error=invalid-credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUpAction(formData: FormData): Promise<void> {
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  if (!hasSupabaseEnv) {
    redirect('/register?error=server-unavailable')
  }

  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    redirect('/register?error=signup-failed')
  }

  redirect('/login?registered=1')
}

export async function requestPasswordRecoveryAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) {
    redirect('/forgot-password?error=recovery-failed')
  }

  redirect('/forgot-password?sent=1')
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function upsertProfileAction(formData: FormData): Promise<void> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const currencyCode = String(formData.get('currencyCode') ?? 'USD').trim().toUpperCase()
  const allowedCurrencyCodes = new Set(['USD', 'COP'])

  if (!fullName) {
    redirect('/onboarding?error=invalid-profile')
  }

  if (!allowedCurrencyCodes.has(currencyCode)) {
    redirect('/onboarding?error=invalid-currency-code')
  }

  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      user_id: user.id,
      email: user.email ?? '',
      full_name: fullName,
      currency_code: currencyCode,
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    console.error('Profile upsert failed', {
      code: error.code,
      message: error.message,
      details: error.details,
    })
    redirect('/onboarding?error=profile-save-failed')
  }

  revalidatePath('/dashboard')
  revalidatePath('/onboarding')
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function deleteCurrentUserForE2EAction(): Promise<{ success: boolean; error?: string }> {
  // Only allow in E2E test environments
  if (process.env.E2E_ALLOW_USER_SELF_DELETE !== 'true') {
    return { success: false, error: 'E2E cleanup not enabled' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase.rpc('e2e_delete_current_user')

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
