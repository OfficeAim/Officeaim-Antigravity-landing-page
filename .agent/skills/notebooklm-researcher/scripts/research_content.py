import subprocess
import json
import sys
import time

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

def create_and_query():
    print("🔌 Connecting to NotebookLM via MCP...")
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
        # 1. Initialize
        rpc_request(process, "initialize", {
            "protocolVersion": "2024-11-05", # Updated protocol version
            "capabilities": {},
            "clientInfo": {"name": "OfficeAIM-Builder", "version": "1.0"}
        })
        print("✅ Initialized.")

        # 2. Create Notebook
        print("Cmd: Creating Notebook 'OfficeAIM_Module2_Research'...")
        create_res = rpc_request(process, "tools/call", {
            "name": "notebook_create",
            "arguments": {"title": "OfficeAIM_Module2_Research"}
        }, req_id=2)
        
        notebook_id = create_res.get("result", {}).get("content", [{}])[0].get("text")
        # Notebook ID might be returned in a text block, let's parse it or assume the tool returns it clearly.
        # Check actual structure from previous logs if possible, but standard MCP tool call returns text.
        
        # If the tool output is a JSON string, we might need to parse it. 
        # For now, let's print and see. Adapting to standard MCP return: content list.
        
        print(f"✅ Notebook Created. ID: {notebook_id}")

        if not notebook_id:
            print("❌ Failed to create notebook.")
            return

        # 3. Add Sources (Manus AI Files)
        files_to_add = [
            "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/Module 2/AI Course Strategies and QWEN Image Integration/lesson_2_1_content_with_quiz.md",
            "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/Module 2/AI Course Strategies and QWEN Image Integration/lesson_2_2_content_with_quiz.md",
            "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/Module 2/AI Course Strategies and QWEN Image Integration/lesson_2_3_content_with_quiz.md"
        ]

        for file_path in files_to_add:
            print(f"Cmd: Adding source {file_path}...")
            # We'll use 'notebook_add_text' reading the file content locally first, 
            # as 'notebook_add_url' might not support local paths easily without a server.
            # OR check if there is a 'notebook_upload' tool. 
            # The list tools showed: 'notebook_add_url', 'notebook_add_text', 'notebook_add_drive'.
            # Best bet is 'notebook_add_text'.
            
            with open(file_path, 'r') as f:
                content = f.read()
                
            rpc_request(process, "tools/call", {
                "name": "notebook_add_text",
                "arguments": {
                    "notebookId": notebook_id,
                    "text": content,
                    "title": file_path.split("/")[-1]
                }
            }, req_id=3)
            time.sleep(1) # small delay to be safe

        print("✅ Sources Added.")

        # Fix: Parse the notebook_id correctly from the previous JSON string if needed
        # The previous output showed that `notebook_id` variable contained a JSON string: '{"status":"success","notebook_id":"..."}'
        # or similar. Let's try to be robust. 
        
        real_notebook_id = notebook_id
        try:
            # If it looks like JSON, parse it
            if isinstance(notebook_id, str) and "{" in notebook_id:
                id_data = json.loads(notebook_id)
                real_notebook_id = id_data.get("notebook_id", notebook_id)
        except:
            pass
            
        print(f"✅ Using Notebook ID: {real_notebook_id}")

        # 4. Query for Evergreen Strategy
        print("❓ Querying NotebookLM for Analysis (Real Investigation)...")
        # Extended prompt to ensure deep analysis
        query_prompt = (
            "Act as a high-end productivity consultant for executives. "
            "Analyze the provided lessons (Email, Calendar, Documents). "
            "Ignore the basic 'how-to' clicks. Instead, extract the underlying 'Evergreen' principles "
            "that apply regardless of the tool used. "
            "Define 3 'Executive Protocols' (one for each topic) that sound premium and strategic. "
            "For each, provide a 'Philosophy' and a 'Concrete Action'."
        )
        
        max_retries = 10 
        # Increased retries because indexing text can take 10-30s
        
        for attempt in range(max_retries):
            print(f"⏳ Query Attempt {attempt+1}/{max_retries} (Waiting for indexing)...")
            
            # Wait before querying to allow indexing
            if attempt == 0:
                time.sleep(10) 
            else:
                time.sleep(15)

            query_res = rpc_request(process, "tools/call", {
                "name": "notebook_query",
                "arguments": {
                    "notebook_id": real_notebook_id,
                    "query": query_prompt
                }
            }, req_id=4+attempt)
            
            # Extract answer
            content_list = query_res.get("result", {}).get("content", [])
            answer = ""
            if content_list:
                answer = content_list[0].get("text", "")

            # Validation: Check if answer is substantial (not just "processing...")
            if answer and len(answer) > 200:
                print("\n🤖 NotebookLM Answer (REAL):\n")
                print(answer)
                # Save answer to a file for the Agent to read
                with open("notebooklm_insight.txt", "w") as f:
                    f.write(answer)
                break
            else:
                print(f"⚠️  Answer too short/empty ({len(answer)} chars). content: {answer[:50]}...")
                print("   NotebookLM is likely still reading the files. Retrying...")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        process.terminate()

if __name__ == "__main__":
    create_and_query()
