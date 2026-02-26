---
name: google-drive-images
description: How to correctly embed Google Drive images in web applications to bypass CORS restrictions.
---

# Google Drive Image Embedding Skill

When building applications, you often need to use images hosted on Google Drive. However, using the standard sharing links (`https://drive.google.com/file/d/FILE_ID/view?usp=sharing`) or export links (`https://drive.google.com/uc?id=FILE_ID`) directly in `<img>` tags often results in CORS (Cross-Origin Resource Sharing) errors or broken images and 403 Forbidden responses.

This skill outlines the correct method to embed Google Drive images reliably.

## The Solution: `lh3.googleusercontent.com` + `referrerPolicy`

### 1. Extract the `FILE_ID`
First, get the sharing link from Google Drive. It looks like this:
`https://drive.google.com/file/d/1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c/view?usp=sharing`

Extract the `FILE_ID` from the link. In this example, it is:
`1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c`

### 2. Format the URL
Convert the URL to use Google's content delivery network domain `lh3.googleusercontent.com` with the `/d/` path:
`https://lh3.googleusercontent.com/d/FILE_ID`

Example:
`https://lh3.googleusercontent.com/d/1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c`

### 3. Add `referrerPolicy` to the `<img>` tag
This is the most critical step. Even with the correct URL, modern browsers will block the image if a `Referer` header is sent. You must add `referrerPolicy="no-referrer"` to the React or HTML `<img>` element.

```jsx
// Correct React Implementation
<img 
  src="https://lh3.googleusercontent.com/d/1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c" 
  alt="Agent Avatar" 
  referrerPolicy="no-referrer" 
  crossOrigin="anonymous" // Optional, but good practice for external images
/>
```

## Summary Checklist
- [x] Extracted `FILE_ID` from the shareable link.
- [x] Transformed URL to `https://lh3.googleusercontent.com/d/FILE_ID`.
- [x] Added `referrerPolicy="no-referrer"` to the `<img />` tag.
- [x] (Optional but recommended) Added `crossOrigin="anonymous"`.

By following this workflow, you can successfully bypass CORS and embed high-quality Google Drive profile pictures and assets in any web platform.
