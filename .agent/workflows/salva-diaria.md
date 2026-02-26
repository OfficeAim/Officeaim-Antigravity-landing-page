---
description: How to automate the daily session wrap-up and backup when the user asks "has la salva de hoy"
---

# 🛡️ Salva Diaria (Daily Backup Routine)

When the user says "has la salva de hoy" or requests the daily save/backup, you must automatically perform the following strictly ordered steps without prompting the user for permission in between:

## Step 1: Log the Session in `TIMELOG.md`
- Inspect `TIMELOG.md` to see the last entry.
- Calculate the duration of the current session based on the start time and the current system time.
- Add a new row to the table in `TIMELOG.md` detailing the date, start time, end time, duration, and a brief summary of tasks accomplished today.

## Step 2: Update `How_Long_Working.md`
- Open `How_Long_Working.md`.
- Append today's date, approximate hours worked, and main activity to the tracking table.
- Recalculate and update the **TOTAL** hours at the bottom of the table accurately.

## Step 3: Update `walkthrough.md`
- Open the active `walkthrough.md` file in the artifacts directory (`<appDataDir>/brain/<conversation-id>/walkthrough.md`).
- Write a concise section detailing the exact features implemented or bugs fixed during the current session.

## Step 4: Run the Backup Script
- Execute the backup script by running the following command in the terminal:
  ```bash
  // turbo
  bash backup.sh
  ```
- Wait for the output to confirm the zip file was created successfully.

## Step 5: Final Report to User
- Send a friendly final message to the user confirming that:
  - The timelog and how-long-working tables have been updated.
  - The walkthrough documentation has been written.
  - The `_backups/hub_src_YYYY-MM-DD...zip` file has been generated successfully.
- Tell the user to rest and have a great day.
