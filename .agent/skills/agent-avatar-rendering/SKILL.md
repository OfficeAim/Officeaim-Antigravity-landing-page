---
name: agent-avatar-rendering
description: Rules and UI patterns for rendering Agent Avatars in HTML to avoid external image loading errors, flickering, and infinite onerror loops.
---

# Agent Avatar Rendering Rules

When building landing pages, dashboards, or any UI displaying OfficeAIM's agents, **never use external Google Drive image links** (`lh3.googleusercontent.com...`) if they are prone to rate-limiting or deletion. Furthermore, **never use `onerror` attributes that point to other potentially non-existent fallback images** (e.g., `onerror="this.src='fallback.img'"`), as this causes an infinite error loop and severe visual flickering if the fallback also fails to load.

## The Standardized Approach: CSS/Emoji Avatars

To maintain stability and perfectly match the React application (`hub/agents`), use the following HTML/CSS pattern for Agent avatars based on their tier:

### 1. Identify the Agent Emoji and Tier
Refer to the `officeaim-neural-network-catalog` skill to find the correct emoji for the agent (e.g., 📋 for Gema, 🧠 for Behavioral Psych).
Determine the tier (Free vs Pro/Plus) to set the correct color styling.

### 2. Free Tier / Essential Blueprint
Use the Cyan/Emerald color palette.
```html
<div class="agent-avatar-wrap">
    <div style="width:100px; height:100px; border-radius:50%; background:rgba(34,211,238,0.1); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color:#22d3ee; border:1px solid rgba(34,211,238,0.3);">
        📋 <!-- Replace with specific agent emoji -->
    </div>
</div>
```

### 3. Pro / Plus Tier Blueprint
Use the White/Glassmorphism color palette.
```html
<div class="agent-avatar-wrap">
    <div style="width:100px; height:100px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:2.5rem; color:var(--text-muted); border:1px solid rgba(255,255,255,0.1);">
        👤 <!-- Replace with specific agent emoji -->
    </div>
</div>
```

For custom sized wraps (like `width: 140px`), adjust the width and height of the inner div accordingly, and potentially increase the `font-size`.

### Summary Checklist:
- [x] Removed any `<img src="https://lh3.google...` tags for avatars if they flicker/fail.
- [x] Removed `onerror="..."` fallbacks that loop.
- [x] Applied the `<div>`-based emoji avatar pattern matching the tier colors.
- [x] Consulted the Neural Network Catalog to ensure the correct emoji is used.
