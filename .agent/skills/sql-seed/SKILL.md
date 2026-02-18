# Skill: SQL Seed Generator

## Descripción
Automatiza la generación de migraciones SQL robustas y autodestructivas para poblar el LMS OfficeAIM, garantizando integridad referencial y compatibilidad con el esquema de IDs tipo String.

## Cuándo Activar
Gatillos: "genera el SQL del módulo", "prepara la migración de contenido", "inserta estas lecciones en Supabase".

## Checklist de Calidad OfficeAIM
- [x] **Estética Premium (Dark Mode)**: Las lecciones insertadas incluyen clases `prose prose-invert`.
- [x] **Compatibilidad de Stack**: Formato compatible con el SQL Editor de Supabase y esquemas PostgreSQL.
- [x] **Zero-Bugs Proof**: Verificación de tipos (Casting `::bigint`) y manejo de IDs de texto (`1-1`, `2-1`).
- [x] **Progressive Learning**: Asegura que el `order_index` sea consecutivo.

## Protocolo E.T.A.P.A. (Ejecución Determinista)
1.  **E**ntender: Mapear si es un nuevo módulo o actualización de uno existente.
2.  **T**rabajar: Generar el bloque `DO $$ ... END $$;`.
3.  **A**nalizar: Verificar que `lessons.id` no sea nulo y que las preguntas del quiz tengan `order_index`.
4.  **P**robar: Simular que la tabla ya tiene datos para evitar errores de llave duplicada.
5.  **A**plicar: Entregar el código SQL final listo para copiar y pegar.

## Formato de Salida
Código SQL bloque `DO $$`.

## Reglas de Oro (OfficeAIM Standard)
- **TEXT IDs para Lessons**: Formato `'{module_index}-{lesson_index}'`.
- **Cleanup**: Siempre incluir `DELETE` previo para permitir la re-ejecución del script (Idempotencia).
- **Subqueries**: Usar variables para capturar el ID del módulo dinámicamente.
