# FinanzIA

Aplicación de finanzas personales con Next.js 16 + Supabase SSR + Tailwind. Incluye dashboard, gastos fijos, metas de ahorro, carga OCR de extractos y reportes por período.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Auth**: Supabase SSR con `frontend/proxy.ts`
- **Database**: Supabase Postgres (RLS + RPC `create_finance_transaction`)
- **Testing**: Vitest + Playwright smoke E2E

## Estado actual del MVP

- ✅ Fase 1-6 completadas (foundation, seguridad, core financiero, UI, fijos/ahorros, OCR + reportes).
- ✅ Fase 7.1/7.2 completadas con cobertura unitaria/componente + smoke E2E y documentación operativa.
- ⚠️ Pendiente post-MVP: OCR engine real (hoy mock determinístico) y suite E2E funcional autenticada de extremo a extremo.

## Estructura del proyecto

```text
FinanzIA/
├── frontend/
│   ├── app/(app)/
│   │   ├── dashboard/
│   │   ├── fixed-expenses/
│   │   ├── savings/
│   │   ├── statements/   # OCR upload/review/confirm
│   │   └── reports/
│   ├── lib/
│   │   ├── actions/
│   │   ├── data/
│   │   ├── dashboard/
│   │   ├── ocr/
│   │   └── reports/
│   └── proxy.ts
├── supabase/
│   ├── migrations/
│   └── tests/
├── backend/ocr/
└── docker-compose.yml
```

## Flujo local

1. Copia variables:

```bash
cp .env.example .env
```

2. Instala frontend:

```bash
cd frontend
npm install
```

3. Alinea base de datos (local o remota):

```bash
supabase db push
```

4. Levanta desarrollo:

```bash
npm run dev
```

## Docker startup

El repo incluye `docker-compose.yml` con boundary de OCR (`backend/ocr`) para validar contrato/aislamiento de servicio.

```bash
docker compose up --build
```

## Migraciones y reset de Supabase

- Aplicar migraciones: `supabase db push`
- Reset local: `supabase db reset`
- Tests SQL de seguridad/ownership:
  - `supabase/tests/001_rls_ownership_checks.sql`
  - `supabase/tests/002_finance_atomic_rpc.sql`
  - `supabase/tests/003_phase5_rls_fixed_savings.sql`

## OCR: límites actuales

- Tipos permitidos: `application/pdf`, `image/png`, `image/jpeg`
- Extracción actual: **mock determinístico** (`frontend/lib/ocr/mock-parser.ts`) para draft/review
- Confirmación: cada draft puede corregirse manualmente y confirmar a `transactions` vía RPC
- Exclusión actual: no hay engine OCR real ni colas asíncronas todavía

## Estrategia de entrega

- Trabajo por fases SDD con slices verificables
- PRs preferentemente pequeños; dividir cuando la carga de revisión supera ~400 líneas
- Verificación obligatoria: `test`, `lint`, `typecheck`, y para cambios de DB, SQL runtime checks

## CI/CD

| Workflow | Trigger | Propósito |
|----------|---------|-----------|
| `CI` | Pull requests y pushes a `main` | Ejecuta gates de calidad del frontend en Node.js 22: install, lint, typecheck, Vitest y build de producción. |
| `E2E Smoke` | Pull requests y ejecución manual | Ejecuta la suite smoke de Playwright de forma independiente al CI completo y sube el reporte si falla. |
| `Security` | Pull requests, pushes a `main`, agenda semanal y ejecución manual | Ejecuta CodeQL para JavaScript/TypeScript. |

Checks recomendados para branch protection:

- `Frontend quality`
- `Playwright smoke`
- `CodeQL analysis`

## Scripts (frontend)

| Command | Description |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Suite Vitest |
| `npm run test:e2e` | Playwright smoke E2E |

> `test:e2e` (smoke público) corre sin credenciales gracias a `E2E_DISABLE_SUPABASE_PROXY=true`.
> Para E2E autenticado/privado sí debes definir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
