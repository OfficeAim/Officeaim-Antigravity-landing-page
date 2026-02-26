---
name: ui-preservation-protocol
description: Core rules for safely modifying UI components without unintentionally breaking or removing existing functionality or design elements (like Gema's Avatar).
---

# UI Preservation Protocol

When editing existing components (e.g., `Dashboard.jsx`, `MainLayout.jsx`, CSS files, or Agent profiles), **you must strictly avoid unintentionally deleting or overwriting previous work**.

## Core Problem
Agents often use tools like `replace_file_content` to add new features. If they target the wrong `StartLine` and `EndLine` or rewrite a `TargetContent` block poorly, they risk deleting adjacent code, removing existing styling (Tailwind classes), or breaking integrated assets (like avatars).

**Example Failure:**
- A previous edit attempted to add an avatar to the `Dashboard.jsx` but broke the image because it didn't include `referrerPolicy="no-referrer"` for Google Drive images (violating the `google-drive-images` skill). This caused the fallback error handler to fire, turning the avatar into a generic emoji and making it seem like the UI was downgraded.

## The Preservation Rules

### 1. The Pre-Flight Check (ALWAYS DO THIS)
Before writing any UI replacements, use `view_file` to read the target file.
- Identify the **exact boundaries** of the component you want to modify.
- Check for existing edge-case logic (like `onError` fallback handlers on images).
- Verify if any other skills apply (e.g., `agent-avatar-rendering`, `google-drive-images`).

### 2. Surgical Edits Only
- Do not rewrite entire rendering blocks `return (...)` just to change a single button color or add a single line of conditional rendering. 
- Use the smallest possible `TargetContent` block.
- Keep all surrounding JSX, classes, and logic intact exactly as they were, *unless explicitly asked to change them*.

### 3. Asset & Image Guardian
When dealing with images:
- Never strip out `crossOrigin`, `referrerPolicy`, or `onError` handlers from existing `<img>` tags unless they are explicitly incorrect or causing bugs. 
- If adding new Googleusercontent images, you **MUST** include `referrerPolicy="no-referrer"` and `crossOrigin="anonymous"` as detailed in the `google-drive-images` skill.

### 4. Regression Awareness
When the user asks to "change the color of X" or "add Y below Z":
- Ensure you do **not** inadvertently remove X's existing animations (e.g., `framer-motion` properties).
- Ensure you do **not** accidentally clear out Z's wrapper formatting.

### Summary Checklist:
- [ ] Have I viewed the exact source code to understand its current state before replacing?
- [ ] Am I replacing only the absolute minimum required lines?
- [ ] Did I accidentally drop any existing Tailwind classes, attributes, or event listeners in my ReplacementContent?
- [ ] Are all image/avatar loading rules respected (no CORS errors)?
