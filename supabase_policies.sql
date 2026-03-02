-- 1. admin_inbox: Limpiar y crear nuevas políticas
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.admin_inbox;
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.admin_inbox;

CREATE POLICY "Allow authenticated inserts" ON public.admin_inbox FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated reads" ON public.admin_inbox FOR SELECT TO authenticated USING (true);

-- 2. project_memory (The Vault): Limpiar y crear nuevas políticas
DROP POLICY IF EXISTS "owner_select_memory" ON public.project_memory;
DROP POLICY IF EXISTS "owner_insert_memory" ON public.project_memory;

CREATE POLICY "owner_select_memory" ON "public"."project_memory" FOR SELECT TO authenticated USING ( project_id IN (SELECT id FROM student_projects WHERE user_id = auth.uid()) );
CREATE POLICY "owner_insert_memory" ON "public"."project_memory" FOR INSERT TO authenticated WITH CHECK ( project_id IN (SELECT id FROM student_projects WHERE user_id = auth.uid()) );
