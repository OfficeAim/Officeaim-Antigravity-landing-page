-- OfficeAIM: Power Seed Phase 9
-- Contenido: Módulo 2 (Prompt Engineering) + Actualización de Videos Clases 1.2 y 1.3
-- Autor: Antigravity

DO $$ 
DECLARE
    v_module_id INT;
BEGIN
    -- 1. [MODULE 2] Find or Create
    SELECT id INTO v_module_id FROM modules WHERE title = 'Prompt Engineering Mastery';

    IF v_module_id IS NULL THEN
        INSERT INTO modules (title, description, order_index) 
        VALUES (
            'Prompt Engineering Mastery', 
            'Aprende a comunicarte con la inteligencia artificial con precisión quirúrgica. Transforma instrucciones vagas en resultados de élite.', 
            2
        ) RETURNING id INTO v_module_id;
    ELSE
        UPDATE modules SET 
            description = 'Aprende a comunicarte con la inteligencia artificial con precisión quirúrgica. Transforma instrucciones vagas en resultados de élite.',
            order_index = 2
        WHERE id = v_module_id;
    END IF;

    -- 2. [CLEANUP] Nuclear cleanup by ID to ensure success regardless of previous state
    DELETE FROM quiz_questions WHERE lesson_id IN ('2-1', '2-2', '2-3', '2-4', '2-5');
    DELETE FROM lessons WHERE id IN ('2-1', '2-2', '2-3', '2-4', '2-5');

    -- 3. [LESSONS MODULE 2]
    INSERT INTO lessons (id, module_id, title, smart_goal, content, video_url, order_index)
    VALUES 
    ('2-1', v_module_id, 'La Arquitectura del Éxito (The Blueprint)', 'Estructurar un prompt complejo utilizando al menos 3 tipos de delimitadores en 15 minutos.', '<div class="prose prose-invert max-w-none"><p>En el mundo de la IA, el contexto es la moneda de cambio.</p></div>', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
    ('2-2', v_module_id, 'La Identidad del Sistema (Role Prompting)', 'Definir un Persona detallado que reduzca la ambigüedad en las respuestas en un 90%.', '<div class="prose prose-invert max-w-none"><p>Una IA sin rol es una IA genérica.</p></div>', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
    ('2-3', v_module_id, 'Patrones de Aprendizaje (Few-Shot)', 'Implementar un prompt de Few-shot para tareas de clasificación con precisión superior al Zero-shot.', '<div class="prose prose-invert max-w-none"><p>¿Zero-shot o Few-shot?</p></div>', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3),
    ('2-4', v_module_id, 'El Hilo de la Lógica (Chain of Thought)', 'Resolver un problema lógico complejo forzando al modelo a desglosar su razonamiento paso a paso.', '<div class="prose prose-invert max-w-none"><p>No pidas el resultado, pide el proceso.</p></div>', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 4),
    ('2-5', v_module_id, 'Protocolos de Seguridad (Verdad AI)', 'Configurar un Filtro de Verdad que obligue a la IA a declarar ignorancia en lugar de inventar datos.', '<div class="prose prose-invert max-w-none"><p>El mayor miedo del usuario es la alucinación.</p></div>', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 5);

    -- 4. [QUIZZES MODULE 2]
    INSERT INTO quiz_questions (lesson_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES 
    ('2-1', '¿Para qué sirve el uso de delimitadores?', 'Para separar instrucciones de los datos y evitar confusiones', 'Para que el texto se vea bonito', 'Para que la IA responda más rápido', 'Para nada', 'A', 'Los delimitadores ayudan a la IA a distinguir entre órdenes y contenido.', 1),
    ('2-2', '¿Cuál es el beneficio del Role Prompting?', 'La IA se vuelve más amigable', 'Se activan patrones de conocimiento especializados', 'El prompt es más corto', 'No tiene beneficios reales', 'B', 'Al asignar un rol, la IA se ancla en un contexto profesional.', 1),
    ('2-3', '¿Qué es el Few-Shot Prompting?', 'Darle pocas oportunidades a la IA', 'Darle ejemplos de entrada/salida antes de la tarea final', 'No darle ninguna instrucción', 'Repetir el prompt varias veces', 'B', 'Few-shot significa dar ejemplos.', 1),
    ('2-4', '¿Qué frase activa técnicamente el Chain of Thought?', 'Hazlo rápido', 'No te equivoques', 'Pensemos paso a paso', 'Dame la respuesta final ya', 'C', 'Esta frase fuerza el razonamiento secuencial.', 1),
    ('2-5', '¿Cómo definimos el fenómeno de que la IA invente datos?', 'Imaginación', 'Alucinación', 'Creatividad', 'Simulación', 'B', 'La alucinación es generar información falsa.', 1);

    -- 5. [VIDEO UPDATES MODULE 1]
    UPDATE lessons SET video_url = 'https://youtu.be/WbkiLMYmMVA', updated_at = NOW() WHERE id = '1-2';
    UPDATE lessons SET video_url = 'https://youtu.be/8QHy4KnwuDU', updated_at = NOW() WHERE id = '1-3';

    RAISE NOTICE 'Módulo 2 desplegado y videos de Módulo 1 actualizados correctamente.';
END $$;
