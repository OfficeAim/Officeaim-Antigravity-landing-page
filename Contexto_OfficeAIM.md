# 🎯 Contexto OfficeAIM: The Source of Truth

Este documento actúa como el **manual de identidad y reglas técnicas** de OfficeAIM: The Antigravity LMS. Toda sugerencia de código, diseño o contenido generada por la IA debe alinearse estrictamente con los principios aquí descritos.

---

## 💎 Identidad Visual: "The Luxury AI Lab"
OfficeAIM no es una plataforma educativa común; es un laboratorio de lujo.
- **Paleta de Colores**: Fondo extremadamente oscuro (`#05070A`), acentos en `Cyan` (`#22D3EE`) y `Indigo` (`#6366F1`).
- **Estética**: Glassmorphism (efectos de cristal con desenfoque), bordes redondeados (`rounded-2xl` o `3xl`), y acentos brillantes ("glowing accents").
- **Animaciones**: Uso de `Framer Motion` para transiciones suaves y estados de hover que hagan sentir la interfaz "viva".
- **Imágenes**: Siempre de alta fidelidad, generadas por AI, reforzando el concepto de "Antigravedad" y tecnología de élite.

## 🎭 Tono de Comunicación
- **Objetivo**: Transformar la "Ansiedad AI" en "Confianza AI".
- **Estilo**: Profesional, inspirador y empoderador.
- **Narrativa**: El aprendizaje es un "ascenso" (Antigravedad). Cada módulo es un hito ganado.

## 🛠️ Stack Técnico y Reglas de Desarrollo
- **Frontend**: React + Vite + TailwindCSS.
- **Backend/Base de Datos**: Supabase (Auth, RLS, Storage).
- **Automatización**: n8n via webhooks (Trigger: 100% progreso).
- **Estructura de Datos**:
    - **Cursos (Courses)** → **Módulos (Modules)** → **Lecciones (Lessons)**.
    - Las lecciones incluyen: Video URL, Contenido (HTML/Markdown) y **SMART Goal**.
- **Regla de Progreso (Reward Path)**:
    - Las lecciones se desbloquean secuencialmente.
    - Cada lección tiene un Quiz obligatorio.
    - **Nota de Aprobación**: Mínimo 80% para desbloquear la siguiente lección.

---

## 🚀 Misión del Agente
Usa el contenido de este archivo para que cada sugerencia de código (Componentes UI), semillas de base de datos (SQL Content Seed) o flujos de trabajo se ajusten a esta visión de **Campus Digital Premium**.
