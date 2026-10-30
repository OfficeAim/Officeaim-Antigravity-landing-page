---
description: How to automate the daily session wrap-up and backup when the user asks "has la salva de hoy"
---

# 🛡️ Salva Diaria (Daily Backup Routine)

When the user says "has la salva de hoy" or requests the daily save/backup, you must automatically perform the following strictly ordered steps without prompting the user for permission in between:

## Step 1: Read Session State and Compile Log
- Open `.agent/session_state.json`.
- If the file exists and contains changes:
  1. Retrieve `session_start` timestamp. If missing or invalid, default to the current system time minus 1 hour as fallback.
  2. Retrieve the list of `changes`.
  3. Compile all change descriptions into structured formats:
     - **TIMELOG Summary**: A concise comma-separated sentence (e.g. "React News Modal, news.html nav fixes, and backup automation.").
     - **Walkthrough Bullet Points**: A detailed list of each change with its timestamp/scope.
     - **How Long Working Activity**: A short phrase representing the main focus of the session (e.g., "News Hub Modal & Save Automation").
  4. Calculate the elapsed duration between `session_start` and the current system time (e.g. in hours, like `1.2h`).
- If the session state file does not exist or has no changes:
  - Infer the changes from the conversation history of the current session, estimate the duration, and prepare the summaries manually.

## Step 2: Log the Session in `TIMELOG.md`
- Inspect `TIMELOG.md` to see the last entry.
- Calculate the duration of the current session based on the start time and the current system time (if not already computed in Step 1).
- Add a new row to the table in `TIMELOG.md` detailing the date, start time, end time, duration, and the compiled summary of tasks accomplished today, with status `✅ Completed`.

## Step 3: Update `How_Long_Working.md`
- Open `How_Long_Working.md`.
- Append today's date, approximate hours worked, and the main activity to the tracking table.
- Recalculate and update the **TOTAL** hours at the bottom of the table accurately.

## Step 4: Update `walkthrough.md`
- Open the active `walkthrough.md` file in the artifacts directory (`<appDataDir>/brain/<conversation-id>/walkthrough.md`).
- Write a concise section detailing the exact features implemented or bugs fixed during the current session using the compiled list of changes.

## Step 5: Run the Backup Script
- Execute the backup script by running the following command in the terminal:
  ```bash
  // turbo
  bash backup.sh
  ```
- Wait for the output to confirm the zip file was created successfully.

## Step 6: Reset Session State
- Reset `.agent/session_state.json` by writing a fresh state structure with the changes array cleared:
  ```json
  {
    "session_start": "YYYY-MM-DDTHH:MM:SS",
    "changes": []
  }
  ```
  (Replace `YYYY-MM-DDTHH:MM:SS` with the current system timestamp).

## Step 7: Final Report to User
- Send a friendly final message to the user confirming that:
  - The timelog and how-long-working tables have been updated automatically based on the session logs.
  - The walkthrough documentation has been written.
  - The `_backups/hub_src_YYYY-MM-DD...zip` file has been generated successfully.
- Tell the user to rest and have a great day.

