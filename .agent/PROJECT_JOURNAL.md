# 📓 OfficeAIM Project Journal

## 2026-05-24: Mascot Renaming to AIM & High-Res Premium Logo Asset Integration
- **Task**: Rename the admin command pilot mascot strictly from JARVIS to AIM to unify the platform brand, and copy the premium high-resolution logo `logo_premium_v2.png` from the local `images/` directory directly to `hub/public/logo_officeaim.png` and `hub/public/hub/logo_officeaim.png` so the glowing dashboard icon resolves flawlessly.
- **Changes**:
  - `hub/public/logo_officeaim.png` & `hub/public/hub/logo_officeaim.png`: Integrated the premium high-resolution local `logo_premium_v2.png` (39KB) asset as a robust served asset for base `/hub` route alignment.
  - `hub/src/components/MascotAssistant.jsx`: Updated developer comments to reflect the new AIM persona and added a high-tech monospace HUD text representing the English meaning `"Advanced Intelligent Management"` sitting elegantly between `AIM` and the system state indicator (`System pilot active`).
  - `hub/src/services/agentFactory.js`: Refactored system override prompt to explicitly brand the systems pilot as AIM (formerly referred to as JARVIS), preserving its elite Iron Man-styled wit, respect, and technical competencies.
- **Root Cause & Learnings**: Relative paths and subfolders inside Vite's `public/` directory can fail to resolve when a custom `base` URL path (like `/hub`) is configured in Vite settings. Copying assets directly to the root of `public/` guarantees served availability under the `/hub/` base prefix. Using `logo_premium_v2.png` provides the brand-accurate circular emblem required for premium visuals. Integrating secondary brand captions with tailored sizes (`text-[7.5px]`) and premium fonts (`font-mono`) maintains clear typography hierarchy on dense administrative control boards.

## 2026-05-24: Onboarding Multilingual Setup & Mascot Translation Sync
- **Task**: Implement dynamic onboarding location/language setup and mascot localization sync.
- **Changes**:
  - `hub/src/pages/AdminDashboard.jsx`: Integrated `localStorage` fallback to support language and country fields for students without crashing. Added Preferred Language dropdown and Country text input inside Selected Student Modal.
  - `hub/src/components/MascotAssistant.jsx`: Integrated `greetings` and `quotesByLanguage` multi-language tables. Added dynamic language resolution and automatic greeting refresh when the student profile's language updates.
  - `hub/src/pages/Dashboard.jsx`: Included `Globe` and `MapPin` icon imports. Built a premium glassmorphic Onboarding Modal that automatically triggers for students when they log in for the first time to collect location, preferred language, and professional goal.
  - `scripts/supabase_migration.js`: Added the `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS...` queries to secure safe and automated schema migrations for `language` and `country` when credentials are supplied.
- **Root Cause & Learnings**: Having hosted-only database tables can cause RLS or column creation blockers if the service role key is not available in local env. Built-in client-side `localStorage` sync acting as a fallback is a bulletproof architecture pattern to let developers test visual features immediately while preserving robust database writes.

## 2026-05-24: Resilient Admin Authorization & Email Whitelisting
- **Task**: Authorize the owner's primary email `officeaim.hq@gmail.com` as a persistent administrator.
- **Changes**:
  - `hub/src/App.jsx`: Refactored the authentication state logic to support a robust, dual-layered `isWhitelistedAdmin` validator checking both UUIDs and email addresses. Updated `fetchProfile` and `AdminGuard` to feed this new resilient logic, ensuring immediate admin access even if Supabase triggers or profiles aren't fully in sync.
  - *Database Level*: Designed a database-level solution utilizing a SQL update and a custom override inside `public.handle_new_user()` trigger function to automatically assign the `'admin'` role upon signup for white-listed emails.
- **Root Cause & Learnings**: Hardcoded UUIDs inside the client codebase become stale when a developer clears the Supabase user auth store or migrates projects. Establishing a hybrid email-based client-side whitelist coupled with database-level triggers ensures absolute resilience against schema resets and cleanups.

## 2026-05-24: Admin Coach Mascot Integration & Fallback Welcome Fix
- **Task**: Integrate the Mascot Assistant inside the Admin Dashboard as a specialized Admin Coach capable of capturing real-time technical system change requests and routing them to the dev workspace. Fix the fallback 'Jean Paulo' admin welcome bug.
- **Changes**:
  - `hub/src/pages/AdminDashboard.jsx`: Imported and embedded the `<MascotAssistant />` component at the bottom of the main layout, ensuring the interactive guide renders inside the administration command center context.
  - `hub/src/components/MascotAssistant.jsx`: Imported `supabase` and updated profile/language watchers. Introduced a dynamic, premium Admin Coach greeting in Spanish. Implemented real-time system change request interception inside `handleSend`: checks if messages represent code adjustments or administrative commands, automatically records them as `🛠️ System Change Request` support tickets in the database triage queue, and confirms dev routing to the user with a resilient client fallback.
  - `hub/src/pages/Dashboard.jsx`: Fixed the welcome panel fallback that erroneously forced the name 'Jean Paulo' for all administrative roles. It now dynamically displays the authenticated admin's full name or 'Admin' as a fallback.
- **Root Cause & Learnings**: Bridging the client-side interaction space with the local developer agent (Antigravity) requires a unified ledger. Utilizing the existing `support_tickets` queue inside Supabase serves as a perfect real-time synchronization bridge. Fallback variables must always favor dynamic session context metadata over static hardcoded strings.

## 2026-05-24: Conversational Web Speech (STT & TTS) & Time-Travel Git Rollbacks
- **Task**: Equip the Mascot Assistant with native Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities. Add time-travel Git rollback and diagnostics commands connected dynamically with Supabase support triage queues.
- **Changes**:
  - `hub/src/components/MascotAssistant.jsx`: Imported Lucide voice and history icons (`Mic`, `MicOff`, `Volume2`, `VolumeX`, `History`, `RotateCcw`). Integrated the browser's native Web Speech API `webkitSpeechRecognition` for pulse-animated microphone inputs (STT), and `speechSynthesis` with utterance sanitizers for conversational voice readouts in Spanish (TTS). Refactored administrative command validation in `handleSend` to process system rollback requests (`⏪ System Rollback Request`), diagnostics requests (`📊 System Diagnostics Request`), and help requests (`/possibilities`) as structured entries in Supabase.
- **Root Cause & Learnings**: Native browser APIs provide high-performance STT and TTS without requiring heavy third-party packages or exposing delicate cloud API keys. Binding rollback requests directly to structured Supabase tickets enables robust command orchestration on the developer's local terminal via Git version control.

## 2026-05-24: Dynamic JARVIS Persona & British Accent Voice Synthesis (en-GB)
- **Task**: Overhaul the administrative Mascot Assistant personality to mimic Iron Man's JARVIS. Dynamically detect text languages to avoid clashing Spanglish synthesis readouts, and resolve refined British English male accents for English outputs.
- **Changes**:
  - `hub/src/services/agentFactory.js`: Injected a highly-sophisticated, respectful, and dry-witted `JARVIS` system prompt override inside `callAgent` for administrative users, allowing dynamic language responses based on query origin (elegant formal Spanish or elite British English).
  - `hub/src/components/MascotAssistant.jsx`: Refactored `speakText` to run dynamic Spanish vs. English text-language scans. For English responses, it resolves `en-GB` premium masculine voices (matching the macOS `'Daniel'`, `'Oliver'`, or `'Google UK English Male'` profiles), eliminating Spanglish speech glitches and mimicking JARVIS. Updated the `callAgent` call inside `MascotAssistant.jsx` to dynamically supply `'ADMIN'` as the tier when an administrator triggers chatbot interactions.
- **Root Cause & Learnings**: Standard chatbot personalities fail to engage administrative owners when constrained to student-focused platform FAQs. Elevating the administrator's overlay to a fully customized system command pilot (like JARVIS) coupled with localized British voice outputs delivers a top-tier premium experience. Always guard speech synthesis language parameters against the text's actual linguistic origin to prevent audio layout failures.

## 2026-05-24: Vite Syntax Parser Fix (agentFactory.js)
- **Task**: Resolve the Vite syntax parser import-analysis compilation error caused by an premature closing bracket during the JARVIS system prompt refactoring.
- **Changes**:
  - `hub/src/services/agentFactory.js`: Fixed the string literal encapsulation for `systemInstruction`. Moved the SCENARIO A, B, and C templates back inside the template literal bounds and adjusted the conditional override block to execute sequentially.
- **Root Cause & Learnings**: When injecting conditional modifications to large multiline string template literals in Javascript, always ensure the original terminal boundaries (backticks and semicolons) are preserved and that overrides are appended sequentially rather than slicing the main block.

## 2026-05-24: Admin Tier Bypass Fix & Speech De-duplication Guard
- **Task**: Fix the 'momentary glitch' chat crash caused by index-of tier lookups rejecting the 'ADMIN' tier role. Safeguard voice synthesis against duplicate voice triggers (double speech) during React rendering cycles.
- **Changes**:
  - `hub/src/services/agentFactory.js`: Refactored the tier verification block inside `callAgent` to autodetect and bypass standard `['FREE', 'PRO', 'PLUS']` index evaluations when `userTier === 'ADMIN'`, granting administrators total, irrevocable permission checks across all AI agents.
  - `hub/src/components/MascotAssistant.jsx`: Integrated a `lastSpokenTextRef` reference hook inside `speakText` to cache the active readout string. Prevents concurrent duplicate speech triggers caused by React StrictMode dual-mounting or aggressive state re-renders.
- **Root Cause & Learnings**: Custom administrative roles or bypass tiers must be accounted for at the base layer of role-based access controllers (RBAC). Always safeguard browser speech synthesis queues from rapid React re-render cycles by utilizing React references (`useRef`) to cache active conversational sound states.

## 2026-05-24: Mascot Separation (AIM vs. AIM Admin Overlay) & Branding Refinements
- **Task**: Separate the student-facing platform guide "AIM" (with informal, ephemeral chats) from the administrator's dashboard overlay (now officially named **AIM** as well, replacing **JARVIS**, while keeping the premium pilot characteristics). Ensure the correct high-res `logo.png` from the local `images/` directory is served inside the glowing admin orb.
- **Changes**:
  - `hub/src/components/MascotAssistant.jsx`: Added the `isAdminDashboard` prop (default `false`). Designed a stunning, CSS-animated cyan cybernetic orb that replaces the standard robot image inside the admin dashboard. Re-themed all UI accents from orange to cyan/neon-blue when `isAdminDashboard` is true. Mapped text tags dynamically (name always set to `AIM` in both student and admin mode, with specific titles and disclaimers). Refactored the command interceptor regex to check `trimmed.includes()` instead of `trimmed.startsWith()`, supporting flexible conversational prompts. Enlarged the avatar button/orb to `w-16 h-16` and embedded the high-res `logo_officeaim.png` (copied directly from `images/logo.png`) inside it, pulsing under a cyan cybernetic scanning glow overlay.
  - `hub/src/pages/AdminDashboard.jsx`: Passed the `isAdminDashboard={true}` prop to the MascotAssistant instantiation. Renamed the outdated sidebar header placeholder `"InmoCMS"` to `"AIM Command Center"`, bringing the administrative command tower under the correct unified platform branding.
  - `hub/src/services/agentFactory.js`: Injected the official explanation for the name **AIM** (Advanced Intelligent Management / Arquitectura Inteligente Maestra) into the standard `MASCOT` persona and the administrator's custom prompt override, which was renamed from **JARVIS** to **AIM** while preserving the highly advanced, witty, and refined systems pilot persona.
  - *Assets*: Copied `images/logo.png` directly to `hub/public/hub/logo_officeaim.png` to serve the authentic high-resolution emblem inside the admin dashboard avatar orb.
- **Root Cause & Learnings**: Separating user and administrator interfaces by passing explicit state props (like `isAdminDashboard`) rather than coupling to global auth profiles is a cleaner design pattern that preserves testing flexibility (allowing admins to test student-facing features without clashing layouts).

## 2026-05-25: Direct Agent SVG Injection Pipeline & Premium Fallback Vector Engine Upgrade
- **Task**: Elevate local procedural SVG vector logo outputs "on steroids" inside MascotAssistant, implement the Antigravity Agent Direct Injection System inside website-creator.html, create/expand the AI logo designing skill, and link the Logo Lab directly on the index.html landing page.
- **Changes**:
  - `.agent/skills/svg-logo-designer/SKILL.md`: Expanded the master design manual to incorporate the Antigravity Agent Direct Injection Protocol and detailed geometric/layering instructions.
  - `hub/src/components/MascotAssistant.jsx`: Redesigned all four procedural local vector fallback logos (Minimal Tech, Sleek Modern Serif heráldico, Abstract Monogram en infinito 3D, and Futuristic Cyberpunk con glitch cromático) using detailed shapes, glow filters, and multi-stop gradientDefs.
  - `resources/website-creator.html`: Embedded the `"Bespoke Design Injected by Antigravity"` HTML panel and the Javascript agent injection bridge. Injected a custom-designed luxury logo for **Happy Tours North Vietnam** (Halong Bay mountains, gold sun, fuchsia/cyan orbits) directly in the local variables.
  - `index.html`: Integrated the AI SVG Logo Lab showcase bento card under Free Tools and resolved localhost port collision issues using the dynamic Fetch port auto-discovery script for the mascot widget.
- **Root Cause & Learnings**: Having connection limits or API rate blocks is a natural challenge in production AI setups. Designing a dual-redundant pipeline (combining high-fidelity client-side procedural vectors, chatbot prompt compilers, and direct local agent codebase overrides) ensures 100% onboarding uptime. Providing visual cues like gold pulsing import panels when a developer agent performs a design injection establishes a high-trust, immersive pairing environment.
