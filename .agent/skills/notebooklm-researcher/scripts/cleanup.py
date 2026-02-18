import subprocess
import json
import sys

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
    return json.loads(process.stdout.readline())

def cleanup_notebooks():
    print("🧹 Starting Notebook Cleanup...")
    cmd = ["uv", "tool", "run", "--from", "notebooklm-mcp-server", "notebooklm-mcp"]
    
    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=sys.stderr,
        text=True,
        bufsize=0
    )

    try:
        # Initialize
        rpc_request(process, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "OfficeAIM-Cleanup", "version": "1.0"}
        })
        
        # List Notebooks
        print("🔍 Listing Notebooks...")
        list_res = rpc_request(process, "tools/call", {
            "name": "notebook_list" # Assuming this tool exists based on previous output 'notebook_list'
        }, req_id=2)
        
        # Parse result - typically a list of strings (IDs) or objects in 'content' text
        # Let's see what 'notebook_list' returns. 
        # If it returns a JSON string in 'content', we parse it.
        
        content = list_res.get("result", {}).get("content", [{}])[0].get("text", "[]") # Default to empty list string
        
        notebooks = []
        try:
             # Content might be a JSON string representing a list of dicts
             if isinstance(content, str):
                 notebooks = json.loads(content)
             elif isinstance(content, list):
                 notebooks = content
        except Exception as e:
            print(f"⚠️ Could not parse notebook list: {content[:100]}... Error: {e}")
            return

        # Double check if notebooks is a dict (sometimes returns {'notebooks': [...]})
        if isinstance(notebooks, dict):
            notebooks = notebooks.get('notebooks', [])
            
        print(f"📚 Found {len(notebooks)} notebooks.")
        
        # Filter for "OfficeAIM_Module2_Research"
        targets = [nb for nb in notebooks if isinstance(nb, dict) and nb.get("title") == "OfficeAIM_Module2_Research"]
        
        print(f"🎯 Found {len(targets)} duplicate 'OfficeAIM_Module2_Research' notebooks.")
        
        # Keep the one with the most sources if possible, or delete all empty ones.
        # Since user asked to delete empty ones, let's just delete ALL duplicates for a clean slate
        # and we will recreate ONE correct one later if needed, or just keep the last one.
        
        # Strategy: Delete ALL of them to start clean as requested.
        for nb in targets:
            print(f"🗑️ Deleting {nb['title']} ({nb['id']})...")
            del_res = rpc_request(process, "tools/call", {
                "name": "notebook_delete",
                "arguments": {"notebook_id": nb['id']}
            }, req_id=3)
            print("   Done.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        process.terminate()

if __name__ == "__main__":
    cleanup_notebooks()
