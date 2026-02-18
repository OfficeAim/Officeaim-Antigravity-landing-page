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

def verify_core():
    print("🔌 connecting to NotebookLM...")
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
            "protocolVersion": "2024-11-05", # Updated protocol version
            "capabilities": {},
            "clientInfo": {"name": "OfficeAIM-Verifier", "version": "1.0"}
        })
        
        # List Notebooks
        print("🔍 Listing ALL Notebooks to find 'OfficeAIM_Core_Architecture'...")
        list_res = rpc_request(process, "tools/call", {
            "name": "notebook_list" 
        }, req_id=2)
        
        content = list_res.get("result", {}).get("content", [{}])[0].get("text", "[]")
        
        notebooks = []
        try:
             if isinstance(content, str):
                 notebooks = json.loads(content)
             elif isinstance(content, list):
                 notebooks = content
        except:
            pass

        if isinstance(notebooks, dict):
             notebooks = notebooks.get('notebooks', [])

        core_nb = None
        print("📋 Notebooks found in account:")
        for nb in notebooks:
            title = nb.get('title', 'Unknown')
            nb_id = nb.get('id', 'Unknown')
            print(f" - '{title}' (ID: {nb_id})")
            
            # Fuzzy match: Look for "Core_Architecture" inside the title
            # This handles emojis like 🚀 and extra spaces
            if "Core_Architecture" in title:
                core_nb = nb

        if core_nb:
            print(f"\n✅ FOUND IT! '{core_nb['title']}' exists with ID: {core_nb['id']}")
            print("❓ Attempting to query it to PROVE connection...")
            
            # Simple query to prove we can read it
            query_res = rpc_request(process, "tools/call", {
                "name": "notebook_query",
                "arguments": {
                    "notebook_id": core_nb['id'],
                    "query": "What are the main 3 layers of the architecture? Answer briefly."
                }
            }, req_id=3)
            
            # Parse answer
            content_list = query_res.get("result", {}).get("content", [])
            answer = ""
            if content_list:
                answer = content_list[0].get("text", "")
            
            print(f"\n🤖 NotebookLM Answer from {core_nb['title']}:\n")
            print(answer)
        else:
            print("\n❌ Could not find 'OfficeAIM_Core_Architecture'.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        process.terminate()

if __name__ == "__main__":
    verify_core()
