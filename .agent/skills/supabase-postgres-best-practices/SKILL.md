---
description: Supabase Postgres best practices — query optimization, schema design, RLS, indexes, connection pooling. Apply when writing SQL, designing schemas, or reviewing database performance.
---

# Supabase Postgres Best Practices

Source: https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices  
GitHub: https://github.com/supabase/agent-skills

## When to Apply
Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

### 1. QUERY — Query Performance (Highest Impact)
- **Always use indexes** on columns used in WHERE, JOIN, and ORDER BY clauses
- **Avoid SELECT \*** — fetch only the columns you need
- **Use EXPLAIN ANALYZE** before deploying complex queries
- **Avoid N+1 queries** — batch fetches where possible
- **Use CTEs** (WITH clauses) for readability but avoid them in performance-critical paths with large datasets
- **Prefer JOINs over subqueries** in most cases

```sql
-- ❌ Never do this in production
SELECT * FROM users WHERE active = true;

-- ✅ Specific columns, with index on active
SELECT id, email, created_at FROM users WHERE active = true;
```

### 2. CONN — Connection Management
- **Use connection pooling** (Supabase uses PgBouncer via the pooler URL)
- Use the **pooler connection string** for serverless functions (Vercel, Edge, n8n)
- Use the **direct connection string** only for migrations and long-running scripts
- Keep transactions short — don't hold connections open needlessly

```
# For serverless (Vercel, n8n, Edge):
postgresql://[user]:[password]@[host]:6543/[db]?pgbouncer=true

# For migrations only:
postgresql://[user]:[password]@[host]:5432/[db]
```

### 3. SECURITY — RLS (Row Level Security)
- **Always enable RLS** on tables that contain user data
- Every table with user data needs a policy — no exceptions
- Test RLS policies as different roles before deployment
- Use `auth.uid()` to reference the authenticated user

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 4. SCHEMA — Schema Design
- Use **UUID** as primary keys for Supabase (integrates with auth.uid())
- Use **timestamptz** (not timestamp) for all date/time columns
- Add `created_at` and `updated_at` to every table
- Use **foreign key constraints** — don't rely on application-level integrity
- Normalize data but don't over-normalize (3NF is usually enough)

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

### 5. LOCK — Avoiding Lock Issues
- **Avoid long-running transactions** that hold locks
- Use `CONCURRENTLY` for index creation on production tables
- For large table changes, use **batched updates** rather than single large transactions

```sql
-- ✅ Add index without locking the table
CREATE INDEX CONCURRENTLY idx_projects_user_id ON projects(user_id);
```

### 6. DATA — Data Types
- Use `TEXT` over `VARCHAR(n)` — Postgres TEXT has no performance penalty
- Use `BOOLEAN` not `SMALLINT` for true/false
- Use `JSONB` (not `JSON`) for JSON storage — it's indexed and faster
- Avoid storing arrays as comma-separated strings — use Postgres ARRAY type

### 7. MONITOR — Monitoring
- Use `pg_stat_statements` to identify slow queries
- Monitor with Supabase Dashboard → Reports → Query Performance
- Set up alerts for connection counts approaching limits
- Check `pg_locks` for deadlock issues

### 8. ADVANCED — Advanced Patterns
- Use **database functions** (PL/pgSQL) for complex business logic that needs to be atomic
- Use **triggers** for `updated_at` auto-update
- Use **partial indexes** for frequently filtered subsets

```sql
-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## OfficeAIM Supabase Notes
- Production DB: Supabase project with RLS enabled on all user tables
- Key tables: `users` (profiles), `courses`, `modules`, `lessons`, `projects`, `chat_sessions`
- All user-facing queries must have RLS policies
- Use the pooler URL for the Vite frontend (via `VITE_SUPABASE_URL`)
- Migrations stored in `/supabase/` folder — numbered sequentially (001_, 002_, etc.)

## References
- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth/row-level-security
- https://wiki.postgresql.org/wiki/Performance_Optimization
