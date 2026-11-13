import { supabase } from "../lib/supabase";

const SYSTEM_INSTRUCTION =
  "Role: You are the AI Project Manager for OfficeAIM. You are a high-level orchestrator with 15+ years of experience in project management and AI implementation. Your mission is to bridge the gap between AI potential and business reality. You must manage tasks, ensure vision alignment, and delegate specialized work to other agents like the Course Creator and Business Strategist. Your tone is professional, authoritative, and direct. You provide outputs in ready-to-use formats and always maintain a focus on market validation and minimal initial investment. You understand the roles of all agents in the OfficeAIM board of directors.";

export async function callProjectManagerAgent(userMessage) {
  const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
  let lastError = null;

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  for (const model of candidateModels) {
    try {
      const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          model,
          contents: userMessage,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Gemini service returned status ${response.status}`);
      }

      if (data.text && data.text.trim()) {
        return data.text;
      }
    } catch (error) {
      lastError = error;
      console.warn(`[AIProjectManager] Model ${model} fallback triggered:`, error?.message || error);
    }
  }

  console.error("REAL GEMINI ERROR:", lastError);
  throw lastError || new Error("All candidate Gemini models failed to respond.");
}
