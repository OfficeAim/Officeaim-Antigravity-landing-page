import glob
import re

html_files = glob.glob('*.html')

for file in html_files:
    if file in ['index.backup.html', 'widget_test.html']:
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Locate the 15 Gem Agents mega-link block
    pattern = re.compile(
        r'(<a\s+href="[^"]*gems\.html#gemini"[^>]*>.*?</a>)',
        re.DOTALL
    )
    
    def replacer(match):
        original = match.group(1)
        return original + '\n                                <a href="resources/website-creator.html" class="mega-link">\n                                    <div class="mega-icon">🎨</div>\n                                    <div class="mega-text">\n                                        <strong>AI SVG Logo Lab</strong>\n                                        <span>Bespoke vector design &amp; web coach</span>\n                                    </div>\n                                </a>'

    new_content = pattern.sub(replacer, content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"No match for {file}")
