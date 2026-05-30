import { expect, test, type Page } from '@playwright/test'

const E2E_AUTH_EMAIL = process.env.E2E_AUTH_EMAIL ?? 'e2e-auth-user@finanzia.dev'
const E2E_AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD ?? 'FinanzIA123!'

async function ensureDashboardReady(page: Page) {
  if (!/\/onboarding/.test(page.url())) {
    return
  }

  await page.locator('input[name="fullName"]').fill('E2E FinanzIA User')
  await page.locator('select[name="currencyCode"]').selectOption('COP')
  await page.getByRole('button', { name: /guardar perfil/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test('register and login flow works', async ({ page }, testInfo) => {
  await page.goto('/register')

  await page.locator('input[name="email"]').fill(E2E_AUTH_EMAIL)
  await page.locator('input[name="password"]').fill(E2E_AUTH_PASSWORD)
  await page.getByRole('button', { name: /crear cuenta|registrarme/i }).click()

  await expect(page).toHaveURL(/\/(login\?registered=1|dashboard|onboarding|register\?error=signup-failed)/)

  await page.context().clearCookies()
  await page.goto('/login')

  await page.locator('input[name="email"]').fill(E2E_AUTH_EMAIL)
  await page.locator('input[name="password"]').fill(E2E_AUTH_PASSWORD)
  await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click()

  await expect(page).toHaveURL(/\/(dashboard|onboarding)/)
  await ensureDashboardReady(page)

  await page.goto('/dashboard')
  await ensureDashboardReady(page)
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: /panel financiero inteligente/i })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath(`dashboard-${testInfo.project.name}.png`), fullPage: true })

  // Cleanup: delete the test user via API
  const cleanupResponse = await page.request.post('/api/e2e/cleanup')
  const cleanupResult = await cleanupResponse.json()
  
  // Log error if cleanup failed for debugging
  if (!cleanupResult.success) {
    console.error('Cleanup failed:', cleanupResult.error)
  }
  
  expect(cleanupResult.success).toBe(true)

  // Verify user is deleted by trying to login again (should fail)
  await page.context().clearCookies()
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(E2E_AUTH_EMAIL)
  await page.locator('input[name="password"]').fill(E2E_AUTH_PASSWORD)
  await page.getByRole('button', { name: /iniciar sesión|entrar/i }).click()

  // Should redirect to login with error since user no longer exists
  await expect(page).toHaveURL(/\/login\?error=invalid-credentials/)
})
