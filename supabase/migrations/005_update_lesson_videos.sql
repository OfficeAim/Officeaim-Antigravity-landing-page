-- OfficeAIM: Actualización de Videos para Clases 1.2 y 1.3
-- Autor: Antigravity
-- Status: Despliegue de Fase 9

DO $$ 
BEGIN
    -- Actualizar Clase 1.2
    UPDATE lessons 
    SET video_url = 'https://youtu.be/WbkiLMYmMVA', 
        updated_at = NOW()
    WHERE id = '1-2';

    -- Actualizar Clase 1.3
    UPDATE lessons 
    SET video_url = 'https://youtu.be/8QHy4KnwuDU', 
        updated_at = NOW()
    WHERE id = '1-3';

    RAISE NOTICE 'Videos de las clases 1.2 y 1.3 actualizados con éxito.';
END $$;
