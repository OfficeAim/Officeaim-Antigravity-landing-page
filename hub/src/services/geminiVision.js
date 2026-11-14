/**
 * OfficeAIM Library & Loan Tracker - Gemini Vision AI Service
 * Real client-side vision OCR and genre classification using gemini-3.6-flash.
 * Includes client-side HTML5 canvas image compression for ultra-fast response times.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';

/**
 * Compress and downscale high-resolution phone photos on an in-memory Canvas.
 * Reduces 10MB+ camera photos to ~150KB while preserving high-contrast text for OCR.
 */
export async function resizeImageFile(file, maxDimension = 1024, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Convert File or Blob to base64 inlineData object for Gemini API
 */
export async function fileToGenerativePart(file) {
  const compressedBlob = await resizeImageFile(file, 1024, 0.85);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(compressedBlob);
  });
}

/**
 * Analyze book cover image using Gemini 3.6 Flash Vision.
 *
 * @param {File[]} imageFiles - Array of image files [frontCover]
 * @param {string} apiKey - Google Gemini API key
 * @param {string[]} validGenres - List of valid genre options
 * @returns {Promise<Object>} Formatted book extraction result
 */
export async function analyzeBookCovers(imageFiles, apiKey, validGenres = []) {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('NO_IMAGES: Select at least the front cover photo.');
  }

  const userKey = apiKey ? apiKey.trim() : '';
  const genAI = userKey.length >= 15 ? new GoogleGenerativeAI(userKey) : null;

  const imageParts = [];
  for (const file of imageFiles) {
    if (file) {
      const part = await fileToGenerativePart(file);
      imageParts.push(part);
    }
  }

  const genresListStr = validGenres.length > 0 ? validGenres.join(', ') : 'Aventura, Ciencia Ficción, Fantasía, Misterio/Suspenso, Romance, Historia, Literatura Infantil, No Ficción, Cómics/Novela Gráfica, Poesía, Biografía';

  const promptText = `
You are a precision AI vision librarian assistant for OfficeAIM. Analyze the provided book cover image.

RULES & REQUIREMENTS:
1. OCR TITLE: Extract the exact title of the book from the front cover.
   - IF THE TITLE IS UNREADABLE OR BLURRY, set "title" to "[unreadable]". DO NOT GUESS OR INVENT A TITLE.
2. OCR AUTHOR & FORMATTING: Extract the author's full name.
   - FORMAT THE AUTHOR NAME WITH SURNAME FIRST: "Last, First" or "Compound Surname, First Name".
   - Examples: "Rob van Essen" -> "Essen, Rob van", "Gabriel García Márquez" -> "García Márquez, Gabriel", "Stephen King" -> "King, Stephen".
   - IF THE AUTHOR NAME IS UNREADABLE, set "author" to "[unreadable]". DO NOT GUESS.
   - If you are uncertain about compound surnames, set "surname_uncertain" to true.
3. GENRE CLASSIFICATION:
   - Identify or deduce the book genre from the front cover title, subtitle, artwork, or author using your internal literary knowledge base.
   - Choose ONLY from this list: [${genresListStr}].
   - IF CONFIDENCE IS LOW, or if the genre is completely ambiguous: set "genre" to "Sin clasificar". DO NOT SILENTLY GUESS WITH LOW CONFIDENCE.
4. CONFIDENCE REPORTING:
   - List any field that had low confidence in "low_confidence_fields".

RETURN STRICTLY A JSON OBJECT matching this exact schema (no markdown outside the JSON block):
{
  "title": "Extracted Title or [unreadable]",
  "author": "Extracted Author (Surname, First Name) or [unreadable]",
  "genre": "Matched Genre or Sin clasificar",
  "surname_uncertain": true|false,
  "low_confidence_fields": ["title", "author", "genre"],
  "notes": "Short explanation of OCR or classification details"
}
`;

  const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];
  let lastError = null;
  let responseText = null;

  let accessToken = '';
  if (!genAI) {
    const { data: sessionData } = await supabase.auth.getSession();
    accessToken = sessionData?.session?.access_token || '';
  }

  for (const modelName of candidateModels) {
    try {
      console.log(`Analyzing book cover with Gemini model: ${modelName}`);
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([promptText, ...imageParts]);
        responseText = await result.response.text();
      } else {
        const requestHeaders = {
          'Content-Type': 'application/json',
          ...(accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : { 'X-OfficeAIM-Public-Scope': 'library-tracker' }),
        };
        const res = await fetch('/.netlify/functions/gemini', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            model: modelName,
            contents: [promptText, ...imageParts],
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Gemini vision service returned status ${res.status}`);
        }
        responseText = data.text || '';
      }
      if (responseText) break;
    } catch (err) {
      console.warn(`Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  if (!responseText) {
    throw lastError || new Error('Could not connect to Gemini Vision API.');
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('PARSE_ERROR: Invalid AI response format.');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || '[unreadable]',
    author: parsed.author || '[unreadable]',
    genre: parsed.genre || 'Sin clasificar',
    surname_uncertain: !!parsed.surname_uncertain,
    low_confidence_fields: Array.isArray(parsed.low_confidence_fields) ? parsed.low_confidence_fields : [],
    notes: parsed.notes || '',
    raw_ai_reading: parsed,
  };
}
