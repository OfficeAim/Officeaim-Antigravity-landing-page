from html.parser import HTMLParser
import glob

class HTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []
        
    def handle_starttag(self, tag, attrs):
        if tag in ['div', 'ul', 'li', 'a', 'section', 'nav', 'header', 'main', 'span']:
            self.tags.append((tag, self.getpos()))
            
    def handle_endtag(self, tag):
        if tag in ['div', 'ul', 'li', 'a', 'section', 'nav', 'header', 'main', 'span']:
            if not self.tags:
                self.errors.append(f"Orphan closing tag </{tag}> at line {self.getpos()[0]}")
            else:
                last_tag, last_pos = self.tags.pop()
                if last_tag != tag:
                    self.errors.append(f"Mismatched tag: opened <{last_tag}> at line {last_pos[0]}, closed </{tag}> at line {self.getpos()[0]}")

def check_file(filename):
    parser = HTMLValidator()
    with open(filename, 'r', encoding='utf-8') as f:
        html = f.read()
    parser.feed(html)
    
    if parser.tags or parser.errors:
        print(f"=== ERRORS IN {filename} ===")
        if parser.tags:
            for tag, pos in parser.tags[:5]:
                print(f"<{tag}> at line {pos[0]} is never closed")
        if parser.errors:
            for err in parser.errors[:5]:
                print(err)
    else:
        print(f"{filename}: OK")

check_file('resources/website-creator.html')
