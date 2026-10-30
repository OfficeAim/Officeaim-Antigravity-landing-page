-- ==============================================================================
-- 025_create_waitlist_entries.sql
-- OfficeAIM Native Waitlist & Intelligent Lead Profiling Schema
-- ==============================================================================

-- 1. Ensure public.is_super_admin() helper exists (alias compatible with public.is_superadmin())
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND (role = 'superadmin' OR role = 'admin')
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

-- 2. Create public.waitlist_entries table
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_whatsapp TEXT,
    user_role TEXT,
    join_reason TEXT,
    main_bottleneck TEXT,
    tech_stack TEXT,
    preferred_channel TEXT DEFAULT 'Email',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for chronological queries in Superadmin dashboard / n8n sync
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at
    ON public.waitlist_entries (created_at DESC);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if re-running migration (idempotent)
DROP POLICY IF EXISTS "Allow public anonymous waitlist registration" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Permitir registro público anónimo" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Only Superadmins can read waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Solo Superadmins pueden leer registros" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Only Superadmins can update waitlist entries" ON public.waitlist_entries;
DROP POLICY IF EXISTS "Only Superadmins can delete waitlist entries" ON public.waitlist_entries;

-- 5. RLS Policies
-- Allow anonymous and authenticated visitors to insert into waitlist
CREATE POLICY "Permitir registro público anónimo"
    ON public.waitlist_entries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Restrict SELECT exclusively to Superadmins
CREATE POLICY "Solo Superadmins pueden leer registros"
    ON public.waitlist_entries
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin() = true);

-- Restrict UPDATE and DELETE exclusively to Superadmins
CREATE POLICY "Only Superadmins can update waitlist entries"
    ON public.waitlist_entries
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin() = true)
    WITH CHECK (public.is_super_admin() = true);

CREATE POLICY "Only Superadmins can delete waitlist entries"
    ON public.waitlist_entries
    FOR DELETE
    TO authenticated
    USING (public.is_super_admin() = true);

-- Restrict GraphQL total_count exposure on waitlist_entries
COMMENT ON TABLE public.waitlist_entries IS '@graphql({"enabled": false})';

