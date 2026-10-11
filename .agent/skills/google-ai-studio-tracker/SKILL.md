---
name: google-ai-studio-tracker
description: Architectural blueprint for building zero-cost, client-side AI Vision trackers and inventory managers using Google AI Studio free tier (Gemini 1.5/2.0 Flash), IndexedDB offline storage, and multi-sheet Excel engine.
---

# Google AI Studio Free Tier + Vision Tracker Blueprint

This skill documents the end-to-end architectural pattern for engineering high-performance, decoupled web applications that combine client-side AI Vision OCR with offline-first local storage and zero monthly hosting costs.

---

## 1. Zero-Cost Architectural Philosophy

Modern AI utility tools should not impose recurring backend infrastructure costs for basic computer vision or inventory tracking.

### Core Stack
- **AI Vision Engine:** Google AI Studio REST API (`gemini-1.5-flash` or `gemini-2.0-flash`).
- **Client Processing:** HTML5 `<canvas>` dynamic downscaling to reduce payload weight and token latency.
- **Local Persistence:** Browser `IndexedDB` with asynchronous transaction wrappers (offline-first, no cloud database required).
- **Tabular Export/Import:** Client-side SheetJS (`xlsx.full.min.js`) generating structured multi-sheet workbooks.
- **Hosting:** Static CDN (Netlify / Vercel / GitHub Pages) without serverless function execution limits.

---

## 2. Google AI Studio Free Tier Protocol

Google AI Studio provides a generous free tier for developers:
- **Rate Limit:** 15 requests per minute (RPM).
- **Daily Quota:** 1,500 requests per day (RPD).
- **Context Window:** Up to 1,000,000 tokens (more than sufficient for multi-image extraction).

### Client-Side Key Management
1. Prompt the user to enter their Gemini API key via a modal on first scan.
2. Store the key strictly in the user's browser `localStorage` (`OFFICEAIM_GEMINI_API_KEY`).
3. Never bake static `VITE_*` API keys with billing enabled into publicly distributed web bundles.

---

## 3. Client-Side Image Preprocessing (Canvas Compression)

High-resolution camera photos (4MB–15MB) cause API timeouts and high token consumption. Always downscale before sending to the model:

```javascript
export async function compressImage(file, maxDimension = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG Base64
        const base64Data = canvas.toDataURL('image/jpeg', quality);
        const cleanBase64 = base64Data.split(',')[1];
        resolve({ base64: cleanBase64, mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## 4. Structured Vision Prompt Architecture

Force the model to return strict JSON mode without Markdown fences:

```javascript
export async function analyzeItemVision(frontImageBase64, backImageBase64 = null, apiKey) {
  const parts = [
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: frontImageBase64
      }
    }
  ];

  if (backImageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: backImageBase64
      }
    });
  }

  parts.push({
    text: `You are an expert cataloging assistant. Analyze the provided book/item cover images.
Extract the metadata and return ONLY a valid JSON object matching this schema:
{
  "title": "Exact Title",
  "author": "Author Full Name",
  "genre": "Detected category/genre",
  "isbn": "ISBN-10 or ISBN-13 if visible, otherwise null",
  "summary": "Brief 2-3 sentence overview of the content",
  "confidence": 0.95
}
Do NOT include markdown fences, code blocks, or explanations.`
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawText);
}
```

---

## 5. Offline-First IndexedDB Persistence

IndexedDB provides high-capacity, structured local database storage directly within the user's browser.

### Recommended Store Schema
- `items` / `books`: Primary catalog (`id`, `title`, `author`, `genre`, `isbn`, `status`, `created_at`).
- `loans`: Active and historical borrow transactions (`id`, `item_id`, `borrower_name`, `borrower_id`, `borrow_date`, `due_date`, `return_date`, `status`).
- `categories`: Custom tags and classifications.

### Initialization Pattern
```javascript
export function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfficeAIM_TrackerDB', 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('status', 'status', { unique: false });
        bookStore.createIndex('title', 'title', { unique: false });
      }
      if (!db.objectStoreNames.contains('loans')) {
        const loanStore = db.createObjectStore('loans', { keyPath: 'id' });
        loanStore.createIndex('book_id', 'book_id', { unique: false });
        loanStore.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}
```

---

## 6. Multi-Sheet Excel Engine (`xlsx.full.min.js`)

Export all data into a clean, multi-tab `.xlsx` spreadsheet for external administration:

```javascript
export function exportToExcel(books, loans) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Inventory
  const booksData = books.map((b) => ({
    'ID': b.id,
    'Title': b.title,
    'Author': b.author,
    'Category': b.genre,
    'ISBN': b.isbn || 'N/A',
    'Status': b.status,
    'Added On': new Date(b.created_at).toLocaleDateString()
  }));
  const wsBooks = XLSX.utils.json_to_sheet(booksData);
  XLSX.utils.book_append_sheet(wb, wsBooks, 'Inventory');

  // Sheet 2: Active Loans
  const activeLoans = loans.filter((l) => l.status === 'active').map((l) => ({
    'Loan ID': l.id,
    'Book ID': l.book_id,
    'Borrower': l.borrower_name,
    'Borrower ID / Class': l.borrower_id,
    'Borrowed Date': l.borrow_date,
    'Due Date': l.due_date
  }));
  const wsLoans = XLSX.utils.json_to_sheet(activeLoans);
  XLSX.utils.book_append_sheet(wb, wsLoans, 'Active Loans');

  // Download trigger
  XLSX.writeFile(wb, `Library_Inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
```

---

## 7. Reusability Matrix across OfficeAIM

This architecture is reusable across:
1. **Warehouse / Asset Management:** Scan physical part numbers and equipment barcodes.
2. **Expense & Receipt Scanner:** Scan store receipts, extract total, date, vendor, and export to monthly accounting sheets.
3. **Medical / Clinic Records:** Manage physical file folders with patient check-out cards without risking patient data to third-party databases.
4. **Art & Collectibles Catalog:** Archive private art or vintage card collections with high-fidelity visual description extraction.
