# Skill: Content Seed

## Descripción
Automatiza la transformación de investigaciones de NotebookLM o archivos PDF en el "ADN" educativo de OfficeAIM (Módulos, Lecciones y Quizzes).

## Cuándo Activar
Gatillos: "Crea el contenido para el módulo X", "Toma este PDF y conviértelo en lecciones", "Usa la investigación de NotebookLM para generar el curso".

## Checklist de Calidad OfficeAIM
- [ ] **Estética Premium**: Contenido HTML con clases `glass-card`, `action-box` y `prose-invert`.
- [ ] **Estructura SMART**: Cada lección debe tener un objetivo claro y medible.
- [ ] **Garantía de Retención**: Quizzes diseñados para validar el conocimiento técnico, no solo la memoria.
- [ ] **Branding**: Tono "Luxury AI Lab" (elegante, empoderador, técnico).

## Protocolo E.T.A.P.A. (Ejecución Determinista)
1.  **E**ntender: Leer la fuente de conocimiento (PDF o NotebookLM) y mapear los 5 hitos de aprendizaje.
2.  **T**rabajar: Generar las lecciones y preguntas del quiz con contenido de alta fidelidad.
3.  **A**nalizar: Verificar que los ejemplos prácticos funcionen y sean relevantes para el nivel del estudiante.
4.  **P**robar: Revisar que el HTML generado sea válido y no rompa el layout del Hub.
5.  **A**plicar: Delegar al `SQL Seed Generator` para la inserción final.

## Formato de Salida
Contenido estructurado para ser procesado por el `SQL Seed Generator`.
