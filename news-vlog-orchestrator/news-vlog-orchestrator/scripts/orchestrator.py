#!/usr/bin/env python3
import os
import sys
import json
import time
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import subprocess

import ssl

# Bypass SSL verification for macOS Python environment
ssl._create_default_https_context = ssl._create_unverified_context

# Ensure we print unbuffered
sys.stdout.reconfigure(line_buffering=True)

def load_env(env_path):
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

# Load environment
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
env = load_env(os.path.join(base_dir, "hub/.env"))

def log(step: str, message: str):
    print(f"\n🚀 [{step}] {message}")

def get_autocomplete_score(keyword: str) -> int:
    try:
        q = urllib.parse.quote(keyword)
        url = f"http://suggestqueries.google.com/complete/search?client=chrome&q={q}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            suggestions = data[1]
            return len(suggestions)
    except Exception as e:
        return 0

def rpc_request(process, method, params=None, req_id=1):
    request = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": method
    }
    if params:
        request["params"] = params
    
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()
    
    while True:
        line = process.stdout.readline()
        if not line:
            raise EOFError("MCP Process closed connection")
        line = line.strip()
        if line.startswith('{"'):
            return json.loads(line)

def run_orchestrator(dry_run=False):
    log("STEP 1", "Scoping & Fetching RSS Feed from HLRNet...")
    rss_url = "https://hlrnet.com/sites/ai/?feed=rss2&cat=5"
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
        req = urllib.request.Request(rss_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
        root = ET.fromstring(xml_data)
        items = []
        for item in root.findall('.//item'):
            title = item.find('title').text
            link = item.find('link').text
            pub_date = item.find('pubDate').text
            description = item.find('description').text if item.find('description') is not None else ""
            items.append({
                'title': title,
                'link': link,
                'pub_date': pub_date,
                'description': description
            })
        print(f"   Successfully loaded {len(items)} items from feed.")
    except Exception as e:
        print(f"❌ Error fetching RSS feed: {e}")
        sys.exit(1)

    log("STEP 1b", "Filtering out already published stories...")
    published_path = os.path.join(base_dir, "published_news.json")
    if os.path.exists(published_path):
        with open(published_path, 'r') as f:
            published_urls = json.load(f)
    else:
        published_urls = []
    
    new_items = [it for it in items if it['link'] not in published_urls]
    print(f"   Found {len(new_items)} new stories.")
    if not new_items:
        log("FINISHED", "No new stories to process today. Exiting.")
        return

    log("STEP 2", "Ranking stories by audience interest using Google Autocomplete...")
    ranked_items = []
    for item in new_items:
        # Score title
        score = get_autocomplete_score(item['title'])
        ranked_items.append((score, item))
        print(f"   - '{item['title']}' | Score: {score}")
    
    # Sort descending by score
    ranked_items.sort(key=lambda x: x[0], reverse=True)
    selected_story = ranked_items[0][1]
    log("STEP 2b", f"Selected Main Story: '{selected_story['title']}' (URL: {selected_story['link']})")

    if dry_run:
        log("DRY RUN", "Dry run enabled. Exiting before calling NotebookLM.")
        return

    log("STEP 3", "Initializing NotebookLM MCP Connection...")
    # Launch local notebooklm-mcp server
    cmd = ["uv", "tool", "run", "--from", "notebooklm-mcp-server", "notebooklm-mcp"]
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        bufsize=0
    )

    try:
        rpc_request(process, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "OfficeAIM-Orchestrator", "version": "1.0"}
        }, req_id=1)
        print("   Connection established and initialized.")

        # Create Notebook
        notebook_title = f"OfficeAIM News - {selected_story['title'][:30]}"
        print(f"   Creating notebook: '{notebook_title}'...")
        create_res = rpc_request(process, "tools/call", {
            "name": "notebook_create",
            "arguments": {"title": notebook_title}
        }, req_id=2)
        
        # Parse ID
        content_text = create_res.get("result", {}).get("content", [{}])[0].get("text", "")
        data = json.loads(content_text)
        notebook_id = data.get("notebook", {}).get("id") if "notebook" in data else data.get("notebook_id")
        
        if not notebook_id:
            print("❌ Failed to parse notebook ID.")
            process.terminate()
            sys.exit(1)
        print(f"   Created Notebook ID: {notebook_id}")

        # Add Source URL
        print(f"   Adding source URL: {selected_story['link']}...")
        rpc_request(process, "tools/call", {
            "name": "notebook_add_url",
            "arguments": {"notebook_id": notebook_id, "url": selected_story['link']}
        }, req_id=3)

        print("   Waiting 15 seconds for source indexing...")
        time.sleep(15)

        # Query NotebookLM for synthesis
        query_prompt = (
            "Analyze the attached news article. Based on it, generate the following outputs "
            "formatted strictly as a raw JSON object. Do not include markdown code block syntax "
            "or any extra comments. The JSON keys must be exactly:\n"
            '- "title": A premium headline for the article.\n'
            '- "summary": A compelling 1-2 sentence teaser summary.\n'
            '- "script": A detailed explainer script for a 3-minute video/vlog, in English. Include timestamp markers (e.g. (0:00 - 0:30) Hook) and clear dialogue.\n'
            '- "youtube_desc": A YouTube video description formatted strictly according to this template:\n'
            '  1. A strong hook sentence with emoji.\n'
            '  2. A paragraph starting with "In this week\'s OfficeAIM News, Rody breaks down [Main Topic Summary]. We explain [Key points detailed in the video]."\n'
            '  3. A paragraph announcing the new OfficeAIM Hub features/modules or relevant details.\n'
            '  4. Two Call to Action Links: "👉 Read the full breakdown and subscribe to the Insider Newsletter at https://officeaim.netlify.app" and "👉 Access the Campus & MVP Builder Modules on the landing page".\n'
            '  5. A ⏱️ CHAPTERS / TIMESTAMPS section with timings mapped from the script timing markers.\n'
            '  6. A 💡 KEY TAKEAWAYS section containing 3 concise bullet points with lessons learned.\n'
            '  7. Hashtags including #OfficeAIM, #n8n, #Supabase, #AI, #PromptEngineering, and relevant topic-specific tags.\n'
            '- "facebook_post": A friendly Facebook post summarizing the news, linking to officeaim.netlify.app, and inviting discussions.\n'
            '- "category": A 1-2 word category classification (e.g., "AI Hardware", "Image Generation").'
        )

        print("   Sending query to NotebookLM for content synthesis...")
        query_res = rpc_request(process, "tools/call", {
            "name": "notebook_query",
            "arguments": {"notebook_id": notebook_id, "query": query_prompt}
        }, req_id=4)

        query_text = query_res.get("result", {}).get("content", [{}])[0].get("text", "")
        print(f"\n   Raw Query Text from NotebookLM:\n{query_text}\n")
        
        # Clean potential markdown wrapping
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', query_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1).strip()
        else:
            json_str = query_text.strip()
            
        try:
            synthesis_data = json.loads(json_str)
            # Check if it is the NotebookLM wrapper response containing 'answer' key
            if isinstance(synthesis_data, dict) and "answer" in synthesis_data:
                answer_content = synthesis_data["answer"]
                try:
                    synthesis_data = json.loads(answer_content)
                except Exception:
                    # Maybe it is a string with markdown inside 'answer'
                    json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', answer_content, re.DOTALL)
                    if json_match:
                        synthesis_data = json.loads(json_match.group(1).strip())
                    else:
                        brace_match = re.search(r'\{.*\}', answer_content, re.DOTALL)
                        if brace_match:
                            synthesis_data = json.loads(brace_match.group(0))
        except Exception as je:
            print(f"⚠️ Direct JSON parsing failed: {je}. Attempting heuristic extraction...")
            # Try to find JSON object in the text if there was some preamble
            brace_match = re.search(r'\{.*\}', json_str, re.DOTALL)
            if brace_match:
                try:
                    synthesis_data = json.loads(brace_match.group(0))
                except Exception:
                    synthesis_data = {}
            else:
                synthesis_data = {}

        # Standardize keys to lowercase for robust lookup
        normalized_synthesis = {}
        if isinstance(synthesis_data, dict):
            for k, v in synthesis_data.items():
                normalized_synthesis[k.lower()] = v
            
        # Ensure required keys exist with fallbacks
        synthesis = {
            'title': normalized_synthesis.get('title', selected_story['title']),
            'summary': normalized_synthesis.get('summary', selected_story['description'][:150] if selected_story['description'] else 'AI News update.'),
            'script': normalized_synthesis.get('script', normalized_synthesis.get('vlog_script', normalized_synthesis.get('video_script', ''))),
            'youtube_desc': normalized_synthesis.get('youtube_desc', normalized_synthesis.get('youtube_description', '')),
            'facebook_post': normalized_synthesis.get('facebook_post', normalized_synthesis.get('facebook_description', '')),
            'category': normalized_synthesis.get('category', normalized_synthesis.get('genre', 'AI News'))
        }
        
        # Fallback if script is completely empty
        if not synthesis['script']:
            synthesis['script'] = query_text # use raw text if it couldn't format properly

        print("   Synthesis completed successfully.")

        # Add generated vlog details to persistent notebook
        persistent_notebook_id = "740e2028-5520-47dd-acc6-c5150d36a990"
        print(f"   Adding vlog content to persistent notebook: '{persistent_notebook_id}'...")
        
        compiled_text = (
            f"Title: {synthesis['title']}\n"
            f"Category: {synthesis['category']}\n"
            f"Summary: {synthesis['summary']}\n\n"
            f"--- SCRIPT ---\n"
            f"{synthesis['script']}\n\n"
            f"--- YOUTUBE DESCRIPTION ---\n"
            f"{synthesis['youtube_desc']}\n\n"
            f"--- FACEBOOK POST ---\n"
            f"{synthesis['facebook_post']}\n"
        )
        
        try:
            rpc_request(process, "tools/call", {
                "name": "notebook_add_text",
                "arguments": {
                    "notebook_id": persistent_notebook_id,
                    "title": f"Vlog: {synthesis['title'][:50]}",
                    "text": compiled_text
                }
            }, req_id=5)
            print("   Vlog content successfully saved to persistent notebook.")
        except Exception as pe:
            print(f"⚠️ Warning: could not write to persistent notebook: {pe}")

        # Cleanup: Delete the temporary notebook
        print("   Deleting temporary notebook...")
        rpc_request(process, "tools/call", {
            "name": "notebook_delete",
            "arguments": {"notebook_id": notebook_id, "confirm": True}
        }, req_id=6)

    except Exception as e:
        print(f"❌ Error during NotebookLM MCP communication: {e}")
        process.terminate()
        sys.exit(1)
    finally:
        process.terminate()

    log("STEP 4", "Publishing news to landing page and dashboard...")
    
    # Generate file names
    slugified_title = re.sub(r'[^a-z0-9]+', '-', selected_story['title'].lower()).strip('-')
    filename = f"{slugified_title}.html"
    detail_dir = os.path.join(base_dir, "news")
    os.makedirs(detail_dir, exist_ok=True)
    detail_path = os.path.join(detail_dir, filename)

    # Date formatting
    from datetime import datetime
    formatted_date = datetime.now().strftime("%B %d, %Y")

    # Write detail page HTML
    template_path = os.path.join(base_dir, "news-vlog-orchestrator/news-vlog-orchestrator/templates/news-detail-template.html")
    with open(template_path, 'r') as f:
        template_content = f.read()

    # Convert script newlines to HTML breaks for readable output
    html_content = synthesis['script'].replace('\n', '<br>')
    
    detail_html = template_content\
        .replace("{{TITLE}}", synthesis['title'])\
        .replace("{{DESCRIPTION}}", synthesis['summary'])\
        .replace("{{DATE}}", formatted_date)\
        .replace("{{CATEGORY}}", synthesis.get('category', 'AI News'))\
        .replace("{{CONTENT}}", html_content)\
        .replace("{{VIDEO_EMBED_URL}}", "https://www.youtube.com/embed/dQw4w9WgXcQ") # placeholder video

    with open(detail_path, 'w') as f:
        f.write(detail_html)
    print(f"   Created news detail page: news/{filename}")

    # Inject card into news.html
    news_html_path = os.path.join(base_dir, "news.html")
    with open(news_html_path, 'r') as f:
        news_html_content = f.read()

    card_html = f"""
            <!-- Vlog Card: {synthesis['title']} -->
            <div class="glass-card" style="padding: 0; overflow: hidden; border-radius: 24px;">
                <div onclick="location.href='news/{filename}'" style="height: 200px; background: rgba(0, 242, 254, 0.1) center/cover; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                    <div style="position: absolute; top: 15px; right: 15px; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; color: var(--accent-primary); border: 1px solid rgba(0, 242, 254, 0.3);">
                        {synthesis.get('category', 'AI News')}
                    </div>
                    <!-- Play Button -->
                    <div style="width: 60px; height: 60px; background: rgba(0,0,0,0.5); border: 2px solid var(--accent-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--accent-primary)" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                </div>
                <div style="padding: 24px;">
                    <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 10px;">{synthesis['title']}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">{synthesis['summary']}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.8rem;">
                        <span>Vlog News</span>
                        <span>{formatted_date}</span>
                    </div>
                </div>
            </div>
    """

    news_html_content = news_html_content.replace(
        "<!-- VLOG_CARDS_START -->",
        f"<!-- VLOG_CARDS_START -->\n{card_html}"
    )
    with open(news_html_path, 'w') as f:
        f.write(news_html_content)
    print("   Injected vlog card into news.html grid.")

    # Inject into VlogNewsPage.jsx
    react_page_path = os.path.join(base_dir, "hub/src/pages/VlogNewsPage.jsx")
    with open(react_page_path, 'r') as f:
        react_content = f.read()

    new_vlog_obj = f"""        {{
            id: '{slugified_title}',
            title: '{synthesis['title']}',
            date: '{formatted_date}',
            description: '{synthesis['summary']}',
            image: '/hub/images/module1_hero.png',
            duration: '5:00'
        }},"""

    # Insert right after const vlogs = [
    react_content = re.sub(
        r'const vlogs = \[\s*',
        f"const vlogs = [\n{new_vlog_obj}\n",
        react_content,
        count=1
    )
    with open(react_page_path, 'w') as f:
        f.write(react_content)
    print("   Updated vlogs array in VlogNewsPage.jsx.")

    log("STEP 5", "Updating local publication database...")
    published_urls.append(selected_story['link'])
    with open(published_path, 'w') as f:
        json.dump(published_urls, f, indent=2)
    print("   Added URL to published_news.json database.")

    # Save social text copy to a local reference file
    social_ref_path = os.path.join(base_dir, "latest_transmission.json")
    with open(social_ref_path, 'w') as f:
        json.dump({
            "title": synthesis['title'],
            "youtube_desc": synthesis['youtube_desc'],
            "facebook_post": synthesis['facebook_post'],
            "script": synthesis['script']
        }, f, indent=2)

    log("SUCCESS", "Pipeline fully completed!")
    print("\n📝 YOUTUBE VIDEO DESCRIPTION:")
    print("==============================")
    print(synthesis['youtube_desc'])
    print("\n📝 FACEBOOK POST:")
    print("==============================")
    print(synthesis['facebook_post'])

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    run_orchestrator(dry_run=dry_run)
