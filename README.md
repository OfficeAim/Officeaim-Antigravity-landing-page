# OfficeAim Landing Page & Ecosystem

Premium dark landing page, open-source AI Resource Vault, and interactive SaaS LMS Campus (`https://officeaimhq.netlify.app` / `https://officeaim.com`).

## 🛡️ Guía Canónica e Inviolable de Arquitectura, RLS y Diseño (Knowledge-Hub)

Cualquier nuevo componente, página estática, vista React en `/hub`, función serverless o tabla/política RLS en Supabase **DEBE cumplir estrictamente** con las especificaciones de los **6 Documentos Maestros** alojados en la bóveda central de Obsidian (`/Users/rodyfigueroa/Movies/Knowledge-Hub Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/`):

1. **[01-PRD — Product Requirements Document](file:///Users/rodyfigueroa/Movies/Knowledge-Hub%20Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/01-PRD-Product-Requirements.md):** Filosofía *100% Free & Open-Source Sovereignty* (Post-19 Oct), perfiles de usuario, inventario de módulos y KPIs.
2. **[02-TRD — Technical Requirements Document](file:///Users/rodyfigueroa/Movies/Knowledge-Hub%20Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/02-TRD-Technical-Requirements.md):** Arquitectura híbrida Jamstack (Static Root + React 19 Vite SPA en `/hub`), contrato del header `.navbar`, Launcher Multi-LLM Cowboy y seguridad.
3. **[03-App-Flow — App Flow & User Journey Architecture](file:///Users/rodyfigueroa/Movies/Knowledge-Hub%20Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/03-App-Flow-Architecture.md):** Mapa global de rutas y flujos de usuario en `skills.html`, `/learn/prompts`, `/resources/workflows.html`, `website-creator.html` y `/hub`.
4. **[04-Design-Brief — Design Brief & Visual Identity System](file:///Users/rodyfigueroa/Movies/Knowledge-Hub%20Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/04-Design-Brief.md):** Estética *Luxury Future Tech / Cyber Dark* (`#070A12`, `#0A0F1D`, `#00F0FF`, `#FF7A00`, `#10B981`), tipografía (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`) y regla inquebrantable de **100% inglés con *sentence case***.
5. **[05-Backend-Schema — Backend, Background Workflows & Database Schema](file:///Users/rodyfigueroa/Movies/Knowledge-Hub%20Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/05-Backend-and-Database-Schema.md):** Diagrama ERD de las 9 tablas en Supabase PostgreSQL, políticas RLS, funciones `SECURITY DEFINER` (`SET search_path = ''`), IndexedDB offline y los 98 pipelines de n8n.
6. **[06-Implementation-Plan — Implementation Plan, Audit & Gap Analysis](file:///Users/rodyfigueroa/Movies/Knowledge-Hub%20Obsidian/Knowledge-Hub/01-Proyectos/OfficeAIM/06-Implementation-Plan-and-Gaps.md):** Matriz de madurez actual, diagnóstico de brechas técnicas (Gaps #1 a #5) y hoja de ruta oficial.

## 🎨 Design System

- **Background**: #070A12
- **Surface**: #0B1220
- **Card**: #0F1B2E
- **Accent Primary**: #FF7A18 (Orange)
- **Accent Secondary**: #22D3EE (Cyan/Teal)
- **Typography**: Plus Jakarta Sans (headings), Inter (body)

## ✅ Completed Features

### Core Sections
- ✅ Sticky navigation with logo and CTAs
- ✅ Hero section with dual CTAs
- ✅ Why OfficeAim (3 benefit cards with images)
- ✅ **Embedded Prompt Generator Demo** (fully functional)
  - 4 templates: Professional Email, Document Summary, Project Plan, Marketing Copy
  - Dynamic form fields per template
  - Tone selector (Professional/Friendly/Technical)
  - Language selector (EN/ES/NL)
  - Copy to clipboard functionality
  - Reset functionality
- ✅ What You Get (Free Starter Kit - 4 cards)
- ✅ Practical Examples (3 showcase cards with real links)
- ✅ Features grid
- ✅ Courses section with Module 1 highlight + roadmap
- ✅ AI Toolkit section
- ✅ GPT Toolkit ecosystem
- ✅ Plans section (Free/Small Group/Enterprise)
- ✅ Newsletter subscription form
- ✅ Final CTA section
- ✅ Footer with social links

### Interactive Features
- ✅ Working prompt generator with 4 templates
- ✅ Multi-language support (EN/ES/NL) - infrastructure ready
- ✅ Smooth scroll animations
- ✅ Intersection Observer for card animations
- ✅ Copy to clipboard functionality
- ✅ Mobile-responsive design
- ✅ Navbar scroll effects

### Images Generated (6/15)
✅ hero.webp - Premium dark office desk with AI workflow
✅ why_1.webp - Workflow board with sticky notes
✅ why_2.webp - Notebook with checklist
✅ why_3.webp - Office desk with spreadsheet
✅ demo.webp - Prompt builder interface mockup
✅ example_1.webp - Calendar/date picker concept
✅ logo.png - Your OfficeAim logo

## 🖼️ Missing Images (Need to Generate)

Due to image generation quota limits, the following images need to be created. Here are the exact prompts to use:

### 1. example_2.webp (Prompter App)
```
Photorealistic premium dark scene: prompt generation concept, clean UI blocks and a copy button shape (no readable text), modern minimal, orange #FF7A18 and teal #22D3EE accents, 4k, no text, no watermark, no logo overlays, no UI text, no distorted hands, no extra fingers, no low-res, no noise, no blurry, no cartoon, no anime, no illustration, no clipart
```

### 2. example_3.webp (QR Generator)
```
Photorealistic premium dark scene: smartphone displaying a QR code shape (generic pattern, not branded), AI data streams in background, orange #FF7A18 and teal #22D3EE accents, 4k, no text, no watermark, no logo overlays, no UI text, no distorted hands, no extra fingers, no low-res, no noise, no blurry, no cartoon, no anime, no illustration, no clipart
```

### 3. course_module1.webp (Courses)
```
Photorealistic premium dark scene: professional writing at a desk with an AI assistant glow on the screen (no readable text), calm confident mood, innovation magazine aesthetic, orange #FF7A18 and teal #22D3EE accents, 4k, no text, no watermark, no logo overlays, no UI text, no distorted hands, no extra fingers, no low-res, no noise, no blurry, no cartoon, no anime, no illustration, no clipart
```

### 4. toolkit.webp (Toolkit Section)
```
Photorealistic premium dark scene: curated tools concept—grid of abstract app tiles on a monitor (no readable text), clean minimal, subtle glow, orange #FF7A18 and teal #22D3EE accents, 4k, no text, no watermark, no logo overlays, no UI text, no distorted hands, no extra fingers, no low-res, no noise, no blurry, no cartoon, no anime, no illustration, no clipart
```

### 5. gpt_ecosystem.webp (GPT Toolkit)
```
Photorealistic premium dark scene: modular blocks connecting like an ecosystem (abstract, no logos), clean geometric composition, orange #FF7A18 and teal #22D3EE accents, innovation magazine aesthetic, 4k, no text, no watermark, no logo overlays, no UI text, no distorted hands, no extra fingers, no low-res, no noise, no blurry, no cartoon, no anime, no illustration, no clipart
```

### 6. newsletter.webp (Newsletter Section)
```
Photorealistic premium dark scene: inbox/newsletter concept with an abstract email card (no readable text), clean modern, orange #FF7A18 and teal #22D3EE accents, 4k, no text, no watermark, no logo overlays, no UI text, no distorted hands, no extra fingers, no low-res, no noise, no blurry, no cartoon, no anime, no illustration, no clipart
```

## 📝 How to Generate Missing Images

### Option 1: Use Antigravity (when quota resets)
Wait for the image generation quota to reset (Feb 19, 2026) and ask Antigravity to generate the remaining images.

### Option 2: Use External AI Image Generators
Use the prompts above with:
- **Midjourney**: Copy the prompt directly
- **DALL-E 3**: Copy the prompt directly
- **Stable Diffusion**: May need slight prompt adjustments
- **Leonardo.ai**: Works well with these prompts

### Option 3: Use Stock Photos (Temporary)
For immediate deployment, you can use premium dark stock photos from:
- Unsplash (search: "dark office", "AI technology", "modern workspace")
- Pexels (similar searches)
- Apply a dark overlay and orange/teal color grading to match the aesthetic

## 🚀 How to Run

### Local Development
1. Simply open `index.html` in a modern browser
2. No build process required - pure HTML/CSS/JS

### Deploy to Production
Upload the entire folder to any static hosting:
- **Netlify**: Drag & drop the folder
- **Vercel**: Connect to Git repo or drag & drop
- **GitHub Pages**: Push to repo and enable Pages
- **Any web server**: Upload via FTP/SFTP

## 🔗 Important Links

All CTAs correctly link to:
- **Waiting List**: https://docs.google.com/forms/d/e/1FAIpQLSfU9WOXw1BOpMwE9HO-rtSiIjju0nZrtlu_m-1dQICDH2IceQ/viewform
- **Week Calculator**: https://weekcalc-ck6omtgn.manus.space
- **Prompter App**: https://office-aim-prompter.lovable.app
- **Instagram**: https://www.instagram.com/office.aim/
- **YouTube**: https://www.youtube.com/@Aimora-Officeaim
- **Facebook**: https://www.facebook.com/profile.php?id=61584047901312
- **LinkedIn**: https://www.linkedin.com/in/office-aim-hq-b8a7013a8/

## 📱 Multi-Language Support

The infrastructure is ready for EN/ES/NL. To activate:
1. Uncomment the language selector in `styles.css` (line 167: change `display: none` to `display: flex`)
2. The translations are already in `script.js`
3. Language switching will work automatically

## ✨ Key Features

### Prompt Generator
- **4 Templates**: Email, Summary, Project, Marketing
- **Dynamic Forms**: Each template has custom fields
- **Smart Generation**: Creates structured, ready-to-use prompts
- **Copy Functionality**: One-click copy to clipboard
- **Privacy-First**: Runs entirely in browser, no data sent anywhere

### Design Excellence
- Premium dark aesthetic with controlled accent lighting
- Glassy card effects with subtle borders
- Smooth micro-animations on scroll
- Hover effects on all interactive elements
- Mobile-first responsive design
- SEO-optimized semantic HTML

## 🎯 Quality Checklist

✅ Primary CTA links to Google Form correctly
✅ Demo prompt generator works (4 templates, generate, copy, reset)
✅ Clear value ladder: Free → Courses → Small group/Enterprise
✅ Proof section includes real examples with links
✅ No invented testimonials/logos (placeholders used where needed)
✅ Premium dark aesthetic with controlled orange/teal accents
✅ Mobile-first layout: cards stack, demo usable on mobile
✅ Newsletter block present with form
✅ Social links in footer + header
✅ Fast loading: limited heavy visuals, subtle motion only

## 🛠️ Customization

### Colors
Edit CSS variables in `styles.css` (lines 18-28)

### Content
Edit text directly in `index.html` or modify translations in `script.js`

### Add More Templates
Add new template objects to `promptTemplates` in `script.js` (line 172)

## 📧 Newsletter Integration

The newsletter form currently shows an alert. To integrate with a real provider:

1. **Mailchimp**: Replace form action in `script.js` line 519
2. **ConvertKit**: Add their form embed code
3. **Custom API**: Modify the submit handler to POST to your endpoint

## 🐛 Known Issues / Future Enhancements

- [ ] Generate remaining 6 images when quota resets
- [ ] Integrate newsletter provider (currently placeholder)
- [ ] Add loading states to prompt generator
- [ ] Consider adding prompt history (localStorage)
- [ ] Add analytics tracking
- [ ] Consider A/B testing different CTAs

## 📄 File Structure

```
/
├── index.html          # Main HTML structure
├── styles.css          # Complete design system
├── script.js           # Prompt generator + interactions
├── README.md           # This file
└── images/
    ├── logo.png        # OfficeAim logo
    ├── hero.webp       # Hero section image
    ├── why_1.webp      # Benefit card 1
    ├── why_2.webp      # Benefit card 2
    ├── why_3.webp      # Benefit card 3
    ├── demo.webp       # Demo section image
    ├── example_1.webp  # Week calculator example
    ├── example_2.webp  # [NEEDS GENERATION]
    ├── example_3.webp  # [NEEDS GENERATION]
    ├── course_module1.webp  # [NEEDS GENERATION]
    ├── toolkit.webp    # [NEEDS GENERATION]
    ├── gpt_ecosystem.webp   # [NEEDS GENERATION]
    └── newsletter.webp # [NEEDS GENERATION]
```

## 💡 Tips

1. **Test the prompt generator** - It's the star feature! Try all 4 templates.
2. **Mobile testing** - The design is mobile-first, test on various devices.
3. **Image optimization** - When you add the missing images, compress them for web.
4. **SEO** - Update meta descriptions in `index.html` for better search rankings.
5. **Analytics** - Add Google Analytics or Plausible to track conversions.

---

Built with ❤️ by Antigravity for OfficeAim
Premium Dark • Innovation Magazine Aesthetic
