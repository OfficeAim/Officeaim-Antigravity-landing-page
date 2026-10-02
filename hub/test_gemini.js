import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error("Missing .env file at:", envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const apiKey = getEnvVar('VITE_GEMINI_API_KEY');
if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing in hub/.env");
    process.exit(1);
}

console.log("Using API Key:", `${apiKey.substring(0, 8)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    // Model testing
    const modelName = "gemini-3.6-flash"; 
    console.log(`Testing getGenerativeModel with model: ${modelName}`);

    const systemInstruction = `Role: You are AIM, the friendly, highly advanced, and extremely competent AI Design Partner and Coach for the OfficeAIM Website Creator.
Be highly practical, encouraging, and clear. Help them compile a perfect blueprint!

## 🎨 STRICT LOGO GENERATION PROTOCOL (CRITICAL)
If the user's query contains the trigger '✨ GENERATE LOGO REQUEST', you MUST bypass standard conversational speech.
Your response MUST contain EXACTLY a valid XML '<svg>...</svg>' code block and absolutely NOTHING else. No introductions, no explanations, no chat remarks. Just raw, copy-paste-ready SVG code.`;

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
        });

        console.log("Calling model.generateContent...");
        const result = await model.generateContent("✨ GENERATE LOGO REQUEST: Make a modern minimal typographic SVG logo for the brand 'Happy Tours' with the initials 'HT' and design vibe 'Minimal Tech'.");
        const response = await result.response;
        console.log("\n--- SUCCESS RESPONSE ---");
        console.log(response.text());
    } catch (err) {
        console.error("\n❌ GEMINI API FAILED:", err);
    }
}

testGemini();
