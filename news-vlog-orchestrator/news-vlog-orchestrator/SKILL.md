---
name: news-vlog-orchestrator
description: Orquesta la investigación diaria de noticias, la síntesis de contenido, la generación de podcasts/vlogs, la publicación en el sitio web (Netlify) y la distribución en redes sociales, utilizando herramientas de IA gratuitas. Úsalo cuando el usuario desee automatizar la creación y publicación de un vlog/podcast de noticias diario sobre un tema específico.
---

# Skill: News Vlog Orchestrator

Esta skill automatiza el proceso completo de creación y publicación de un vlog/podcast de noticias diario, desde la investigación hasta la distribución en redes sociales. Está diseñada para operar con un presupuesto cero, aprovechando herramientas de IA gratuitas y la infraestructura existente del usuario (Netlify, GitHub, Google Pro).

## Flujo de Trabajo Automatizado

El flujo de trabajo se activa con un comando simple y sigue los siguientes pasos:

1.  **Activación:** El usuario invoca la skill con un tema y una fecha (ej. "noticias de IA de ayer").
2.  **Investigación:** Manus realiza una búsqueda exhaustiva de noticias relevantes del día anterior sobre el tema especificado, utilizando fuentes confiables y, si es necesario, **Consensus.app** para validar información académica.
3.  **Síntesis de Contenido:** La información recopilada se procesa utilizando **NotebookLM** y la **API de Gemini (Google AI Studio)** para generar un resumen estructurado y un guion detallado para el podcast/vlog.
4.  **Producción Multimedia:**
    *   **Generación de Video:** Se utiliza **Ovi 1.1** para crear clips de video cortos y dinámicos a partir del guion, con audio sincronizado.
    *   **Generación de Audio:** Se emplea **Chatterbox** para producir voces humanas de alta calidad para el podcast.
    *   **Activos Visuales:** **Mixboard** se utiliza para diseñar miniaturas, gráficos y otros elementos visuales para el blog y el video.
5.  **Publicación Web:**
    *   El contenido (resumen, enlaces a fuentes, enlaces a audio/video) se formatea como un archivo Markdown (`.md`).
    *   **Antigravity**, utilizando **Google Stitch**, se encarga de asegurar que la estructura del blog en `officeaim.netlify.app` sea adecuada y publica el nuevo post mediante un commit al repositorio de GitHub del usuario.
    *   **Netlify** detecta el cambio en el repositorio y despliega automáticamente la nueva página en el sitio web.
6.  **Distribución en Redes Sociales:**
    *   **n8n** (o un script similar) automatiza la publicación de un post en **Facebook** con un resumen y un enlace al blog post completo.
    *   Los enlaces directos al podcast/vlog en **YouTube** y **Spotify** se incluyen en el blog post para dirigir el tráfico.

## Uso de la Skill

Para utilizar esta skill, invoca el script `orchestrator.py` con el tema de las noticias y la fecha (en formato YYYY-MM-DD) para el día anterior.

```bash
python /home/ubuntu/skills/news-vlog-orchestrator/scripts/orchestrator.py "[tema_de_noticias]" "[fecha_del_dia_anterior]"
```

**Ejemplo:**

```bash
python /home/ubuntu/skills/news-vlog-orchestrator/scripts/orchestrator.py "inteligencia artificial" "2026-06-08"
```

## Recursos Adicionales

*   **`references/tools_overview.md`**: Proporciona un resumen detallado de cada herramienta utilizada en este flujo de trabajo y su función específica.
*   **`scripts/orchestrator.py`**: Contiene la lógica principal para orquestar los pasos del flujo de trabajo. Este script será desarrollado y ampliado para integrar las APIs y herramientas mencionadas.
