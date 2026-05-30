import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinanzIA',
  description: 'AI-assisted personal finance MVP foundation',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const k = 'finanzia-theme'; const s = localStorage.getItem(k); const d = window.matchMedia('(prefers-color-scheme: dark)').matches; const t = (s === 'light' || s === 'dark') ? s : (d ? 'dark' : 'light'); if (t === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); } catch (_) {} })();`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
