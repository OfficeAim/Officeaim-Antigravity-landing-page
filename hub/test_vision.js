import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
const apiKey = envContent.match(/VITE_LIBRARY_GEMINI_API_KEY=(.*)/)?.[1]?.trim();

console.log("Using Key:", apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');

const genAI = new GoogleGenerativeAI(apiKey);

// Minimal 1x1 JPEG pixel in base64
const dummyJpegBase64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function testVision() {
  const candidateModels = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];
  
  for (const m of candidateModels) {
    try {
      console.log("Testing model with vision image:", m);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent([
        "Extract book title and author from this image. Return JSON: {\"title\":\"...\",\"author\":\"...\",\"genre\":\"...\"}",
        {
          inlineData: {
            data: dummyJpegBase64,
            mimeType: "image/jpeg"
          }
        }
      ]);
      console.log("SUCCESS WITH MODEL:", m);
      console.log("RESPONSE:", await result.response.text());
      return;
    } catch (e) {
      console.error("FAILED MODEL:", m, e.message);
    }
  }
}

testVision();
