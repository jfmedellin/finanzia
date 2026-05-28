# FinanzIA

Personal finance app with AI-powered insights. Built with Next.js 16, Supabase SSR auth, and Tailwind CSS.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Auth**: Supabase SSR with middleware-based session refresh
- **Database**: Supabase (Postgres) with RLS policies and RPC functions
- **Testing**: Vitest

## Project Structure

```
FinanzIA/
├── frontend/          Next.js app with auth, dashboard, and transaction management
│   ├── app/           App Router pages and layouts
│   ├── lib/           Server Actions, data access, Supabase client
│   └── middleware.ts  Supabase SSR session refresh
├── supabase/          Database schema and migrations
│   ├── migrations/    RLS policies, RPC functions, schema
│   ├── tests/         Database integration tests
│   ├── functions/     Edge functions
│   └── seed/          Seed data
├── backend/ocr/       OCR service placeholder (future)
└── docker-compose.yml Local development orchestration
```

## Features

- **Auth**: Email/password signup, login, logout, password recovery
- **Dashboard**: Transaction creation form (income/expense/transfer), recent transactions list
- **Accounts**: Multi-account support
- **Categories**: Income and expense categories with type validation
- **RLS**: Row-level security on all tables, owner-scoped policies

## Quick Start

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Run Supabase migrations:
   ```bash
   supabase db push
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

From `frontend/`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run Vitest tests |

## Verification

All checks pass:
- `npm run lint` — no errors
- `npm run typecheck` — no errors
- `npm run test` — 10 tests passing
- `npm run build` — successful
