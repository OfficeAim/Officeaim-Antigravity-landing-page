-- 016_ai_project_planner_schema_v2.sql

-- 1. Tables (IF NOT EXISTS handles duplication)
CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_phase INTEGER DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 5),
    is_completed BOOLEAN DEFAULT false,
    checklist_state JSONB DEFAULT '[]'::jsonb,
    external_deployment_success BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Add columns if they do not exist already for existing databases
ALTER TABLE public.student_projects ADD COLUMN IF NOT EXISTS checklist_state JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.student_projects ADD COLUMN IF NOT EXISTS external_deployment_success BOOLEAN DEFAULT false;

-- Remove old check constraint and add the new one for phase 5
ALTER TABLE public.student_projects DROP CONSTRAINT IF EXISTS student_projects_current_phase_check;
ALTER TABLE public.student_projects ADD CONSTRAINT student_projects_current_phase_check CHECK (current_phase BETWEEN 1 AND 5);

CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.student_projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('prd', 'mindmap', 'market_analysis', 'other')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_student_projects_user_id ON public.student_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON public.project_documents(project_id);

-- 3. Security (RLS)
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to avoid "already exists" error
DROP POLICY IF EXISTS "Users can view their own projects" ON public.student_projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON public.student_projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.student_projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.student_projects;

DROP POLICY IF EXISTS "Users can view docs of their projects" ON public.project_documents;
DROP POLICY IF EXISTS "Users can insert docs to their projects" ON public.project_documents;
DROP POLICY IF EXISTS "Users can update docs in their projects" ON public.project_documents;
DROP POLICY IF EXISTS "Users can delete docs in their projects" ON public.project_documents;

-- 5. Create Policies
CREATE POLICY "Users can view their own projects" ON public.student_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.student_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.student_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.student_projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view docs of their projects" ON public.project_documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.student_projects WHERE id = project_documents.project_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert docs to their projects" ON public.project_documents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.student_projects WHERE id = project_documents.project_id AND user_id = auth.uid()));
CREATE POLICY "Users can update docs in their projects" ON public.project_documents FOR UPDATE USING (EXISTS (SELECT 1 FROM public.student_projects WHERE id = project_documents.project_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete docs in their projects" ON public.project_documents FOR DELETE USING (EXISTS (SELECT 1 FROM public.student_projects WHERE id = project_documents.project_id AND user_id = auth.uid()));
