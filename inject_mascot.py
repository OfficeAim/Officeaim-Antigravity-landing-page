import os
import re

files_to_inject = ["board.html", "pricing.html", "gems.html", "index.html"]

widget_code = """
    <!-- Global Mascot Widget Injection -->
    <iframe id="mascot-widget" src="/hub/widget"
        style="position: fixed; bottom: 0; right: 0; border: none; z-index: 2147483647; background: transparent; width: 300px; height: 200px; transition: all 0.3s ease-in-out; pointer-events: auto;"
        allowtransparency="true"></iframe>

    <script>
        const widgetIframe = document.getElementById('mascot-widget');
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
        let contextStr = 'landing';
        if(window.location.pathname.includes('pricing')) contextStr = 'pricing';
        else if(window.location.pathname.includes('board')) contextStr = 'board';
        else if(window.location.pathname.includes('gems')) contextStr = 'gems';
        
        widgetIframe.src = (isLocal ? 'http://localhost:5173' : '') + '/hub/widget?context=' + contextStr;

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
