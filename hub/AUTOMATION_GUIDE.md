# OfficeAIM Automation Guide (n8n + Supabase)

This guide documents the "Glue" workflows that make the Campus feel alive. These workflows should be imported into your local n8n instance.

## 1. Welcome & Access Workflow
**Trigger:** New entry in `profiles` table.
**Action:** Sends a welcome email with a "Day 1" tip from the Behavioral Psychologist.

### Workflow Logic:
1.  **Webhook Node:** Listens for POST requests from Supabase.
2.  **Code/Set Node:** Extracts `full_name`, `email` (from auth), and `membership_status`.
3.  **Behavioral Agent Node (Optional/Mock):** Pulls a rotation of "Day 1" tips.
4.  **Email Node:** Sends the formatted welcome message.

### n8n Workflow JSON:
(Copy this into n8n's "Import from JSON")
```json
{
  "name": "OfficeAIM: Welcome & Access",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "supabase-new-user",
        "options": {}
      },
      "name": "Supabase Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "officeaim-new-user"
    },
    {
      "parameters": {
        "text": "## Welcome to OfficeAIM, {{ $json.record.full_name }}! \n\nHere is your Day 1 Tip from the Team Brain: \n\n> \"Don't try to learn everything today. Just find ONE email you can use the AI to draft. Speed is evidence, and evidence kills anxiety.\"",
        "title": "Welcome Email Template"
      },
      "name": "Email Content",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "fromEmail": "officeaim@yourdomain.com",
        "toEmail": "={{ $node[\"Supabase Webhook\"].json[\"record\"][\"email\"] }}",
        "subject": "=Welcome to the Campus, {{ $node[\"Supabase Webhook\"].json[\"record\"][\"full_name\"] }}!",
        "html": "=<h1>Welcome to OfficeAIM</h1><p>You've taken the first step toward office superpowers.</p><p><strong>Day 1 Tip:</strong> Don't try to learn everything today. Just find ONE email you can use the AI to draft. Speed is evidence, and evidence kills anxiety.</p><p>See you in the Dashboard!</p>"
      },
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Supabase Webhook": {
      "main": [[{ "node": "Email Content", "type": "main", "index": 0 }]]
    },
    "Email Content": {
      "main": [[{ "node": "Send Welcome Email", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## 2. Access Revoked Workflow (The Kill Switch)
**Trigger:** Update in `profiles` where `membership_status` becomes `canceled`.
**Action:** Sends a polite "Membership Canceled" notice and logs the event for admin review.

### n8n Workflow JSON:
```json
{
  "name": "OfficeAIM: Access Revoked",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "supabase-status-change",
        "options": {}
      },
      "name": "Status Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 500],
      "webhookId": "officeaim-status-change"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.record.membership_status }}",
              "value2": "canceled"
            }
          ]
        }
      },
      "name": "Is Canceled?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [450, 500]
    },
    {
      "parameters": {
        "fromEmail": "support@officeaim.com",
        "toEmail": "={{ $json.record.email }}",
        "subject": "OfficeAIM: Your access has been deactivated",
        "html": "=<p>Hello,</p><p>Your access to the OfficeAIM Campus has been deactivated. If you believe this is an error, please reply to this email.</p><p>Best regards,<br>OfficeAIM Admin Team</p>"
      },
      "name": "Notify User",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 1,
      "position": [650, 480]
    }
  ],
  "connections": {
    "Status Webhook": {
      "main": [[{ "node": "Is Canceled?", "type": "main", "index": 0 }]]
    },
    "Is Canceled?": {
      "main": [[{ "node": "Notify User", "type": "main", "index": 0 }]]
    }
  }
}
```

## How to Connect to Supabase
1.  **In n8n:** Copy the Webhook URL (e.g. `http://localhost:5678/webhook/officeaim-new-user`).
2.  **In Supabase Dashboard:**
    *   Go to **Database** -> **Webhooks**.
    *   Click **Enable Webhooks** if not already active.
    *   **Create Webhook:**
        *   **Name:** `notify_n8n_on_signup`
        *   **Table:** `profiles`
        *   **Events:** `INSERT`
        *   **HTTP Method:** `POST`
        *   **URL:** Paste your n8n Webhook URL.
3.  **Repeat for Status Change:**
    *   **Events:** `UPDATE`
    *   **Table:** `profiles`
