-- ==============================================================================
-- 022_create_news_table_and_superadmin_rls.sql
-- OfficeAIM Super Admin News Management Architecture
-- ==============================================================================

-- 1. Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT,
    category TEXT DEFAULT 'Generative AI',
    published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performant querying of published news ordered by publication date
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news (published, published_at DESC);

-- 2. Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION public.handle_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_news_updated_at ON public.news;
CREATE TRIGGER trg_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_news_updated_at();

-- 3. Superadmin security definer function (Zero recursion risk)
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
          AND (role = 'superadmin' OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to allow clean idempotency
DROP POLICY IF EXISTS "Public can view published news" ON public.news;
DROP POLICY IF EXISTS "Superadmins can view all news" ON public.news;
DROP POLICY IF EXISTS "Superadmins can insert news" ON public.news;
DROP POLICY IF EXISTS "Superadmins can update news" ON public.news;
DROP POLICY IF EXISTS "Superadmins can delete news" ON public.news;

-- 6. Define RLS Policies
-- SELECT: Anonymous and authenticated users can view published news
CREATE POLICY "Public can view published news"
    ON public.news
    FOR SELECT
    USING (published = true);

-- SELECT: Superadmins can view ALL news (including drafts)
CREATE POLICY "Superadmins can view all news"
    ON public.news
    FOR SELECT
    TO authenticated
    USING (public.is_superadmin());

-- INSERT: Superadmins only
CREATE POLICY "Superadmins can insert news"
    ON public.news
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_superadmin());

-- UPDATE: Superadmins only
CREATE POLICY "Superadmins can update news"
    ON public.news
    FOR UPDATE
    TO authenticated
    USING (public.is_superadmin())
    WITH CHECK (public.is_superadmin());

-- DELETE: Superadmins only
CREATE POLICY "Superadmins can delete news"
    ON public.news
    FOR DELETE
    TO authenticated
    USING (public.is_superadmin());

-- 7. Seed initial news data from canonical OfficeAIM catalogue
INSERT INTO public.news (title, description, youtube_url, category, published, published_at)
VALUES 
(
    'Ideogram 4.5 and the Next AI Shift: Editing Images Without the Drift',
    'AI image editing moves beyond one-shot generation. Discover how Ideogram 4.5’s consistency focus empowers repeatable creative workflows for design teams and digital agencies.',
    'https://www.youtube.com/watch?v=mNW3RlNsP5Q',
    'Generative Visuals',
    true,
    '2026-10-03 10:00:00+00'
),
(
    'OpenAI Dots: The AI Agent That Keeps Working After You Log Off?',
    'OpenAI Dots move AI from answering prompts to managing projects in the background. Discover what always-on agents mean for modern workflows, task delegation, and persistent context.',
    'https://www.youtube.com/watch?v=dfXsIYPj3Pw',
    'Autonomous Agents',
    true,
    '2026-10-02 10:00:00+00'
),
(
    '100 AI Websites? How to Find the Few That Actually Improve Your Workflow',
    'A curated breakdown of how to filter, test, and adopt only the tools that generate quantifiable ROI without falling victim to decision fatigue and subscription overload.',
    'https://www.youtube.com/watch?v=OkaW3P2zuUQ',
    'AI Workflow Strategy',
    true,
    '2026-10-01 10:00:00+00'
),
(
    'Meta Prompting Explained: Turn One Basic Prompt Into a Scalable Workflow',
    'Master meta-prompting techniques to architect multi-step autonomous pipelines. How to structure self-evaluating LLM agents that refine their own output before final delivery.',
    'https://www.youtube.com/watch?v=fXWwP846y6c',
    'Prompt Architecture',
    true,
    '2026-09-28 10:00:00+00'
),
(
    'How to Build and Launch an AI MVP in Days, Not Months',
    'Deconstruct the exact stack powering modern AI MVPs: decoupled Jamstack, Supabase PostgreSQL, edge functions, and autonomous n8n workflows.',
    'https://www.youtube.com/watch?v=wX-y0M81pYc',
    'Product Engineering',
    true,
    '2026-09-25 10:00:00+00'
)
ON CONFLICT DO NOTHING;
