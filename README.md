# ResolveAI

ResolveAI is an AI Resolution Copilot for post-purchase customer issues such as damaged products, refunds, returns, replacements, delivery delays, warranty requests, and cancellations. It provides a neumorphic ("Neo" / soft UI) interface with dedicated portals for customers and resolution agents.

---

## Monorepo Layout

```
resolveai/
  apps/
    frontend/        # React 19 + Vite + Tailwind v4 + React Router DOM + React Query + Recharts
    backend/         # Express 5 API + Drizzle ORM + Multer + Supabase Storage + Groq AI
  packages/
    db/              # Drizzle schema (resolve.ts), pg connection pool, and migrations runner
    api-spec/        # OpenAPI 3.1 contract (openapi.yaml) & Orval codegen configuration
    api-zod/         # Auto-generated Zod request/response validation schemas
    api-client/      # Auto-generated React Query hooks & custom fetcher
  supabase/
    migrations/      # Canonical SQL migrations (Drizzle migration + RLS & Storage policies)
    README.md        # Comprehensive Supabase provisioning & deployment guide
  scripts/           # Cross-platform developer utility scripts
  package.json       # Root package.json with unified scripts
  pnpm-workspace.yaml# Workspace topology
  .env.example       # Root environment variable documentation template
```

---

## Prerequisites

- **Node.js**: v20 or v22 LTS
- **Package Manager**: `pnpm` (v9 or v10)
- **Database**: PostgreSQL (Supabase or self-hosted PostgreSQL)
- **AI Engine (Optional)**: Groq Cloud API Key (`GROQ_API_KEY`) for live LLM inferences (uses deterministic validated fallback when absent).

---

## Environment Configuration

Copy `.env.example` to `.env` at the root and fill in your connection secrets:

```bash
cp .env.example .env
```

### Backend Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL or Supabase pooler connection string | `postgres://postgres.[ref]:[pw]@...pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | Supabase project API URL | `https://[ref].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret (server-side only) | `eyJhbGciOi...` |
| `SUPABASE_STORAGE_BUCKET` | Private storage bucket name | `evidence` |
| `JWT_SECRET` | Secret key for JWT auth token generation | `resolve-secret-key-32chars-min-secure` |
| `GROQ_API_KEY` | (Optional) Groq AI API key | `gsk_...` |
| `PORT` | Backend HTTP port | `8080` |
| `CORS_ORIGIN` | Allowed origin for frontend requests | `http://localhost:5173` |
| `HIGH_VALUE_LIMIT` | Case value escalation threshold (cents) | `50000` |
| `SEED_ON_START` | Automatically seed database on server startup if empty | `false` |

> [!CAUTION]
> Backend secrets (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `GROQ_API_KEY`) must **NEVER** be exposed to client-side code or bundled into the frontend.

### Frontend Variables

In production or decoupled deployments, configure `apps/frontend/.env`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API | Empty string (proxies to `/api` on same origin) |

---

## Supabase Setup

For detailed instructions on configuring PostgreSQL, applying RLS policies, creating the private `evidence` storage bucket, and fetching the pooler credentials, see:

👉 **[supabase/README.md](supabase/README.md)**

---

## Commands

All commands are cross-platform and work seamlessly on Windows PowerShell, macOS, and Linux:

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install workspace dependencies with Windows-safe package manager validation |
| `pnpm run typecheck` | Run TypeScript type checks across all libraries, packages, and apps |
| `pnpm run build` | Build backend bundle (`dist/index.mjs`) and frontend production assets (`dist/public/`) |
| `pnpm run dev` | Start backend (`http://localhost:8080`) and frontend (`http://localhost:5173`) concurrently |
| `pnpm run codegen` | Re-generate Zod schemas and React Query hooks from `packages/api-spec/openapi.yaml` |
| `pnpm run db:generate`| Generate new SQL migrations from Drizzle schema modifications |
| `pnpm run db:migrate` | Execute pending database migrations against `DATABASE_URL` |
| `pnpm run db:seed` | Seed demo accounts, orders, cases, and policies (pass `--reset` to wipe and reseed) |

---

## Demo Accounts

The database comes pre-seeded with resolution agents, customer accounts, and 12 realistic eCommerce cases (including an escalated cracked laptop case):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Agent** | `agent@demo.com` | `Agent@123` | Full access to Agent Dashboard, Case Queue, and Case Workspace |
| **Customer 1** | `customer1@demo.com` | `Customer@123` | Case submitter with orders (Headphones, Standing Desk, etc.) |
| **Customer 2** | `customer2@demo.com` | `Customer@123` | Customer with escalated Laptop display issue |

*Note: Order and delivery data are mock sample data designed to demonstrate AI-powered post-purchase policy verification and resolution workflows.*

---

## Production Deployment

### Frontend (Static SPA Host)
- Build the frontend bundle using `pnpm --filter @workspace/resolve-ai run build`.
- Deploy the output directory `apps/frontend/dist/public` to any static hosting provider (Vercel, Netlify, Cloudflare Pages, AWS S3 / CloudFront).
- Configure the environment variable `VITE_API_URL=https://api.yourdomain.com/api` during build time.
- Set up SPA fallback routing redirecting all `/*` requests to `/index.html`.

### Backend (Node.js Service)
- Build the backend using `pnpm --filter @workspace/api-server run build`.
- Deploy `apps/backend/dist/index.mjs` on any Node.js container or PaaS (Google Cloud Run, AWS ECS/App Runner, Railway, Render).
- Configure production environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CORS_ORIGIN=https://app.yourdomain.com`).
- Start the server using: `node apps/backend/dist/index.mjs`.