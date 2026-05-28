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
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: fullName,
    currency_code: currencyCode,
  })

  if (error) {
    redirect('/onboarding?error=profile-save-failed')
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
