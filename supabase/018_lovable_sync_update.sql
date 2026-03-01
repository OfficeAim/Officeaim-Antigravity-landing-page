-- Add fields for Lovable Sync and project progression
ALTER TABLE public.student_projects 
ADD COLUMN IF NOT EXISTS external_deployment_success BOOLEAN DEFAULT false;

ALTER TABLE public.student_projects
ADD COLUMN IF NOT EXISTS checklist_state JSONB DEFAULT '[]'::jsonb;

-- Drop and recreate the CHECK constraint for current_phase if needed
-- To support Phase 5, we change the check from BETWEEN 1 AND 4 to BETWEEN 1 AND 5
ALTER TABLE public.student_projects DROP CONSTRAINT IF EXISTS student_projects_current_phase_check;
ALTER TABLE public.student_projects ADD CONSTRAINT student_projects_current_phase_check CHECK (current_phase BETWEEN 1 AND 5);
