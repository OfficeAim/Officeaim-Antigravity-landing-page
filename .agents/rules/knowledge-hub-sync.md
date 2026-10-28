---
trigger: always_on
description: "Registra decisiones y conocimiento reutilizable de OfficeAIM en la bóveda central Knowledge-Hub sin copiar secretos ni el repositorio."
---

# Protocolo obligatorio OfficeAIM → Knowledge-Hub

La bóveda central está en:
`/Users/rodyfigueroa/Movies/Knowledge-Hub Obsidian/Knowledge-Hub`

Antes de una tarea significativa, consulta:
- `/Users/rodyfigueroa/Movies/Knowledge-Hub Obsidian/Knowledge-Hub/00-Mapa-de-Conocimiento.md`
- `/Users/rodyfigueroa/Movies/Knowledge-Hub Obsidian/Knowledge-Hub/02-Playbooks/Coordinacion/Protocolo-de-Registro-en-Knowledge-Hub.md`
- la nota README de OfficeAIM en `01-Proyectos/OfficeAIM/` si existe.

No registres cada cambio menor. Registra decisiones, problemas y soluciones verificadas, arquitectura, seguridad, integraciones, skills/playbooks reutilizables y cierres de sesión con trabajo significativo.

Antes de responder que terminaste:

1. Actualiza la nota adecuada del Knowledge-Hub si el trabajo alcanza ese umbral.
2. No copies `.env`, claves API, tokens, cookies, contraseñas ni datos privados.
3. Verifica que la nota exista y que no contradiga el código.
4. Reporta por separado:
   - código modificado;
   - notas del Knowledge-Hub modificadas;
   - pruebas ejecutadas;
   - pendientes.
5. Si no pudiste registrar algo, escribe exactamente `REGISTRO PENDIENTE` y explica por qué.

La sincronización es documental: el código permanece en OfficeAIM y el conocimiento reutilizable en Knowledge-Hub. Nunca crees una copia de Knowledge-Hub dentro del repositorio.

---

# Regla Inquebrantable de Idioma y Estilo en el Sitio Web OfficeAIM (Post-19 Oct)

1. **Todo el output visible en páginas web (`*.html`, componentes React públicos, títulos, subtítulos, filtros, botones, placeholders, descripciones de tarjetas y prompts/workflows) DEBE estar SIEMPRE 100% en INGLÉS**, incluso si el usuario redacta el pedido o los ejemplos de etiquetas en español.
2. **Sentence Case obligatorio:** Todos los titulares (`h1`, `h2`, `h3`, títulos de tarjetas) deben usar *sentence case* natural en inglés (solo la primera letra y nombres propios como `OfficeAIM`, `n8n`, `Supabase`, `Gemini`, `SQL`, `JSON`, `AI`, `LLM` en mayúscula).
3. **Nunca preguntar si una página pública va en español o en inglés:** Asumir y aplicar siempre 100% inglés para la interfaz web, manteniendo la conversación con el usuario en español rioplatense.
