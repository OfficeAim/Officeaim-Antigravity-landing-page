import re
import glob

def check_html(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    
    start = html.find('<nav class="navbar"')
    if start == -1:
        return
    end = html.find('</nav>', start) + 6
    navbar = html[start:end]
    
    # Count tags
    tags = re.findall(r'</?(?:nav|div|ul|li|a)\b[^>]*>', navbar)
    stack = []
    errors = []
    for tag in tags:
        match = re.match(r'<(/)?([a-z0-9]+)', tag)
        if match:
            is_close = bool(match.group(1))
            tag_name = match.group(2)
            if not is_close:
                stack.append((tag_name, tag))
            else:
                if not stack:
                    errors.append(f"Orphan closing tag: {tag}")
                else:
                    last_name, last_tag = stack.pop()
                    if last_name != tag_name:
                        errors.append(f"Mismatched tag: opened {last_tag}, closed {tag}")
    
    if stack:
        errors.append(f"Unclosed tags: {[t for n, t in stack]}")
        
    if errors:
        print(f"=== ERRORS IN {filename} ===")
        for err in errors:
            print(err)
    else:
        print(f"{filename}: OK")

for f in glob.glob('*.html'):
    check_html(f)
