---
name: sql-seed-generator
description: A blueprint for generating robust, schema-compliant SQL seeds for OfficeAIM course modules, ensuring correct data types and avoiding common pitfalls.
---

# SQL Seed Generator Skill

This skill provides the standard operating procedure (SOP) and templates for generating SQL migration files that inject new Course Content (Modules, Lessons, Quizzes) into the OfficeAIM Supabase database.

## 🎯 Purpose
To generate error-free SQL seeds that respect the specific OfficeAIM schema quirks (e.g., `order_index` vs `order`, `TEXT` ids for lessons vs `INTEGER` for modules).

## ⚠️ Critical Schema Rules (Read Before Generating)

1.  **Modules Table**:
    *   `id`: **INTEGER** (Serial). Do *not* try to insert UUIDs.
    *   `order_index`: Use this column name. **NEVER** use `order` (reserved keyword).
    *   `published`: **DOES NOT EXIST**. Do not include it in INSERTs.
    *   `description`: Required TEXT.

2.  **Lessons Table**:
    *   `id`: **TEXT** (e.g., '2-1', '2-2'). custom string format, not UUID/Integer.
    *   `module_id`: **INTEGER**. Must match the Module ID.
    *   `order_index`: **INTEGER**. Required for sorting.
    *   `smart_goal`: **TEXT**. Required.
    *   `duration_min`: **DOES NOT EXIST**. Do not include.
    *   `video_url`: TEXT (YouTube embed link).

3.  **Sanitization**:
    *   Always start the seed with a `DELETE` block to clean up previous versions of the specific module/lessons to avoid "Unique Constraint" errors during development.

## 📥 Template: New Module Seed

```sql
-- Module [X] Seed: [Title]
-- Generated via sql-seed-generator skill

DO $$
DECLARE
    v_module_id INTEGER;
BEGIN
    -- 1. Get or Create Module
    -- We search by title to avoid hardcoding IDs that might conflict across environments
    SELECT id INTO v_module_id FROM modules WHERE title = 'Module [X]: [Title]' LIMIT 1;
    
    IF v_module_id IS NULL THEN
        INSERT INTO modules (title, description, order_index)
        VALUES (
            'Module [X]: [Title]', 
            '[Description]',
            [X] -- Module Number
        ) RETURNING id INTO v_module_id;
    END IF;

    -- 2. Cleanup (Idempotency)
    -- Remove old content for this module to ensure clean slate
    DELETE FROM quiz_questions WHERE lesson_id LIKE '[X]-%';
    DELETE FROM lessons WHERE id LIKE '[X]-%';

    -- 3. Insert Lessons
    -- Lesson [X].1
    INSERT INTO lessons (
        id, module_id, title, smart_goal, content, order_index, video_url, 
        image_url, passing_threshold
    )
    VALUES (
        '[X]-1', -- ID Format: 'Module-Lesson'
        v_module_id,
        '[X].1 [Lesson Title]',
        '[Smart Goal: By the end of this lesson...]',
        '# [Markdown Content]...',
        1,
        'https://www.youtube.com/embed/PLACEHOLDER',
        'https://supabase.co/storage/v1/object/public/modules/hero-[X]-1.jpg', -- Premium Visual Asset
        80 -- Progressive Unlock Threshold (Standard: 80%)
    );

    -- Lesson [X].2
    -- ... (Repeat for other lessons)

    -- 4. Insert Quizzes
    INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
    ('[X]-1', '[Question?]', '[A]', '[B]', '[C]', '[D]', 'A', '[Explanation]', 1);

    RAISE NOTICE 'Module [X] seeded successfully.';

END $$;
```

## 4. 🛡️ Checklist de Calidad (Obligatorio)
Antes de guardar el archivo, verifica:
- [ ] **Module ID Integrity**: ¿Todas las lecciones usan la variable `v_module_id`?
- [ ] **Smart Goal Tone**: ¿El objetivo suena directo y ejecutivo (no académico)?
- [ ] **SQL Escaping**: ¿Las comillas simples dentro del texto están duplicadas (`It''s`)?
- [ ] **Safety Block**: ¿Empieza con `DELETE` para garantizar idempotencia?
- [ ] **Visual Layer**: ¿Incluye `image_url` (aunque sea placeholder) para el Hero Asset?

## 5. 🎨 Visual Layer & Progressive Unlock
El estándar OfficeAIM exige:
*   **Hero Image**: Cada lección debe tener un asset visual. Si la columna `image_url` existe en el esquema, inclúyela. Si no, anótalo para la migración visual.
*   **Unlock Logic**: Si el esquema soporta `required_score` o `unlock_threshold`, configúralo al **80%** por defecto.

## 6. 📜 Governance (Constitución)
Esta skill opera bajo el protocolo **E.T.A.P.A.** y debe respetar `gemini.md`:
- **Invariantes**: Consulta `@gemini.md` para confirmar que no hay cambios arquitectónicos en los tipos de datos.
- **Output Standard**:
    - Guardar en: `supabase/migrations/[NNN]_[name]_seed.sql`
    - Registrar en: `progress.md` como "Seed Generated".

## 7. 🤖 Automation Trigger (Paso 5)
Al finalizar la inyección, el sistema debe "avisar" a n8n.
*   *Tip*: Incluye un comentario al final del SQL recordatorio para el operador:
    `-- TODO: Trigger webhook to sync new content to n8n: POST https://n8n.webhook/sync-content`
