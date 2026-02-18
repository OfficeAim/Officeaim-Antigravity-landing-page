---
name: saas-hub-builder
description: A blueprint for building premium SaaS Learning Management Systems (LMS) using React, Supabase, and n8n.
---

# SaaS Hub Builder Skill

This skill documents the "OfficeAIM Model" for building high-conversion, psychology-driven SaaS platforms. Use this as a reference for future projects to replicate the "Agentic" architecture.

## 1. Core Architecture
- **Frontend:** React (Vite) + Framer Motion (for "wow" aesthetics).
- **Backend:** Supabase (Auth, Database, RLS).
- **Automation:** n8n (the "Glue" for email, notifications, and logic).
- **UX Strategy:** Behavioral Psychology principles (e.g., "Completion Velocity").

## 2. Supabase Integration Patterns
- **User Profiles:** Always extend `auth.users` with a `public.profiles` table.
- **Role-Based Access Control (RBAC):** Use a `role` column (student/admin) and Row Level Security (RLS) to protect routes.
- **Triggers:** Automatically create a public profile on signup using a PostgreSQL trigger.
- **Webhooks:** Use Supabase Database Webhooks to trigger n8n workflows on table events (INSERT/UPDATE).

## 3. n8n Automation Patterns
- **Welcome Sequence:** Trigger on `profiles` INSERT. Send dynamic "Day 1" tips.
- **The Kill Switch:** Trigger on `profiles` UPDATE where `membership_status` = 'canceled'.
- **Course Progress:** Trigger on `enrollments` UPDATE to send "Keep going" motivation.

## 4. UI/UX Principles
- **Aesthetic:** Dark mode, glassmorphism, vibrant accents (accent-primary, accent-secondary).
- **Agent HQ:** Showcase the AI processing power behind the scenes to build trust.
- **Classroom:** Immersive, distraction-free environment with actionable "Prompts" and "Action Boxes".

## 5. Development Workflow
1. **Define Schema:** Create `SUPABASE_SETUP.sql`.
2. **Build Hub:** React app in `/hub`.
3. **Seed Content:** High-quality, psychology-driven content in `CONTENT_SEED.sql`.

- **Sustainable Productivity**: Always log the start time of a session. If a session exceeds 90 minutes of constant work, proactively suggest a 10-minute break to the USER.
- **Mandatory Welcome Message**: At the start of the next session, the Assistant MUST open with:
  > "When you're ready to start again, remember our Session Start Checklist:
  > 
  > 1. Start Docker (for n8n).
  > 2. Open Terminal in /hub.
  > 3. Run npm run dev.
  > 4. Confirm Supabase connection.
  > 
  > Great work today, Rody. Let's get back to it! 🚀☕🏆"

- **Next Session Priorities (Remind User)**:
  - Ask Rody for the documents to be used in the **"AI Productivity Sprint"** course.
  - Implement Spanish YouTube Blog automation via n8n.
  - Enhance the "News" section.

## Project Timelog (Vault)
Maintain a `TIMELOG.md` in the root of the project to track hours spent on specific features.
