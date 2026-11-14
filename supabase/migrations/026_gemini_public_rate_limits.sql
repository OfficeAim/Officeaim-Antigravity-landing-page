-- ==============================================================================
-- 026_gemini_public_rate_limits.sql
-- Rate limiting storage for public Gemini Netlify Function routes
-- (mascot-widget & library-tracker):
--   - Max 10 requests per IP hash per 10-minute window
--   - Global daily cap across public routes
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gemini_public_rate_limits (
    bucket_key TEXT PRIMARY KEY,
    scope TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gemini_public_rate_limits_expires_at
    ON public.gemini_public_rate_limits (expires_at);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.gemini_public_rate_limits ENABLE ROW LEVEL SECURITY;

-- Restrict direct table access exclusively to Superadmins;
-- anonymous traffic interacts only via the SECURITY DEFINER RPC below.
DROP POLICY IF EXISTS "Only Superadmins can read rate limits" ON public.gemini_public_rate_limits;
CREATE POLICY "Only Superadmins can read rate limits"
    ON public.gemini_public_rate_limits
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin() = true);

COMMENT ON TABLE public.gemini_public_rate_limits IS '@graphql({"enabled": false})';

-- Atomic rate-limit check and increment RPC
-- Hardcodes limits inside the SQL function (10 requests per IP / 10 min, 200 global requests / day)
-- so callers cannot override or spoof quota thresholds.
DROP FUNCTION IF EXISTS public.check_gemini_public_rate_limit(TEXT, TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.check_gemini_public_rate_limit(
    p_ip_hash TEXT,
    p_scope TEXT DEFAULT 'public'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    c_ip_limit CONSTANT INTEGER := 10;
    c_daily_limit CONSTANT INTEGER := 200;
    v_now TIMESTAMPTZ := now();
    v_epoch BIGINT := EXTRACT(EPOCH FROM v_now)::BIGINT;
    v_window_slot BIGINT := v_epoch / 600; -- 10-minute buckets (600s)
    v_day_key TEXT := 'daily:' || to_char(v_now AT TIME ZONE 'UTC', 'YYYY-MM-DD');
    v_ip_key TEXT := 'ip:' || COALESCE(NULLIF( trim(p_ip_hash), '' ), 'unknown') || ':' || v_window_slot::TEXT;
    v_daily_count INTEGER;
    v_ip_count INTEGER;
BEGIN
    -- Opportunistic cleanup of expired buckets
    DELETE FROM public.gemini_public_rate_limits
    WHERE expires_at < v_now;

    -- 1. Check daily global count first (without incrementing if already over limit)
    SELECT request_count INTO v_daily_count
    FROM public.gemini_public_rate_limits
    WHERE bucket_key = v_day_key;

    IF COALESCE(v_daily_count, 0) >= c_daily_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'daily_limit',
            'ip_count', COALESCE(v_ip_count, 0),
            'daily_count', v_daily_count
        );
    END IF;

    -- 2. Check per-IP 10-minute count
    SELECT request_count INTO v_ip_count
    FROM public.gemini_public_rate_limits
    WHERE bucket_key = v_ip_key;

    IF COALESCE(v_ip_count, 0) >= c_ip_limit THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'ip_limit',
            'ip_count', v_ip_count,
            'daily_count', COALESCE(v_daily_count, 0)
        );
    END IF;

    -- 3. Increment per-IP 10-minute bucket
    INSERT INTO public.gemini_public_rate_limits (bucket_key, scope, request_count, window_start, expires_at, updated_at)
    VALUES (
        v_ip_key,
        COALESCE(p_scope, 'public'),
        1,
        v_now,
        v_now + INTERVAL '10 minutes',
        v_now
    )
    ON CONFLICT (bucket_key) DO UPDATE
    SET request_count = public.gemini_public_rate_limits.request_count + 1,
        updated_at = v_now
    RETURNING request_count INTO v_ip_count;

    -- 4. Increment daily global bucket
    INSERT INTO public.gemini_public_rate_limits (bucket_key, scope, request_count, window_start, expires_at, updated_at)
    VALUES (
        v_day_key,
        'global_daily',
        1,
        v_now,
        date_trunc('day', v_now AT TIME ZONE 'UTC') + INTERVAL '1 day',
        v_now
    )
    ON CONFLICT (bucket_key) DO UPDATE
    SET request_count = public.gemini_public_rate_limits.request_count + 1,
        updated_at = v_now
    RETURNING request_count INTO v_daily_count;

    RETURN jsonb_build_object(
        'allowed', (v_ip_count <= c_ip_limit AND v_daily_count <= c_daily_limit),
        'reason', CASE
            WHEN v_daily_count > c_daily_limit THEN 'daily_limit'
            WHEN v_ip_count > c_ip_limit THEN 'ip_limit'
            ELSE 'ok'
        END,
        'ip_count', v_ip_count,
        'daily_count', v_daily_count
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_gemini_public_rate_limit(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_gemini_public_rate_limit(TEXT, TEXT) TO service_role;
