-- OfficeAIM: Actualización de Video para la Lección 1.2
-- Instrucciones: Reemplaza 'TU_URL_DE_VIDEO' con el enlace real (YouTube/Vimeo) y ejecuta este bloque en el Editor SQL de Supabase.

DO $$ 
BEGIN
    UPDATE lessons 
    SET video_url = 'TU_URL_DE_VIDEO', 
        updated_at = NOW()
    WHERE id = '1-2';

    RAISE NOTICE 'Lección 1.2 actualizada con éxito.';
END $$;
