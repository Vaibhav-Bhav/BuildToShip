# ResolveAI

ResolveAI is an AI resolution copilot for post-purchase customer support issues. Customers keep one case history, while agents review structured AI suggestions and make the final decision.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/resolve-ai run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push development DB schema changes

Required environment:

- `DATABASE_URL` — provided by the project database
- `SESSION_SECRET` or `JWT_SECRET` — signing secret for demo JWT sessions
- `GROQ_API_KEY` — optional; when present, enables Groq analysis and reply generation

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React, Vite, Wouter, Tailwind CSS, React Query, Recharts
- API: Express 5 with Helmet, CORS, rate limiting, Multer, and structured Pino logging
- Database: PostgreSQL with Drizzle ORM
- Validation: generated Zod schemas from `lib/api-spec/openapi.yaml`, plus validated AI output
- AI: Groq `llama-3.3-70b-versatile`, backend-only, with safe deterministic fallback when the key is unavailable

## Where things live

- `artifacts/resolve-ai/src/` — React app, shared shell, customer flows, and agent workspace
- `artifacts/api-server/src/routes/` — auth, cases, attachments, analytics, and status/reply actions
- `artifacts/api-server/src/services/aiService.ts` — Groq integration, prompt safety, validation, and fallback analysis
- `artifacts/api-server/src/seed.ts` — first-start demo accounts, orders, cases, and timelines
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema/resolve.ts` — database schema

## Product

- Customers can register, report issues against mock orders, upload evidence, read their own cases, and continue message threads.
- Agents can view the queue, filter by status/priority/category/escalation, inspect the full history, review AI suggestions, generate/edit/send replies, override AI fields, assign cases, update status, and view analytics.
- Important actions are recorded as immutable timeline events.
- Backend ownership checks return 403 when a customer requests another customer's case.
- Escalation uses backend rules for repeat contact, sentiment, case volume, SLA, order value, and AI flags.

## Demo logins

- Agent: `agent@demo.com` / `Agent@123`
- Customer: `customer1@demo.com` / `Customer@123`
- Customer: `customer2@demo.com` / `Customer@123`

Order and delivery data are mock data seeded for demonstration. The database seeds automatically when the users table is empty.