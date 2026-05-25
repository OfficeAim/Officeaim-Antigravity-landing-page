---
name: visual-inspector
description: Ultra-low token visual self-inspection and HTML syntax audit protocol for zero-downtime visual changes.
version: 1.0.0
category: quality-assurance
---

# 🔍 Auto-Visual Self-Inspection Protocol (Visual-Inspector)

This ultra-compact skill enforces strict semantic audits to guarantee zero visual regressions on HTML/CSS layouts.

---

## ⚡ 3-Step Verification Loop (Execute BEFORE presenting changes)

### 1. The Tag-Matching Audit (Integrity Check)
Always run a character/regex match on modified sections to ensure:
*   Every opened `<div>`, `<section>`, `<a>`, `<g>`, `<svg>` has exactly **one** matching closing tag.
*   Zero orphaned tags are introduced.
*   Zero duplicated attributes or nested elements occur by mistake.

### 2. Layout & Alignment Scan
Compare changes against parent container properties:
*   Ensure custom padding or margins (`var(--spacing-3xl)`) do not overlap outer sections.
*   Check that flex columns (`flex-direction: column`) contain correct justify alignments (`justify-content: space-between`).
*   Validate `grid-column: span X` properties align symmetrically.

### 3. Local Verification Run
*   Verify locally served assets (e.g. `http://localhost:8080/`) by cross-referencing files using `git diff` or checking error patterns prior to delivery.
