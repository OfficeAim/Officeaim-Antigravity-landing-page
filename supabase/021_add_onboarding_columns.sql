-- OFFICEAIM CAMPUS - 021 ADD ONBOARDING COLUMNS TO PROFILES
-- Run this query in your Supabase SQL Editor to support persistent onboarding settings.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
