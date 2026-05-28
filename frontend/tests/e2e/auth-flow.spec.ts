import { expect, test } from '@playwright/test'

const E2E_AUTH_EMAIL = process.env.E2E_AUTH_EMAIL ?? 'e2e-auth-user@finanzia.dev'
const E2E_AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD ?? 'FinanzIA123!'

test('register and login flow works', async ({ page }) => {
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
