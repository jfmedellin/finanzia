import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        navy: {
          950: 'hsl(var(--navy-950))',
          900: 'hsl(var(--navy-900))',
          700: 'hsl(var(--navy-700))',
          50: 'hsl(var(--navy-50))',
        },
        emerald: {
          500: 'hsl(var(--emerald-500))',
          600: 'hsl(var(--emerald-600))',
          700: 'hsl(var(--emerald-700))',
          800: 'hsl(var(--emerald-800))',
          50: 'hsl(var(--emerald-50))',
        },
        coral: {
          500: 'hsl(var(--coral-500))',
          700: 'hsl(var(--coral-700))',
          50: 'hsl(var(--coral-50))',
        },
        slateSoft: 'hsl(var(--slate-soft))',
      },
      borderRadius: {
        card: '1rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        card: '0 4px 20px rgba(26, 43, 60, 0.05)',
        cardHover: '0 12px 32px rgba(26, 43, 60, 0.12)',
        ai: '0 18px 46px rgba(26, 43, 60, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        shell: '80rem',
      },
    },
  },
  plugins: [],
}

export default config
