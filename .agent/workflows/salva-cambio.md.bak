---
description: How to log a completed task/change during the session.
---

# 📝 Salva Cambio (Save Change Routine)

When the user asks to save a specific change (e.g., "/salva-cambio <description>" or "salva este cambio: <description>"), you must perform the following steps:

## Step 1: Read the Session State
- Open `.agent/session_state.json`.
- If the file does not exist, initialize it with the current timestamp:
  ```json
  {
    "session_start": "YYYY-MM-DDTHH:MM:SS",
    "changes": []
  }
  ```
  (Replace `YYYY-MM-DDTHH:MM:SS` with the current ISO timestamp).

## Step 2: Append the New Change
- Create a new change entry:
  ```json
  {
    "timestamp": "YYYY-MM-DDTHH:MM:SS",
    "description": "<user-provided change description>"
  }
  ```
  (Replace `<user-provided change description>` with the description of the change, and the timestamp with the current ISO timestamp).
- Push this object to the `changes` array in `.agent/session_state.json`.

## Step 3: Write the Updated State
- Save the updated JSON object back to `.agent/session_state.json`.

## Step 4: Acknowledge the Save
- Send a warm response to the user in Rioplatense Spanish, confirming that the change has been added to the session logs buffer. For example:
  > "¡Listo! Acabo de registrar este cambio en el buffer de la sesión actual:
  > - **[Hora]**: `<desc>`
  > Todo esto se va a compilar cuando ejecutemos `/salva-diaria` al final del día."
