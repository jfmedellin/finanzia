import { expect, test } from '@playwright/test'

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /iniciar sesión|login/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
})

test('register page renders', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByRole('heading')).toBeVisible()
  await expect(page.getByRole('button', { name: /registrarme/i })).toBeVisible()
})

test('responsive smoke for public home', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/FinanzIA/i)
})
