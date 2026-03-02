---
description: Start a new session, set up local environment, and establish break reminders.
---

# 🚀 Start Session Workflow

Run this workflow at the very beginning of every new chat session to restore context, start local development tools, and enforce the 2-hour break rule.

## 📦 Step 1: Secure Previous Progress

Before making any changes today, we must back up the project state.
// turbo
Run the local backup script:
```bash
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page"
./backup.sh
```

## 🧠 Step 2: Context Sync

Before writing any new code, read the core project tracking files to understand where we left off.

1. **MANDATORY FIRST ACTION**: Read `session_handoff.md` to confirm the active project context and Phase.
2. Read `IMPLEMENTATION_PLAN.md` to see the current architectural step.
3. Read the most recent entry in `TIMELOG.md` to see what was last completed.
4. Review `SESSION_SUMMARY.md` if it was recently modified.

*Agent Action: Provide the user with a 2-3 sentence summary of the immediate next objective.*

## 💻 Step 3: Start the Frontend Application

// turbo
Start the Vite local development server for the SaaS Hub:
```bash
cd "/Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/hub"
npm run dev
```
*Note: The app will run on http://localhost:5173*

## 🌐 Step 4: Open Workspace

// turbo
Automatically open the landing page and the dashboard in your default browser:
```bash
open "file:///Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/index.html"
sleep 2
open "http://localhost:5173/hub"
```

## 🔄 Step 5: Check if n8n is Needed

Ask the user: *"Are we working on automations today?"*

If the user says **yes**, start the local n8n instance via Docker:
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## 🔔 Step 6: Essential Reminders

Output the following message clearly to the user:
> **🚀 Your environment is starting!** 
> 
> **Quick Links for Today's Session:**
> - 🏠 **Landing Page (Local):** `file:///Users/rodyfigueroa/Movies/OFICEAIM/Officeaim Antigravity landing page/index.html`
> - 🎓 **OfficeAIM Hub & Dev Server:** [http://localhost:5173/hub](http://localhost:5173/hub)
> - ⚙️ **n8n Automations:** [http://localhost:5678](http://localhost:5678)
> 
> **Important:** Please open your Supabase project in your browser to monitor database changes and authentication rules.

## ⏳ Step 7: Initialize Break & Save Guardian (Internal Timer)

Agent, you must now start internally tracking the session time based on the timestamp of the user's first prompt.

**RULE**: If approximately **2 hours** passes:
1. Interrupt exactly what you're doing.
2. Tell the user: *"⏳ It's been 2 hours since we started! Please take a quick break to stretch and rest your eyes."*
3. Automatically run `./backup.sh` again to preserve all recent progress.
4. Update `TIMELOG.md` with the current progress before resuming.
