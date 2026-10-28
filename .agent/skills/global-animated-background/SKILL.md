---
name: global-animated-background
description: "Blueprint for implementing the global animated viewport background grid."
---

# 🌌 Global Animated Background (Antigravity Style)

This skill documents the approach used to create the sweeping, unified background grid with animated data streams traversing the entire viewport, rather than containing them within specific sections.

## 📌 Core Concept

Instead of placing `<canvas>` or `<div>` animations inside individual `<section>` blocks (which leads to clashing visuals, background solid color overlaps, and disjointed scrolling), we extract the background into a **single, fixed global container** that spans the entire window (`inset: 0; position: fixed;`).

## 🛠️ Implementation Steps

### 1. HTML Structure

Place the global animation wrapper purely as a sibling to your other page content, ideally right after the opening `<body>` tag. **Do not place it inside a relatively positioned section.**

```html
<body>
    <div class="global-anim-bg">
        <div class="global-grid"></div>
        <!-- Vertical Streams -->
        <div class="data-stream stream-1"></div>
        <div class="data-stream stream-2"></div>
        <div class="data-stream stream-3"></div>
        <div class="data-stream stream-4"></div>
        <!-- Horizontal Streams -->
        <div class="data-stream-h stream-h-1"></div>
        <div class="data-stream-h stream-h-2"></div>
        <div class="data-stream-h stream-h-3"></div>
    </div>
    
    <!-- Rest of your page content goes here -->
</body>
```

### 2. Global CSS Configuration

The wrapper must be `fixed`, with `z-index: -1` and `pointer-events: none` to ensure it stays strictly in the background and doesn't steal clicks.

```css
.global-anim-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    overflow: hidden;
}

.global-grid {
    position: absolute; /* absolute relative to the fixed wrapper */
    inset: 0;
    background-image:
        linear-gradient(rgba(34, 211, 238, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(34, 211, 238, 0.04) 1px, transparent 1px);
    background-size: 60px 60px;
}
```

### 3. Keyframe Viewport Math (CRITICAL)

To make data streams (lasers) travel across the entire screen regardless of resolution, **you must use viewport units (`vh`, `vw`) instead of percentages (`%`) or pixels (`px`)**. 

Using `%` inside a fixed wrapper calculates based on the screen height, but adding some extra buffer handles the fade-out gracefully.

```css
@keyframes data-flow {
    0% {
        transform: translateY(10vh); /* Start slightly below top */
        opacity: 0;
    }
    30% { opacity: 1; }
    70% { opacity: 1; }
    100% {
        transform: translateY(-120vh); /* Travel all the way up and past the screen */
        opacity: 0;
    }
}

@keyframes data-flow-h {
    0% { transform: translateX(10vw); opacity: 0; }
    30% { opacity: 1; }
    70% { opacity: 1; }
    100% { transform: translateX(-120vw); opacity: 0; }
}
```

### 4. Preventing Background Blockers

The most common issue when switching to a fixed global background is that individual sections in your page might have solid colors assigned to them (e.g., `background: var(--bg-surface);`). 

**You must remove solid backgrounds from any sections where you want the grid to show through.** 
If a section needs a separator, use a translucent color (`rgba()`) or rely on border dividers, border-radius cards, or `backdrop-filter: blur()`.

```css
/* BAD: Blocks the global background */
.some-section {
    background: #070a12; 
}

/* GOOD: Lets the streams flow behind the content dynamically */
.some-section {
    position: relative; 
    z-index: 1; /* Keep content above the fixed -1 background */
    /* Remove background property entirely */
}
```

## 🎯 Wrap-up

This protocol creates a seamless, high-end "Antigravity/Sci-Fi" aesthetic where the UI layers appear to float over an active data network traversing the depths of the screen.
