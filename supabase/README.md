# Supabase Setup Guide for ResolveAI

ResolveAI uses Supabase strictly as a **managed PostgreSQL database** and **private object storage**. User authentication is handled entirely by custom JWT and bcrypt within the Express backend (Supabase Auth is not used).

---

## 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/dashboard) and click **New Project**.
2. Choose an organization, enter a name (e.g. `resolveai`), set a strong database password (keep this password handy), and select your preferred region.
3. Wait for the project initialization to complete.

---

## 2. Obtain Credentials

### A. Database Connection String (Pooler)
1. In your Supabase Dashboard, navigate to **Project Settings** (gear icon) $\rightarrow$ **Database**.
2. Scroll to the **Connection string** section and select the **URI** tab under **Connection Pooling**.
3. Choose **Transaction** mode or **Session** mode (port `6543`).
4. Replace `[YOUR-PASSWORD]` with your actual database password.
5. Example:
   ```
   postgresql://postgres.yourprojectref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### B. Storage API URL & Service Role Key
1. In **Project Settings**, navigate to **API**.
2. Copy the **Project URL** (e.g., `https://yourprojectref.supabase.co`).
3. Under **Project API keys**, copy the **`service_role` (secret)** key.
   > **Important:** Never use the `anon` public key in the backend. The backend requires the `service_role` key to bypass RLS and manage private storage uploads in the `evidence` bucket.

---

## 3. Configure `.env`
In the root directory of the repository, ensure your `.env` file contains:

```ini
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres.yourprojectref:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# Supabase Storage configuration
SUPABASE_URL=https://yourprojectref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...your_service_role_key
SUPABASE_STORAGE_BUCKET=evidence

# Authentication
JWT_SECRET=supersecretjwtkey_min_32_characters_long_for_security
CORS_ORIGIN=http://localhost:5173

# AI & LLM Service
GROQ_API_KEY=gsk_your_groq_api_key

# Backend port
PORT=8080
```

---

## 4. Run Database Migrations
Run the migration script to create all database tables, configure Row Level Security (RLS), and provision the private `evidence` storage bucket:

```bash
pnpm run db:migrate
```

This applies:
- `supabase/migrations/0000_typical_goblin_queen.sql`: Tables for `users`, `orders`, `cases`, `case_events`, `messages`, `attachments`, `promises`, and `policies`.
- `supabase/migrations/0001_rls_and_storage.sql`: Enables RLS on all tables with no direct browser access, and provisions the `evidence` storage bucket (private, 5 MB file size limit, images jpeg/png/webp only).

---

## 5. Seed the Database
Seed the demo accounts, mock orders, sample cases, and baseline policies:

```bash
pnpm run db:seed
```

To wipe and reseed the database from scratch at any time:
```bash
pnpm run db:seed --reset
```

### Pre-configured Demo Accounts:
- **Agent:** `agent@demo.com` / `Agent@123`
- **Customer 1:** `customer1@demo.com` / `Customer@123`
- **Customer 2:** `customer2@demo.com` / `Customer@123`

---

## 6. Run the Application
Start the backend and frontend in parallel:

```bash
pnpm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api/healthz
