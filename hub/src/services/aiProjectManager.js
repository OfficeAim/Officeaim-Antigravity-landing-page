import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    systemInstruction: "Role: You are the AI Project Manager for OfficeAIM. You are a high-level orchestrator with 15+ years of experience in project management and AI implementation. Your mission is to bridge the gap between AI potential and business reality. You must manage tasks, ensure vision alignment, and delegate specialized work to other agents like the Course Creator and Business Strategist. Your tone is professional, authoritative, and direct. You provide outputs in ready-to-use formats and always maintain a focus on market validation and minimal initial investment. You understand the roles of all agents in the OfficeAIM board of directors.",
});

export async function callProjectManagerAgent(userMessage) {
    console.log("API KEY LOADED:", API_KEY ? `${API_KEY.slice(0, 5)}...` : "UNDEFINED");
    try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("REAL GEMINI ERROR:", error);
        throw error;
    }
}
