-- ============================================================
-- Módulo 1 — Lección 3: Tu Primer Workflow con los Agentes
-- Free Agent Workflow Guide embedded as lesson content
-- Run AFTER existing module seeds
-- ============================================================

-- First, get the Module 1 ID
DO $$
DECLARE
    v_module_id UUID;
    v_lesson_order INT;
BEGIN
    -- Get Module 1's ID
    SELECT id INTO v_module_id
    FROM modules
    WHERE order_index = 1
    LIMIT 1;

    -- Get the current max lesson order for Module 1
    SELECT COALESCE(MAX(order_index), 0) + 1 INTO v_lesson_order
    FROM lessons
    WHERE module_id = v_module_id;

    -- Insert the Workflow Guide lesson
    INSERT INTO lessons (
        module_id,
        title,
        content,
        order_index,
        lesson_type,
        duration_minutes,
        is_free
    ) VALUES (
        v_module_id,
        'Tu Primer Workflow: Los 6 Agentes Trabajando Juntos',
        '## Bienvenido a la sesión más práctica del curso libre.

En esta lección vas a aprender exactamente cómo encadenar los 6 agentes gratuitos para construir un proyecto real desde cero.

### ¿Por qué necesitas un workflow?

Un agente solo es poderoso. Seis agentes coordinados son **imbatibles**.

La diferencia entre un estudiante que "usa IA" y uno que **dirige su propio equipo de IA** está en el workflow. Esta lección te da el tuyo.

---

### Los 6 Agentes de tu Equipo Standard

| Agente | Función | Cuándo usarlo |
|--------|---------|---------------|
| **Gema** (AI Project Manager) | Orquesta todo | Siempre primero |
| **Behavioral Psych** | Psicología de tu audiencia | Antes de crear contenido |
| **Community Builder** | Crecer tu comunidad | Estrategia de audiencia |
| **SEO Master** | Visibilidad orgánica | Keywords y contenido |
| **Quality Checker** | Revisión de calidad | Antes de publicar |
| **Idea Cloner** | Clonar modelos probados | Después de completar Módulo 2 |

---

### El Ejemplo Práctico: Lanzar una Newsletter

Sigue estas 7 sesiones paso a paso. Cada una tiene el prompt exacto que tienes que usar con cada agente.

**Sesión 1 — Gema:** Pídele un plan de 4 semanas para tu idea de negocio
**Sesión 2 — Behavioral Psych:** Define la psicología de tu audiencia objetivo
**Sesión 3 — Community Builder:** Crea tu plan de crecimiento de 0 a 100 suscriptores
**Sesión 4 — SEO Master:** Encuentra 10 keywords con baja competencia para tu nicho
**Sesión 5 — Quality Checker:** Revisa tu copy antes de lanzar
**Sesión 6 — Gema:** Consolida todo en un brief de lanzamiento
**Sesión 7 — Idea Cloner (M2):** Clona el modelo de negocio de una newsletter exitosa

---

### Regla de Oro

> Siempre empieza con **Gema**. Ella te dirá qué agente necesitas a continuación.

**Guarda cada sesión en tu Neural Vault** para construir tu proyecto de forma acumulativa.

---

### Tu Tarea de Esta Lección

1. Abre a **Gema** en el AgentHQ
2. Dile exactamente qué proyecto quieres construir
3. Pídele que te asigne las sesiones con los agentes en orden
4. Guarda el plan en tu Neural Vault

¿Listo? Tu equipo ya está esperando.',
        v_lesson_order,
        'text',
        15,
        true  -- is_free: visible to all students
    );

    RAISE NOTICE 'Workflow lesson inserted for Module 1 (ID: %)', v_module_id;
END $$;

-- Verify insertion
SELECT l.title, l.order_index, l.duration_minutes, l.is_free
FROM lessons l
JOIN modules m ON l.module_id = m.id
WHERE m.order_index = 1
ORDER BY l.order_index;
