---
name: notebooklm-researcher
description: A bridge skill to interact with NotebookLM via MCP using custom Python scripts for connection verification, content querying, and notebook cleanup.
---

# NotebookLM Researcher Skill

This skill provides a set of tools to interact with Google's NotebookLM via the MCP implementation, bypassing IDE-specific UI limitations by using direct Python scripting.

## Capabilities

1.  **Verify Connection**: Checks if the NotebookLM MCP server is reachable and lists available notebooks.
2.  **Deep Query**: Creates a new notebook, uploads content (text/files), and performs deep analysis queries with retry logic.
3.  **Cleanup**: Removes duplicate or empty notebooks to keep the workspace clean.

## Usage

### 1. Verify Connection
Run this to ensure the "Bridge" is active.
```bash
python3 .agent/skills/notebooklm-researcher/scripts/verify_connection.py
```

### 2. Research & Query
Use this script to upload content and get "Evergreen" insights.
*Note: Edit the script to point to the specific files you want to analyze.*
```bash
python3 .agent/skills/notebooklm-researcher/scripts/research_content.py
```

### 3. Cleanup
Run this to delete "OfficeAIM_Module2_Research" duplicates.
```bash
python3 .agent/skills/notebooklm-researcher/scripts/cleanup.py
```

## Requirements
*   `uv` installed
*   `notebooklm-mcp-server` installed via `uv`
*   Chrome running in debug mode (handled by `setup_mcp.sh` if needed)

## Triggers (Cuándo usar)
- **Content DNA**: Al iniciar la fase de "Content Seed" para un nuevo módulo.
- **Deep Research**: Cuando el usuario pida investigar una tendencia o concepto complejo (ej. "Analiza las tendencias de AI en 2026").
- **Workspace Hygiene**: Cuando se detecten notebooks con nombres duplicados o vacíos en el entorno.

## Checklist de Calidad
- [ ] **Latencia MCP**: ¿El servidor responde en < 5 segundos? (Verificar con `verify_connection.py`).
- [ ] **Filtro Evergreen**: ¿El contenido extraído trasciende las herramientas actuales? (Evitar "turtoriales de botones").
- [ ] **Schema Compliance**: ¿El resultado JSON/Texto encaja con el esquema de `lessons` de Supabase?
- [ ] **Source Verification**: ¿Se han usado al menos 3 fuentes, o 1 fuente de alta densidad?

## Formato de Entrega
- **Output Principal**: Archivo Markdown estructurado (`insight.md`).
- **Log de Operaciones**: Registro de limpieza en `cleanup.log` si aplica.
- **SQL Ready**: Si el objetivo es contenido, entregar snippet SQL válido para inserción.

## Governance (Constitución)
Esta skill opera bajo el protocolo **E.T.A.P.A.** y debe respetar `gemini.md`:
- Consultar `@gemini.md` para terminología aprobada (ej. "AI Confidence" vs "AI Fear").
- **Matriz de Autonomía**: 
    - *Verde*: Reintentar conexiones fallidas, borrar archivos temporales creados por la skill.
    - *Rojo*: Borrar notebooks pre-existentes no creados por el agente (Pedir permiso al usuario).
