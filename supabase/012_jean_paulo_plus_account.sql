-- ============================================================
-- Jean Paulo — Test Account with PLUS Tier (All Agents)
-- ============================================================
-- Run this AFTER login exists in auth.users via Supabase Auth UI
-- OR use the Supabase Auth admin panel to create the user first,
-- then run the UPDATE below to set their profile.
--
-- Step 1: Create user manually in Supabase Auth dashboard
--   Email: jeanpaulo@officeaim.test  (or real email)
--   Password: TestPass2026!
--
-- Step 2: Run this SQL to upgrade their profile to PLUS

-- If profile row doesn't exist yet (auto-created on first login),
-- wait until Jean Paulo logs in once, then run:
UPDATE public.profiles
SET
    full_name         = 'Jean Paulo',
    role              = 'student',
    membership_status = 'plus',
    ai_proficiency    = 'Expert',
    updated_at        = NOW()
WHERE email = 'jeanpaulo@officeaim.test';

-- Verify the update worked
SELECT id, email, full_name, role, membership_status
FROM public.profiles
WHERE email = 'jeanpaulo@officeaim.test';
