# Design: Build FinanzIA MVP

## Technical Approach

Build FinanzIA local-first as a separated `/frontend` + `/backend` MVP. `/frontend` is a Next.js 14+ App Router app using Server Components for read-heavy finance screens, Server Actions for trusted mutations, Route Handlers only for upload/OCR boundaries, Tailwind, and shadcn/ui-style components. `/backend/ocr` owns statement extraction. Supabase PostgreSQL/Auth/Storage/RLS is the security boundary: user data remains tenant-scoped by `auth.uid()`, and statement files live in private Storage paths. No application source exists yet, so this design defines future paths only.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Repo shape | Monorepo-style root with `/frontend`, `/backend/ocr`, `/supabase` | Single Next app; separate repos | Keeps practicum setup simple while preserving frontend/backend boundaries. |
| Rendering/data | Next App Router server-first | Client-only SPA; Pages Router | App Router supports `app` routing, layouts, RSC, Suspense/streaming, colocated async data fetching, `cache: 'no-store'` for dynamic finance data, and `'use server'` mutations. |
| Security | Supabase RLS-first | App-only authorization | RLS with `auth.uid()` protects every table/API path; frontend never receives service-role secrets. |
| Statements | Private bucket + user-scoped object paths | Public bucket; database blobs | Private financial documents require Storage RLS over `storage.objects`, e.g. `statements/{userId}/{statementId}`. |
| OCR | Backend service stages rows, review-before-confirm | Direct auto-import; frontend OCR | OCR confidence varies; reviewed drafts prevent bad transactions and keep heavy parsing out of UI. |
| UI system | shadcn-style components + `frontend-design` direction + Stitch mockups | Raw Tailwind only; component kit lock-in; design without mockup source | shadcn/ui gives accessible Radix primitives, Tailwind/CSS-variable theming, aliases, and RSC config via `components.json` while staying customizable. Stitch project `Smart Finance AI Manager` is the visual source of truth for layout, tokens, and screen references. |
| Stitch source | Use `projects/16421650138318590896` / `Smart Finance AI Manager` | Recreate visual system from memory | The Stitch MCP connection is verified and exposes desktop and mobile mockups plus design tokens for FinanzaIA: light corporate/modern finance UI, deep navy `#1A2B3C`, emerald `#2ECC71`, soft slate surfaces, 8px spacing, 12-column desktop and 4-column mobile grid. |
| Local env | Docker Compose local stack | Manual setup only; cloud deploy | Reproducible university demo; cloud deployment is out of scope. |

## Data Flow

Auth: `Login/Register UI -> Supabase Auth -> session cookies -> protected App Router layouts -> profile row (RLS auth.uid())`

Dashboard: `Server Component -> data access layer -> Supabase views/tables -> metric cards/charts -> Suspense empty/loading states`

Transaction CRUD: `Form -> Server Action create/update/deleteTransaction -> validate -> Supabase table under RLS -> revalidate dashboard/report routes`

OCR: `Upload form -> private Storage object -> Route Handler enqueue/process -> /backend/ocr extract -> ocr_batches + ocr_rows(draft) -> review UI -> confirmOcrRows -> transactions`

UI source: `Stitch Smart Finance AI Manager -> design tokens/screens -> frontend-design interpretation -> shadcn/Tailwind theme -> responsive FinanzIA screens`

## File Changes

| File | Action | Description |
|---|---|---|
| `/frontend` | Create | Next.js App Router application root. |
| `/frontend/app/(public)` and `/frontend/app/(app)` | Create | Auth/public pages and protected dashboard shell. |
| `/frontend/components.json` | Create | shadcn/ui Tailwind, alias, CSS variable, RSC settings. |
| `/frontend/app/globals.css` and `/frontend/tailwind.config.ts` | Create | Implement Stitch-derived tokens: deep navy, emerald accent, soft slate surfaces, 8px spacing, Inter typography, radius scale. |
| Stitch `projects/16421650138318590896` | Reference | Source mockups/design system for Smart Finance AI Manager. |
| `/frontend/lib/actions/*` | Create | Internal Server Actions for auth/profile/finance/OCR review. |
| `/frontend/lib/data/*` | Create | Server-only reads for dashboard, reports, CRUD. |
| `/backend/ocr` | Create | OCR extraction service/module and tests. |
| `/supabase/migrations/*` | Create | Tables, RLS policies, Storage bucket/policies, views. |
| `/docker-compose.yml` | Create | Local frontend, OCR/backend, and Supabase-related services. |
| `openspec/changes/build-finanzia-mvp/design.md` | Create | This design artifact. |

## Interfaces / Contracts

Actions/handlers: `signIn`, `signOut`, `upsertProfile`, `createTransaction`, `updateTransaction`, `deleteTransaction`, `createFixedExpense`, `updateSavingsGoal`, `uploadStatement`, `processStatement`, `confirmOcrRows`, `getDashboardMetrics`, `getReport`.

OCR payload: `{ batchId, userId, storagePath, fileType, rows: [{ date, description, amount, direction, confidence, suggestedCategoryId, rawText }] }`.

Key tables: `profiles`, `accounts`, `categories`, `category_rules`, `transactions`, `fixed_expenses`, `savings_goals`, `statement_uploads`, `ocr_batches`, `ocr_rows`. All user-owned tables include `user_id` and RLS policies.

Stitch UI contract: project `Smart Finance AI Manager` (`projects/16421650138318590896`) provides screen references and theme tokens. MVP UI SHOULD preserve its corporate/modern direction: high whitespace, card-based dashboard, ambient shadows, glass AI insight states, emerald growth signals, tabular numeric alignment, and responsive grid behavior.

Stitch screen references verified:

| Screen | Device | Stitch source |
|---|---|---|
| Dashboard General | Desktop | `projects/16421650138318590896/screens/9804d58210334282b772e405022314dd` |
| Gestión de Gastos Fijos | Desktop | `projects/16421650138318590896/screens/77082db94c4948738cb213802c12b918` |
| Ahorros y Gastos Variables | Desktop | `projects/16421650138318590896/screens/288646b77b10456fb445c661c40ba295` |
| Módulo OCR - Análisis IA | Desktop | `projects/16421650138318590896/screens/2a0942e8385c4b5eb4f6987b70366118` |
| Dashboard | Mobile | `projects/16421650138318590896/screens/cfb45554f21545dcbf8aadd6029c39db` |
| Gastos Fijos | Mobile | `projects/16421650138318590896/screens/f2ad89c1e6d5408c92bafcf416b3676e` |
| Ahorros y Gastos | Mobile | `projects/16421650138318590896/screens/ca1e555250ae4608858d13ffb1e4793f` |
| Módulo OCR | Mobile | `projects/16421650138318590896/screens/7b254da128854100a24aa0fa6773850b` |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Validators, metric calculations, OCR row normalization | Vitest/Jest after scaffold. |
| Integration | Server Actions, Route Handlers, Supabase queries | Local Supabase + test fixtures. |
| E2E | Auth, dashboard, CRUD, OCR review-confirm | Playwright responsive desktop/tablet/mobile. |
| Visual/UI | Fidelity to Stitch mockups and responsive behavior | Compare implemented screens against `Smart Finance AI Manager` references during UI tasks. |
| Security | RLS deny/allow and private Storage paths | SQL policy tests using two users. |
| OCR | Supported/unsupported files, low confidence review | Golden sample statements and manual correction flow. |

## Migration / Rollout

Local-first. Create Supabase migrations and RLS policies before UI wiring, then scaffold frontend and OCR service behind Docker Compose. No cloud deployment. Seed default categories after profile creation or via migration/seed script.

## Open Questions

- [ ] OCR engine choice: Tesseract, hosted API, or hybrid?
- [ ] Account balances: generated snapshots or derived from transactions at read time?
- [ ] Charting library for reports/dashboard?
- [ ] Notification mechanism for reminders/placeholders?
- [ ] Tablet-specific layouts are not yet present in Stitch; derive tablet behavior from desktop/mobile breakpoints unless new tablet screens are added.
