import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

function loadEnvFromFile(fileName: string) {
  const fullPath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(fullPath)) return

  const content = fs.readFileSync(fullPath, 'utf-8')
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const sepIndex = trimmed.indexOf('=')
    if (sepIndex <= 0) return
    const key = trimmed.slice(0, sepIndex).trim()
    const value = trimmed.slice(sepIndex + 1).trim()
    if (!process.env[key]) process.env[key] = value
  })
}

loadEnvFromFile('.env.local')

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      ...process.env,
      E2E_DISABLE_SUPABASE_PROXY: 'true',
      E2E_ALLOW_USER_SELF_DELETE: 'true',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
})
