---
name: audit-website
description: "Website audit skill — run systematic SEO, performance, and accessibility audits using the squirrel CLI tool. Use when the user asks to audit a website or find issues."
---

# Website Audit Skill

Source: https://skills.sh/squirrelscan/skills/audit-website  
GitHub: https://github.com/squirrelscan/skills

## What This Skill Does
Runs comprehensive website audits covering SEO, performance, accessibility, broken links, and technical issues using the `squirrel` CLI tool. Results are exported in LLM-optimized format for AI-directed fixes.

## When to Use
- User asks to "audit the site" or "find issues"
- Before a major launch or after significant changes
- When SEO is underperforming
- When lighthouse scores are low
- After a new page is added

## Prerequisites
```bash
npm install -g @squirrelscan/cli
# or
npx @squirrelscan/cli --version
```

## Basic Workflow

### Step 1: Surface Scan (Quick)
```bash
squirrel audit https://example.com --format llm
```

### Step 2: Export Report for AI
```bash
squirrel report <audit-id> --format llm
```

**Always use `--format llm`** — it's compact and optimized for AI consumption.

### Step 3: Deep Scan (Thorough)
```bash
squirrel audit https://example.com --coverage full --format llm
```

## Running Audits — Protocol

When running an audit:
1. **Present the report** — show audit results and score
2. **Propose fixes** — list issues you can fix, ask user to confirm before changing
3. **Parallelize approved fixes** — use subagents for bulk content edits (alt text, headings)
4. **Iterate** — fix batch → re-audit → present results → propose next batch
5. **Pause for judgment** — broken links, structural changes, ambiguous issues → flag for user
6. **Show before/after** — score comparison after each fix batch

## Score Targets

| Starting Score | Target | Expected Work |
|---|---|---|
| < 50 (Grade F) | 75+ (Grade C) | Major fixes |
| 50–70 (Grade D) | 85+ (Grade B) | Moderate fixes |
| 70–85 (Grade C) | 90+ (Grade A) | Polish |
| > 85 (Grade B+) | 95+ | Fine-tuning |

A site is **COMPLETE** when above 95 (Grade A) with `--coverage full`.

## Issue Categories to Fix

| Category | Priority | Examples |
|---|---|---|
| Missing meta descriptions | High | Add to all pages |
| Missing alt text | High | Images without alt="" |
| Broken links | High | 404s in navigation |
| Missing H1 | Critical | Every page needs one H1 |
| Slow images | Medium | Uncompressed PNG/JPG |
| Missing canonical | Medium | Duplicate content risk |
| Missing OG tags | Medium | Social sharing |

## Regression Diffs
```bash
# Compare current report against a baseline
squirrel report --diff <audit-id> --format llm

# Compare against a previous domain baseline
squirrel report --regression-since example.com --format llm
```

## OfficeAIM Application
When auditing OfficeAIM pages:
- Audit live: `http://localhost:8080` (static pages)
- Audit Hub: `http://localhost:5173` (React app)
- Priority: meta descriptions, OG tags, H1 structure, alt text on agent images
- All agent avatar images must have descriptive alt text
- Every page needs a unique title tag and meta description
