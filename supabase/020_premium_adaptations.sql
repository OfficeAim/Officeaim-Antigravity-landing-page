-- OFFICEAIM CAMPUS - 020 PREMIUM ADAPTATIONS (ROADMAPS, GEMS, GAMIFICATION, COMMUNITY)
-- This script creates the complete database schema to support premium SaaS LMS features locally.

-- =========================================================================
-- 1. GAMIFICATION SYSTEM (RANKING)
-- =========================================================================

-- Add XP (Experience Points) and Level to Profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Create XP Transactions to log and audit how students gain points
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- e.g., +50, +100
    reason TEXT NOT NULL, -- e.g., 'completed_lesson_1-1', 'passed_quiz_2-1', 'shared_prompt'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for XP Transactions
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for XP Transactions
DROP POLICY IF EXISTS "Users can view their own XP transactions" ON public.xp_transactions;
DROP POLICY IF EXISTS "Admins can manage all XP transactions" ON public.xp_transactions;

CREATE POLICY "Users can view their own XP transactions" ON public.xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all XP transactions" ON public.xp_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create index for faster leaderboard querying
CREATE INDEX IF NOT EXISTS idx_profiles_xp_leaderboard ON public.profiles(xp DESC);

-- =========================================================================
-- 2. ROADMAPS & LEARNING PATHS SYSTEM (RUTAS)
-- =========================================================================

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id TEXT PRIMARY KEY, -- e.g. 'ai-automation-agency', 'productivity-ninja'
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create path_steps table (linking lessons to a specific tree step)
CREATE TABLE IF NOT EXISTS public.path_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id TEXT NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    lesson_id TEXT REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    required_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(path_id, order_index)
);

-- Enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_steps ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view active learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Admins can manage learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Anyone can view path steps" ON public.path_steps;
DROP POLICY IF EXISTS "Admins can manage path steps" ON public.path_steps;

CREATE POLICY "Anyone can view active learning paths" ON public.learning_paths
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage learning paths" ON public.learning_paths
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Anyone can view path steps" ON public.path_steps
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage path steps" ON public.path_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Seed Default Paths
INSERT INTO public.learning_paths (id, title, description, is_active)
VALUES 
('ai-agency-roadmap', 'AI Automation Agency Blueprint', 'Go from zero to building and scaling your own AI-powered agency in 90 days.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 3. DYNAMIC GEMS & RESOURCES (RECURSOS)
-- =========================================================================

-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- e.g., 'Prompts', 'n8n Workflows', 'PDF Guides'
    content TEXT NOT NULL, -- Contains prompt copy or webhook link or download link
    is_premium BOOLEAN DEFAULT FALSE,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table (user saved resources)
CREATE TABLE IF NOT EXISTS public.user_saved_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_resources ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can manage resources" ON public.resources;
DROP POLICY IF EXISTS "Users can manage their saved resources" ON public.user_saved_resources;

CREATE POLICY "Anyone can view resources" ON public.resources
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage resources" ON public.resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can manage their saved resources" ON public.user_saved_resources
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for resources
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);

-- =========================================================================
-- 4. COMMUNITY FEEDS & FORUMS (COMUNIDAD)
-- =========================================================================

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'general', -- 'general', 'workflow', 'prompt', 'question'
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone authenticated can view posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can manage their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone authenticated can view comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can manage their own comments" ON public.post_comments;

CREATE POLICY "Anyone authenticated can view posts" ON public.community_posts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own posts" ON public.community_posts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view comments" ON public.post_comments
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own comments" ON public.post_comments
    FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);
