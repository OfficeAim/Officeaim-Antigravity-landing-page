import os
import re
import glob

# Collect all HTML files in the root, excluding backups and tests
files_to_inject = [
    f for f in glob.glob('*.html') 
    if f not in ['index.backup.html', 'widget_test.html', 'index.backup2.html']
]

widget_code = """
    <!-- Global Mascot Widget Injection -->
    <iframe id="mascot-widget" src="/hub/widget"
        style="position: fixed; bottom: 0; right: 0; border: none; z-index: 2147483647; background: transparent; width: 300px; height: 200px; transition: all 0.3s ease-in-out; pointer-events: auto;"
        allowtransparency="true"></iframe>

    <script>
        const widgetIframe = document.getElementById('mascot-widget');
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
        
        let contextStr = 'landing';
        const path = window.location.pathname;
        if(path.includes('pricing')) contextStr = 'pricing';
        else if(path.includes('board')) contextStr = 'board';
        else if(path.includes('gems')) contextStr = 'gems';
        else if(path.includes('security')) contextStr = 'security';
        else if(path.includes('use-cases')) contextStr = 'use-cases';
        else if(path.includes('classroom')) contextStr = 'classroom';
        else if(path.includes('courses')) contextStr = 'courses';
        else if(path.includes('blueprint')) contextStr = 'blueprint';
        else if(path.includes('construction')) contextStr = 'construction';
        
        let activeViteUrl = "http://localhost:5174"; // default fallback (port 5174 is active)
        
        if (isLocal) {
            // Dynamically discover which port is serving the Vite app (5173, 5174, 5175)
            const ports = [5173, 5174, 5175];
            let detected = false;
            
            Promise.any(ports.map(port => 
                fetch(`http://localhost:${port}/hub/logo_officeaim.png`)
                    .then(res => {
                        if (!res.ok) throw new Error("Not our server");
                        if (!detected) {
                            detected = true;
                            activeViteUrl = `http://localhost:${port}`;
                            widgetIframe.src = activeViteUrl + '/hub/widget?context=' + contextStr;
                            console.log("[Mascot Port Auto-Discovery]: Connected to active dev server on port", port);
                        }
                    })
            )).catch(() => {
                // absolute fallback
                widgetIframe.src = activeViteUrl + '/hub/widget?context=' + contextStr;
            });
        } else {
            widgetIframe.src = '/hub/widget?context=' + contextStr;
        }

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'mascot-toggle') {
                const widget = document.getElementById('mascot-widget');
                if (event.data.isOpen) {
                    widget.style.width = '420px';
                    widget.style.height = '600px';
                    widget.style.pointerEvents = 'auto';
                } else {
                    widget.style.width = '300px';
                    widget.style.height = '200px';
                    widget.style.pointerEvents = 'auto';
                }
            }
        });
    </script>
</body>
"""

for fname in files_to_inject:
    if os.path.exists(fname):
        with open(fname, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Remove old widget if it exists to avoid duplicates
        content = re.sub(r'<!-- Global Mascot Widget Injection -->.*?</body>', '</body>', content, flags=re.DOTALL)
        
        # Inject new widget before </body>
        content = content.replace("</body>", widget_code)
        
        with open(fname, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Injected into {fname}")
    else:
        print(f"File not found: {fname}")
