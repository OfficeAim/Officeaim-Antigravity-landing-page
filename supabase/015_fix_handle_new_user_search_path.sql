-- ============================================================
-- 015: Fix Security Warning — Function Search Path Mutable
-- Fixes: public.handle_new_user has a mutable search_path
-- Solution: Add SET search_path = '' to lock the search path
-- This prevents schema injection attacks (search_path hijacking)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''          -- ← THIS IS THE FIX
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, membership_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Student'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    'student',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$;
