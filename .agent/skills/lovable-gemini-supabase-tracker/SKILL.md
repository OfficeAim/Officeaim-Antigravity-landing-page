---
name: lovable-gemini-supabase-tracker
description: Blueprint for building standalone AI vision tools in Lovable with Google Gemini Vision OCR (gemini-3.6-flash), Supabase PostgreSQL + Auth, RLS fallback, and multi-item shelf scan extraction.
---

# Lovable + Gemini Vision + Supabase Blueprint

This skill documents the exact pattern and prompt architecture for generating standalone React web applications in Lovable powered by client-side Google Gemini Vision OCR, Supabase PostgreSQL DB/Auth, and local storage fallback.

---

## 1. Core Architecture & Stack
- **Frontend Generator:** Lovable (Vite + React + Tailwind CSS / Shadcn UI).
- **Backend & DB:** Supabase PostgreSQL (`books`, `loans`, `activity_log`) + Auth.
- **Vision AI Engine:** Google Gemini API (`gemini-3.6-flash` with fallback `gemini-1.5-flash`).
- **Client-Side Image Optimization:** HTML5 Canvas downscaling (max 1024px, ~150KB JPEG payload).
- **Storage Strategy:** Dual storage — Supabase PostgreSQL for authenticated sessions + `localStorage` fallback for Demo Mode or RLS errors.

---

## 2. Supabase DDL Schema Template
Always run this script in Supabase SQL Editor prior to generating the Lovable app:

```sql
-- 1. Enums
CREATE TYPE book_status AS ENUM ('available', 'borrowed', 'maintenance');
CREATE TYPE loan_status AS ENUM ('active', 'returned', 'overdue');

-- 2. Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    genre VARCHAR(100) DEFAULT 'Overig',
    copy_label VARCHAR(10) DEFAULT 'A',
    status book_status DEFAULT 'available',
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Loans Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_class VARCHAR(50) NOT NULL,
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status loan_status DEFAULT 'active'
);

-- 4. Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth full access books" ON public.books FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access loans" ON public.loans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access log" ON public.activity_log FOR ALL USING (auth.role() = 'authenticated');
```

---

## 3. Gemini Vision OCR Integration Patterns

### A. Image Canvas Downscaler (Required for fast response < 2s)
```javascript
export async function resizeImageFile(file, maxDimension = 1024, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
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
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
    };
    img.onerror = () => resolve(file);
    img.src = objectUrl;
  });
}
```

### B. Multi-Book Shelf Scan Prompt Pattern
To extract 3 to 15+ books from a single shelf or stack photo, force Gemini to return a JSON array:
```text
Analyze the image carefully. It contains one or more books (cover or spine shelf/stack scan).
Extract EVERY SINGLE VISIBLE BOOK.
Return STRICTLY a JSON ARRAY of objects (no markdown outside the JSON):
[
  {
    "title": "Exact Title",
    "author": "Surname, First Name",
    "genre": "Detected Genre"
  }
]
Format author as 'Surname, First Name' (e.g. 'Stoffels, Maren').
```

---

## 4. Lovable Prompting Best Practices

When asking Lovable to build or fix the app:
1. **Fallback Credentials:** Always supply explicit fallback `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `src/integrations/supabase/client.ts`.
2. **Demo Mode / Local Storage Fallback:** Instruct Lovable to save to `localStorage` if `supabase.from('books').insert(...)` returns an authentication or RLS error.
3. **Password Eye Toggle:** Require an eye icon inside password fields to toggle visibility.
4. **Never send `service_role` secrets:** Only pass `anon public` keys in prompts or client code.
