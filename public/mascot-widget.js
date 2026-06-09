// mascot-widget.js – central logic for AIM Mascot iframe
// This script is loaded on every page that contains the <iframe id="mascot-widget">
// It performs:
// 1️⃣ Auto‑discover a local Vite dev server (ports 5173‑5175) and build the widget URL.
// 2️⃣ Fallback to production URL or static fallback page if the server is unreachable.
// 3️⃣ Debug border (visible during dev) is removed once the iframe loads.
// 4️⃣ Listen for `mascot-toggle` messages to resize the widget.
// 5️⃣ Log useful information to the console for troubleshooting.

(async () => {
  const iframe = document.getElementById('mascot-widget');
  if (!iframe) return;

  // --------------------------------------------------
  // 1️⃣ Determine environment (local vs prod)
  // --------------------------------------------------
  const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";

  // --------------------------------------------------
  // 2️⃣ Resolve context based on URL path
  // --------------------------------------------------
  const path = window.location.pathname;
  const contextMap = {
    pricing: "pricing",
    board: "board",
    gems: "gems",
    security: "security",
    "use-cases": "use-cases",
    classroom: "classroom",
    courses: "courses",
    blueprint: "blueprint",
    construction: "construction"
  };
  let contextStr = "landing";
  for (const key in contextMap) {
    if (path.includes(key)) { contextStr = contextMap[key]; break; }
  }

  // --------------------------------------------------
  // 3️⃣ Build widget URL (default = production)
  // --------------------------------------------------
  let widgetUrl = `/hub/widget?context=${contextStr}`;

  // --------------------------------------------------
  // 4️⃣ If running locally, attempt auto‑discovery of the Vite dev server
  // --------------------------------------------------
  if (isLocal) {
    const ports = [5173, 5174, 5175];
    let found = false;
    for (const port of ports) {
      try {
        // Ping a known asset on the dev server – the mascot logo
        const res = await fetch(`http://localhost:${port}/hub/logo_officeaim.png`);
        if (!res.ok) continue; // not our server
        widgetUrl = `http://localhost:${port}/hub/widget?context=${contextStr}`;
        console.log('[Mascot Port Auto-Discovery]: Using', widgetUrl);
        found = true;
        break;
      } catch (_) {
        // ignore network errors – try next port
      }
    }
    if (!found) {
      console.warn('[Mascot Auto-Discovery]: No dev server detected, falling back to production URL');
    }
  }

  // --------------------------------------------------
  // 5️⃣ Assign URL to iframe
  // --------------------------------------------------
  iframe.src = widgetUrl;

  // --------------------------------------------------
  // 6️⃣ Debug border – remove when the widget finishes loading
  // --------------------------------------------------
  iframe.addEventListener('load', () => {
    iframe.style.border = 'none';
  });

  // --------------------------------------------------
  // 7️⃣ Fallback to static page if the widget fails to load (e.g., 404)
  // --------------------------------------------------
  iframe.addEventListener('error', () => {
    console.error('[Mascot Widget] Failed to load, falling back to static fallback page');
    iframe.src = '/mascot-fallback.html';
  });

  // --------------------------------------------------
  // 8️⃣ Resize handling – external components can postMessage({type:'mascot-toggle', isOpen:true/false})
  // --------------------------------------------------
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'mascot-toggle') {
      if (event.data.isOpen) {
        iframe.style.width = '420px';
        iframe.style.height = '300px';
      } else {
        iframe.style.width = '300px';
        iframe.style.height = '200px';
      }
    }
  });
})();
