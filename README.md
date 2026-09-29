# ResolveAI

ResolveAI is an AI Resolution Copilot for post-purchase customer issues such as damaged products, refunds, returns, replacements, delivery delays, warranty requests, and cancellations.

## Setup

1. Install dependencies with `pnpm install`.
2. Ensure the project database is available.
3. Add `GROQ_API_KEY` to Replit Secrets to enable live Groq analysis and reply generation. If it is not present, ResolveAI uses a validated deterministic fallback so the demo still works.
4. Ensure `SESSION_SECRET` or `JWT_SECRET` is configured for JWT sessions.
5. Start the API and web services through the configured workflows.

The database schema is pushed with:

```bash
pnpm --filter @workspace/db run push
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Agent | agent@demo.com | Agent@123 |
| Customer | customer1@demo.com | Customer@123 |
| Customer | customer2@demo.com | Customer@123 |

Order and delivery data are mock data. Demo data, including twelve cases and a special escalated cracked-laptop case, is inserted automatically on first start when the database is empty.

## Environment

See `.env.example`. Never commit `.env` or a real API key.