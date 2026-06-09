import glob
import re

html_files = glob.glob('*.html')

new_block = """<div class="mega-menu">
                        <div class="mega-menu-inner">
                            <div class="mega-menu-col">
                                <h4>Free Tools</h4>
                                <a href="resources/website-creator.html" class="mega-link">
                                    <div class="mega-icon">🎨</div>
                                    <div class="mega-text">
                                        <strong>AI SVG Logo Lab</strong>
                                        <span>Bespoke vector design &amp; web coach</span>
                                    </div>
                                </a>
                                <a href="gems.html" class="mega-link">
                                    <div class="mega-icon">⭐</div>
                                    <div class="mega-text">
                                        <strong>Prompt Creator</strong>
                                        <span>Create emails and prompts for your site</span>
                                    </div>
                                </a>
                                <a href="gems.html#gemini" class="mega-link">
                                    <div class="mega-icon">💎</div>
                                    <div class="mega-text">
                                        <strong>15 Gem Agents</strong>
                                        <span>Try Google Gemini integrations</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>"""

for file in html_files:
    if file in ['index.backup.html', 'widget_test.html']:
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Locate the exact mega-menu structural block for Resources
    pattern = re.compile(
        r'<div class="mega-menu">\s*<div class="mega-menu-inner">\s*<div class="mega-menu-col">\s*<h4>Free Tools</h4>\s*<a href="gems\.html" class="mega-link">.*?</a>\s*<a href="gems\.html#gemini" class="mega-link">.*?</a>\s*</div>\s*</div>\s*</div>',
        re.DOTALL
    )
    
    new_content = pattern.sub(new_block, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Reordered {file}")
    else:
        print(f"No match for {file}")
