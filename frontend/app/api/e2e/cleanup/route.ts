import { NextResponse } from 'next/server'
import { deleteCurrentUserForE2EAction } from '@/lib/actions/auth'

export async function POST() {
  const result = await deleteCurrentUserForE2EAction()
  return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
