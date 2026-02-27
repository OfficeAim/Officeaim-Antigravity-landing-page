import os
import glob
import re

html_files = glob.glob('*.html')
html_files = [f for f in html_files if f not in ['security.html', 'index.backup.html']]

new_link = """                                </a>
                                <a href="security.html" class="mega-link">
                                    <div class="mega-icon">🛡️</div>
                                    <div class="mega-text">
                                        <strong>Security & Trust</strong>
                                        <span>Data privacy & encryption</span>
                                    </div>
                                </a>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the blueprint.html block and add the new link
    pattern = re.compile(r'                                \</a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n                <li class="nav-item-dropdown">\n                    <a href="(index.html)?#resources"')
    
    # Alternatively replace based on blueprint.html to be safe
    blueprint_pattern = re.compile(r'(<a href="blueprint\.html" class="mega-link">.*?</a>)', re.DOTALL)
    
    def replacer(match):
        original = match.group(1)
        return original + '\n                                <a href="security.html" class="mega-link">\n                                    <div class="mega-icon">🛡️</div>\n                                    <div class="mega-text">\n                                        <strong>Security & Trust</strong>\n                                        <span>Data privacy & encryption</span>\n                                    </div>\n                                </a>'

    new_content = blueprint_pattern.sub(replacer, content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"Could not find target in {file}")
