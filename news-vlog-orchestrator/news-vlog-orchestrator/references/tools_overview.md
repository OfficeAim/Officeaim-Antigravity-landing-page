# Resumen de Herramientas para la Skill 'news-vlog-orchestrator'

Esta skill orquesta un flujo de trabajo automatizado para la generación de noticias y podcasts, utilizando las siguientes herramientas:

## 1. Investigación y Validación de Fuentes

*   **Consensus.app:** Utilizado para la búsqueda y validación de información científica y académica, asegurando la fiabilidad de las fuentes de noticias.
*   **Búsqueda Web (Manus):** Realizada por Manus para recopilar las noticias más relevantes del día anterior sobre un tema específico.

## 2. Síntesis y Generación de Contenido Base

*   **NotebookLM:** Actúa como el "cerebro" del sistema, procesando las noticias recopiladas para generar resúmenes estructurados y guiones para el podcast.
*   **Google AI Studio (Gemini API):** Proporciona la capacidad de procesamiento de lenguaje natural para resumir, reescribir y adaptar el contenido de las noticias.

## 3. Producción Multimedia

*   **Ovi 1.1:** Plataforma gratuita para la generación de videos cortos (hasta 10 segundos) con audio sincronizado a partir de texto o imágenes. Ideal para crear clips visuales para el vlog.
*   **Chatterbox:** Alternativa de código abierto y gratuita a Eleven Labs para la generación de voces humanas, asegurando un audio de alta calidad para los podcasts.
*   **Mixboard (Google Labs):** Herramienta gratuita para la creación de activos visuales como miniaturas, posters y gráficos promocionales para el blog y redes sociales.

## 4. Diseño y Publicación Web

*   **Google Stitch:** Herramienta de diseño de UI impulsada por IA que permite crear interfaces de usuario a partir de lenguaje natural. Utilizada por Antigravity para diseñar la sección de blog/vlog en el sitio web de OfficeAIM.
*   **Antigravity:** Agente de desarrollo de Google que interactúa con Google Stitch y el repositorio de GitHub para modificar y desplegar la estructura del sitio web.
*   **Netlify:** Plataforma de hosting que se integra con GitHub para el despliegue automático del sitio web de OfficeAIM cada vez que se realiza un commit al repositorio.

## 5. Automatización y Distribución

*   **n8n:** Herramienta de automatización de código abierto que conecta todas las piezas del flujo de trabajo, desde la investigación hasta la publicación en redes sociales y el blog. Permite crear flujos de trabajo complejos sin necesidad de codificación intensiva.
*   **GitHub Actions:** Utilizado para automatizar el proceso de commit y despliegue en Netlify, así como para posibles tareas de pre-procesamiento o post-procesamiento.
*   **YouTube/Spotify:** Plataformas de distribución para el podcast de audio/video, con enlaces integrados en el blog post para dirigir el tráfico.
*   **Facebook:** Plataforma de redes sociales para la publicación automática de posts promocionales con enlaces al contenido completo.
