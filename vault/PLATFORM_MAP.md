# 🗺️ OfficeAIM — Mapa de Plataformas y Ecosistema Tecnológico

> Documento de referencia para entender qué plataforma hace qué, cómo están conectadas, y si son gratuitas o de pago.

**Última actualización:** 2026-06-14

---

## 🧭 Stack Overview (Diagrama mental)

```
[Landing Page] ──── Netlify (hosting estático)
      │
      ├── GitHub (control de versiones / deploy trigger)
      │
[Hub / LMS App] ─── Vite + React (local dev: localhost:5173)
      │
      ├── Supabase (base de datos + auth)
      │
      ├── Google Gemini API (18 agentes AI del Corporate Board)
      │
      └── n8n (automatizaciones y flujos de trabajo)

[Dev Workspace] ──── Antigravity (Google DeepMind IDE agent)
      │
      └── NotebookLM (investigación de contenidos / vlogs)

[News Orchestrator] ─ Python script → newsData.js → React Hub
```

---

## 📦 Plataformas en Uso

---

### 1. 🐙 GitHub
| Campo | Detalle |
|-------|---------|
| **Propósito** | Control de versiones del código + trigger automático de deploy a Netlify |
| **Cuenta** | `OfficeAim` (organización) |
| **Repo** | `Officeaim-Antigravity-landing-page` |
| **Branch activo** | `feature/news-update` |
| **Plan** | ✅ **Gratuito** (repo público o privado bajo org free tier) |
| **Cómo se conecta** | Push a GitHub → Netlify detecta el push y hace deploy automático |

---

### 2. 🟢 Netlify
| Campo | Detalle |
|-------|---------|
| **Propósito** | Hosting del **Landing Page estático** (index.html, news.html, etc.) |
| **URL producción** | URL configurada en Netlify dashboard |
| **Archivo config** | `netlify.toml` en la raíz del proyecto |
| **Plan** | ✅ **Gratuito** (Free tier: 100GB bandwidth/mes, deploy auto desde GitHub) |
| **Cómo se conecta** | GitHub → Netlify (webhook automático). Cada `git push` a la rama configurada = nuevo deploy |
| **⚠️ Importante** | El Hub React (LMS) NO está en Netlify — corre localmente con Vite |

---

### 3. 🟦 Supabase
| Campo | Detalle |
|-------|---------|
| **Propósito** | Base de datos PostgreSQL + autenticación de usuarios (Auth) |
| **Project ID** | `guemwhrdqmbneoccucht` |
| **URL** | `https://guemwhrdqmbneoccucht.supabase.co` |
| **Tablas clave** | `profiles`, `modules`, `lessons`, `support_tickets`, `neural_vault` |
| **Plan** | ✅ **Gratuito** (Free tier: 500MB DB, 50.000 MAUs) |
| **Cómo se conecta** | React Hub importa `@supabase/supabase-js` con la ANON KEY del `.env` |
| **Variables de entorno** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en `hub/.env` |
| **RLS** | Row Level Security activada — políticas de seguridad por usuario |

---

### 4. 🤖 Google Gemini API
| Campo | Detalle |
|-------|---------|
| **Propósito** | Motor AI de los **18 agentes** del Corporate Board + Mascota AIM |
| **SDK** | `@google/generative-ai` |
| **Modelos usados** | `gemini-2.5-flash` (agentes FREE), `gemini-2.5-pro` (agentes PRO/PLUS + Behavioral Psych) |
| **Archivo principal** | `hub/src/services/agentFactory.js` |
| **Plan** | 💰 **De pago** (via Google AI Studio — tiered pricing por tokens) |
| **Variable de entorno** | `VITE_GEMINI_API_KEY` en `hub/.env` |
| **Cómo se conecta** | React llama a `callAgent()` → `agentFactory.js` → Google Gemini API → respuesta |

---

### 5. 📓 NotebookLM (Google Labs)
| Campo | Detalle |
|-------|---------|
| **Propósito** | Investigación de noticias AI para el **News & Vlog Orchestrator** |
| **Integración** | MCP Server (`notebooklm`) conectado a Antigravity IDE |
| **Plan** | ✅ **Gratuito** (Google Labs — beta) |
| **Cómo se conecta** | `orchestrator.py` llama al MCP → NotebookLM genera el contenido del vlog → script lo inyecta en `newsData.js` |
| **Skill relacionada** | `.agent/skills/notebooklm-researcher/SKILL.md` |

---

### 6. ⚡ Antigravity (Google DeepMind)
| Campo | Detalle |
|-------|---------|
| **Propósito** | **Agente de desarrollo** — escribe código, hace commits, gestiona el proyecto |
| **Tipo** | IDE Agent (este soy yo) |
| **Plan** | 💰 **De pago** (plan Google AI — cuota de tokens/mensajes por sesión) |
| **MCP Servers activos** | `supabase-mcp-server`, `notebooklm`, `engram`, `stitch`, `context7` |
| **Engram** | Memoria persistente entre sesiones (guarda decisiones, bugs, arquitectura) |
| **Cómo se conecta** | Corre localmente en el IDE, lee/escribe archivos directamente en el workspace |

---

### 7. ⚙️ n8n
| Campo | Detalle |
|-------|---------|
| **Propósito** | **Automatización de workflows** (emails, webhooks, integraciones externas) |
| **Carpeta** | `N8N workflows/` en el proyecto |
| **Guía** | `.agent/workflows/n8n-integration-guide.md` |
| **Plan** | ✅ **Gratuito** (self-hosted) o cloud starter |
| **Cómo se conecta** | Webhooks desde el Hub React → n8n procesa → acciones automáticas (email, DB, etc.) |

---

### 8. 🐍 News Vlog Orchestrator (Python)
| Campo | Detalle |
|-------|---------|
| **Propósito** | Genera automáticamente artículos de noticias AI y los inyecta en el Hub |
| **Archivo** | `news-vlog-orchestrator/scripts/orchestrator.py` |
| **Outputs** | → `hub/src/pages/newsData.js` (React Hub) + `news/*.html` (Landing) |
| **Dependencias** | Python, NotebookLM MCP, RSS feeds |
| **Plan** | ✅ **Gratuito** (script local) |
| **Cómo se conecta** | Se ejecuta manual o automáticamente → modifica `newsData.js` → Vite Hot Reload actualiza el Hub |

---

## 🔗 Cómo se conectan entre sí (Flujo completo)

```
1. DESARROLLO
   Vos + Antigravity → escriben código → git commit → git push a GitHub

2. DEPLOY LANDING
   GitHub push → Netlify detecta → hace build → publica la landing

3. AUTENTICACIÓN / DATOS
   Usuario entra al Hub (localhost:5173) → React → Supabase Auth
   → profile cargado → muestra dashboard personalizado

4. AGENTES AI
   Usuario habla con un agente → React → agentFactory.js → Gemini API
   → respuesta generada → renderizada en el chat

5. NOTICIAS / VLOGS
   orchestrator.py → NotebookLM → genera artículo
   → inyecta en newsData.js → React Hub muestra actualizaciones
   → landing page news.html actualizada manualmente

6. AUTOMATIZACIONES
   Eventos del Hub → webhooks → n8n → acciones externas (email, etc.)
```

---

## 💡 Servicios Explorados pero NO activos

| Plataforma | Estado | Razón |
|------------|--------|-------|
| **Jules** (Google Labs) | ❌ Descartado | Requiere Render para funcionar bien. OfficeAIM usa Netlify. |
| **Render** | ❌ Sin uso | Conectado por error durante exploración de Jules. No usado. |
| **Vercel** | ❌ Sin uso | Se eligió Netlify desde el inicio. Funcionalmente equivalente. |

---

## 🔑 Variables de Entorno (qué va en qué archivo)

| Variable | Archivo | Para qué |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | `hub/.env` | Conexión a Supabase |
| `VITE_SUPABASE_ANON_KEY` | `hub/.env` | Auth pública de Supabase |
| `VITE_GEMINI_API_KEY` | `hub/.env` | Acceso a los 18 agentes Gemini |

> ⚠️ **NUNCA** subas el `.env` a GitHub. Está en `.gitignore`.

---

## 📊 Resumen de Costos

| Plataforma | ¿Gratis? | Límite free |
|------------|----------|-------------|
| GitHub | ✅ Sí | Repos ilimitados (org free) |
| Netlify | ✅ Sí | 100GB bandwidth/mes |
| Supabase | ✅ Sí | 500MB DB, 50k MAUs |
| NotebookLM | ✅ Sí | Beta gratuita |
| n8n | ✅ Sí | Self-hosted ilimitado |
| Google Gemini API | 💰 Pago | Cobra por tokens usados |
| Antigravity IDE | 💰 Pago | Cuota de mensajes/sesión |

---

*Documento mantenido por Antigravity. Actualizar con cada nueva plataforma integrada.*
