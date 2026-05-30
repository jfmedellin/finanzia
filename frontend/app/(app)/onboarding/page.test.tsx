import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/lib/actions/auth', () => ({ upsertProfileAction: vi.fn() }))

import OnboardingPage from '@/app/(app)/onboarding/page'

describe('OnboardingPage', () => {
  it('renders accessible profile save errors from query params', async () => {
    const element = await OnboardingPage({ searchParams: Promise.resolve({ error: 'invalid-currency-code' }) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('La moneda base solo puede ser USD o COP.')
    expect(html).toContain('role="alert"')
    expect(html).toContain('id="onboarding-form-error"')
    expect(html).toContain('aria-describedby="onboarding-form-error"')
  })
})
