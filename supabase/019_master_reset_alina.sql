-- Master Reset Script for Alina's Project (MakelaarVideo AI)

-- 1. Delete existing MakelaarVideo AI and default projects
DELETE FROM public.student_projects 
WHERE name IN ('MakelaarVideo AI', 'My First AI Project');

-- 2. Insert new MakelaarVideo AI project into the most recent user ID
WITH new_project AS (
    INSERT INTO public.student_projects (
        user_id,
        name,
        current_phase,
        is_completed,
        external_deployment_success,
        agent_role,
        user_input,
        checklist_state
    )
    SELECT
        (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
        'MakelaarVideo AI',
        3,
        false,
        false,
        'AI-PROJECT-MANAGER',
        'Master reset manual injection',
        '[
            {"id": 1, "text": "Step 1: Configure Make Webhook (PDF URL & Realtor Email)", "done": false},
            {"id": 2, "text": "Step 2: Implement HTTP Download", "done": false},
            {"id": 3, "text": "Step 3: Connect CloudConvert (PDF to Text)", "done": false},
            {"id": 4, "text": "Step 4: Integrate OpenAI #1 (Researcher for m2)", "done": false},
            {"id": 5, "text": "Step 5: Integrate OpenAI #2 (Strategist for script)", "done": false},
            {"id": 6, "text": "Step 6: Configure Gmail Delivery", "done": false},
            {"id": 7, "text": "Step 7: Setup Google Sheets Logging (Cols A-G)", "done": false}
        ]'::jsonb
    RETURNING id
)
-- 3. Inject the Dutch PRD into project_documents for the new project
INSERT INTO public.project_documents (project_id, type, content)
SELECT 
    id, 
    'prd', 
    '# Product Requirement Document (PRD)

**Projectnaam:** MakelaarVideo AI (Snelder Zijlstra)
**Doelmarkt:** Regio Twente, Nederland.
**Kernobjectief:** Automatisering van vastgoed PDF-brochures naar Facebook Reels via een 7-stappen Digitaal Brein (Make.com).

## Architectuur & Flow
1. **Webhook:** Ontvangt PDF URL en e-mailadres van de makelaar.
2. **HTTP:** Downloadt de brochure.
3. **CloudConvert:** Converteert PDF naar ruwe tekst.
4. **OpenAI #1 (Onderzoeker):** Extraheert Pand_Naam, m2, en energielabels.
5. **OpenAI #2 (Strateeg):** Genereert een 8-sectie script voor social media.
6. **Gmail:** Verstuurt script naar marketingteam.
7. **Google Sheets:** Logt operatie (Kolom C: Pand_Naam).'
FROM new_project;
