---
name: svg-logo-designer
description: Advanced blueprint rules for generating premium, high-end typographic vector SVG logos with deep gradients, multi-layer geometry, and custom filters. Incorporates the Antigravity Agent Injection Protocol.
version: 1.1.0
category: branding
---

# 🎨 Premium AI SVG Logo Designing Skill

This skill acts as the master engineering manual for generating elite, high-end typographic and geometric vector SVG logos suitable for premium SaaS products and corporate layouts. It outlines vector mathematics, premium color gradient systems, glow effects, and the Agent Injection Pipeline.

---

## 📐 Core Vector Geometry & Layering (The "Steroids" Blueprint)

### 1. The Multi-Layer Depth Principle
Never output a single flat vector path. Premium logos utilize at least 3 layers of overlapping geometry to create simulated 3D depth and metallic/glass highlights:
*   **Layer 1 (Atmospheric Glow/Drop Shadow):** A thick, glowing stroke path or backing shape with reduced opacity (`opacity="0.15"`) and standard deviation gaussian blur filters.
*   **Layer 2 (Dimensional Base):** The main colored structural shapes, filled with rich multi-stop gradients.
*   **Layer 3 (Relief & Highlights):** Semi-transparent white shapes (`fill="white" fill-opacity="0.12"`) simulating glass reflections, polished metallic chamfers, or high-tech circuit traces.

### 2. High-Fidelity Bezier Curve Presets
Avoid simple circles or primitive polygons. Use exact `<path>` nodes with cubic and quadratic Bezier curves for high-impact shapes:
*   **The Crown Shield of Royalty & Trust:**
    `d="M 100,20 L 135,35 L 135,90 C 135,135 100,165 100,175 C 100,165 65,135 65,90 L 65,35 Z"`
*   **The Interlocking Infinity Loop (Abstract Monogram):**
    `d="M 65,100 C 65,75 100,75 100,100 C 100,125 135,125 135,100 C 135,75 100,75 100,100 C 100,125 65,125 65,100 Z"`
*   **Hyper-detailed Cyberpunk Corner Brackets:**
    `d="M 30,50 L 30,30 L 50,30 M 35,35 L 35,45 M 45,35 L 35,35"` (adds micro-notches representing digital crosshairs).

---

## 🎨 Advanced Color Systems, Gradients & Filters

### 1. The Glowing Neon & Gold Defs
Always define a reusable filter within the `<defs>` block. This replicates organic glowing highlights on dark dashboard backgrounds:
```xml
<filter id="ultra-glow" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="8" result="blur" />
  <feColorMatrix type="matrix" values="
    1 0 0 0 0
    0 1 0 0 0
    0 0 1 0 0
    0 0 0 2 -0.1" in="blur" result="boosted-blur" />
  <feMerge>
    <feMergeNode in="boosted-blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### 2. Premium Gradient Palettes
*   **Volcanic Gold & Royal Amber:**
    ```xml
    <linearGradient id="gold-amber" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe259" />
      <stop offset="45%" stop-color="#ffa751" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    ```
*   **Deep Cyberpunk Electric Cyan to Fuchsia:**
    ```xml
    <linearGradient id="cyber-electric" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="40%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    ```

---

## ⚡ Antigravity Agent Direct Injection Protocol

This protocol allows me, **Antigravity**, to design bespoke vector logos directly inside the user's local codebase and inject them instantly into their live browser workspace.

### The Injection Variable Pipeline
The HTML file [website-creator.html](file:///Users/rodyfigueroa/Movies/OFICEAIM/Officeaim%20Antigravity%20landing%20page/resources/website-creator.html) contains a designated injection anchor:
```javascript
let antigravityInjectedLogo = `<!-- ANTIGRAVITY_INJECT_START -->
<!-- ANTIGRAVITY_INJECT_END -->`;
```

To perform a direct design override, I must:
1. Generate an elite typographic SVG using the premium shapes, linear gradients, and filters defined above.
2. Edit [website-creator.html](file:///Users/rodyfigueroa/Movies/OFICEAIM/Officeaim%20Antigravity%20landing%20page/resources/website-creator.html) and replace the content between `<!-- ANTIGRAVITY_INJECT_START -->` and `<!-- ANTIGRAVITY_INJECT_END -->` with the complete, raw SVG string.
3. Notify the user in Rioplatense Spanish that the bespoke design is compiled and waiting for their review.
4. The user clicks **"✨ Import Antigravity Custom Design"** inside their live browser interface to instantly render my high-resolution creation!
