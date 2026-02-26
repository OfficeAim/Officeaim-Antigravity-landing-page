---
name: Gemini Agent Factory Integration
description: A architectural blueprint for centralizing multiple AI personas into a scalable "Agent Factory" using the Google Generative AI SDK.
---

# Gemini Agent Factory Integration

This skill provides a pattern for managing multiple AI agents (personas) within a single React/Vite application. Instead of individual service files for each agent, this architecture uses a centralized "Factory" to bridge human intent with specific machine personas.

## Core Principles

1. **Centralized Personas**: Store all agent instructions (system instructions) in a single `AGENT_PERSONAS` constant. This ensures consistency and makes it easy to update tone or instructions across the entire platform.
2. **Dynamic Orchestration**: Use a `callAgent(agentRole, userMessage)` function that dynamically initializes the Gemini model with a chosen persona.
3. **Graceful Fallbacks**: Always provide a default persona (usually the Project Manager) if an unknown role is requested.
4. **Transparency**: Log the initialization and API state (e.g., partial API key strings) to aid in browser console debugging.

## Implementation Pattern

### 1. The Agent Factory (`agentFactory.js`)

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const AGENT_PERSONAS = {
    "PROJECT_MANAGER": "Role: You are the high-level orchestrator...",
    // ... all 18 board personas
};

/**
 * @param {string} agentRole - Persona key
 * @param {string} userMessage - New input
 * @param {Array} chatHistory - Array of {role: 'user'|'agent', content: '...'}
 */
export async function callAgent(agentRole, userMessage, chatHistory = []) {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY not configured.");

    const persona = AGENT_PERSONAS[agentRole.toUpperCase()] || AGENT_PERSONAS["PROJECT_MANAGER"];

    // Format for Gemini History
    const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: persona,
        });

        // Initialize chat with history
        const chat = model.startChat({ history: formattedHistory });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`GEMINI ERROR:`, error);
        throw error;
    }
}
```

## UI Pattern (React)

When implementing the frontend, store the conversation in a state array and pass it to the `callAgent` function. This enables multi-turn reasoning where the agent remembers previous context.

```javascript
const [messages, setMessages] = useState([]);

const handleSend = async (text) => {
    // 1. Add user message locally
    setMessages([...messages, { role: 'user', content: text }]);
    // 2. Call factory with current history
    const aiRes = await callAgent(role, text, messages);
    // 3. Update with AI response
    setMessages(prev => [...prev, { role: 'agent', content: aiRes }]);
};
```

## Key Learnings & Debugging

- **Model Availability**: If you encounter a `404 Not Found` for a model name, the most effective check is to query the API directly or check AI Studio. Model assignments can vary by project/billing status.
- **Stable Versioning**: As of early 2026, `gemini-2.5-flash` is a confirmed stable workhorse for integrated agents.
- **Vite Environment Variables**: In Vite, environment variables must be prefixed with `VITE_` and accessed via `import.meta.env.VITE_VARIABLE_NAME`. They are only loaded on server start.
- **SDK Maintenance**: Always ensure `@google/generative-ai` is updated to the `latest` version to support newer model strings and features.

## When to Use This Skill
- When building a platform that requires multiple AI "roles" (e.g., Support Bot, Growth Specialist, Tech Lead).
- When you want to decouple UI components from specific AI implementation details.
- When you need a highly maintainable and searchable list of AI personas.
