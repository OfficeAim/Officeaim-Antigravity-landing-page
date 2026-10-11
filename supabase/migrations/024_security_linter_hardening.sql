-- ==============================================================================
-- 024_security_linter_hardening.sql
-- OfficeAIM Supabase Security Linter Hardening & RPC Access Control
-- ==============================================================================

-- 1. Hardening search_path on public.handle_news_updated_at()
CREATE OR REPLACE FUNCTION public.handle_news_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. Hardening search_path on public.is_superadmin()
CREATE OR REPLACE FUNCTION public.is_superadmin()
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

-- 3. Hardening search_path on public.is_admin() (if present)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND (role = 'admin' OR role = 'superadmin')
    );
END;
$$;

-- 4. Revoke public/anon execution on sensitive SECURITY DEFINER functions
-- Prevents anonymous clients from invoking security and privilege-checking RPCs directly.
DO $$
BEGIN
    -- Revoke from is_superadmin
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_superadmin') THEN
        REVOKE EXECUTE ON FUNCTION public.is_superadmin() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated, service_role;
    END IF;

    -- Revoke from is_admin
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
    END IF;

    -- Revoke from handle_new_user
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
    END IF;

    -- Revoke from notify_admin_on_completion (if defined)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_admin_on_completion') THEN
        REVOKE EXECUTE ON FUNCTION public.notify_admin_on_completion() FROM PUBLIC, anon;
        GRANT EXECUTE ON FUNCTION public.notify_admin_on_completion() TO authenticated, service_role;
    END IF;
END $$;

-- 5. Restrict GraphQL schema exposure on internal/administrative tables
-- Applies Supabase pg_graphql configuration directives
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
        COMMENT ON TABLE public.support_tickets IS '@graphql({"enabled": false})';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_inbox') THEN
        COMMENT ON TABLE public.admin_inbox IS '@graphql({"enabled": false})';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        COMMENT ON TABLE public.profiles IS '@graphql({"total_count": {"enabled": false}})';
    END IF;
END $$;
