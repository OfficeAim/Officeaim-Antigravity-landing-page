#!/usr/bin/env python3
"""
scripts/sync_nav.py
Single source of truth for the canonical OfficeAIM navigation bar, mobile menu,
and footer (including the Tools column) across all public HTML pages.

Idempotent: injects between <!-- NAV:START --> / <!-- NAV:END --> and
<!-- FOOTER:START --> / <!-- FOOTER:END --> markers without duplicating content.
"""

from pathlib import Path
import re
import sys

ROOT_DIR = Path(__file__).resolve().parent.parent

PUBLIC_PAGES = [
    # Root public pages
    "index.html",
    "learn.html",
    "skills.html",
    "prompt-generator.html",
    "news.html",
    "community.html",
    "blueprint.html",
    "use-cases.html",
    "security.html",
    "board.html",
    "policy.html",
    # Archived / secondary pages with navbar
    "features.html",
    "pricing-archived.html",
    # Learn subfolder
    "learn/prompts.html",
    # Resources subfolder
    "resources/website-creator.html",
    "resources/viralist-studio.html",
    "resources/workflows.html",
    "resources/qr-generator.html",
    "resources/free-stack-kit.html",
    "resources/library-tracker.html",
    # News articles
    "news/100-ai-websites-find-the-tools-that-matter.html",
    "news/ai-mvp-days.html",
    "news/ideogram-4-5-consistent-ai-image-editing.html",
    "news/meta-prompting.html",
    "news/openai-dots-always-on-ai-agents.html",
]

WAITLIST_ONCLICK = (
    "if(window.openCampusWaitlistModal){"
    "event.preventDefault();window.openCampusWaitlistModal();"
    "}"
)

TOOLS_ITEMS = [
    {
        "label": "Prompt generator",
        "href": "prompt-generator.html",
        "icon": "⭐",
        "desc": "Parametric meta-prompts calibrated for LLMs",
    },
    {
        "label": "AI skills",
        "href": "skills.html",
        "icon": "⚡",
        "desc": "26 modular agent skills ready to install",
    },
    {
        "label": "Web Blueprint Studio",
        "href": "resources/website-creator.html",
        "icon": "🌐",
        "desc": "Full-stack Jamstack blueprint compiler &amp; AI system designer",
    },
    {
        "label": "Viralist Studio",
        "href": "resources/viralist-studio.html",
        "icon": "🎬",
        "desc": "Short-form video blueprint compiler for Claude",
    },
    {
        "label": "n8n workflows",
        "href": "resources/workflows.html",
        "icon": "🔄",
        "desc": "98 production JSON workflows ready to import",
    },
    {
        "label": "QR generator",
        "href": "resources/qr-generator.html",
        "icon": "🔲",
        "desc": "Branded high-contrast QR codes, zero fees",
    },
    {
        "label": "Free stack kit",
        "href": "resources/free-stack-kit.html",
        "icon": "📦",
        "desc": "Curated agent skills pack &amp; step-by-step guide",
    },
    {
        "label": "Library tracker",
        "href": "resources/library-tracker.html",
        "icon": "📚",
        "desc": "AI vision book catalog &amp; student loan manager",
    },
]

LEARN_ITEMS = [
    {
        "label": "Learning paths",
        "href": "learn.html",
        "icon": "🎓",
        "desc": "Step-by-step AI agent curriculum &amp; guides",
    },
    {
        "label": "Prompt vault",
        "href": "learn/prompts.html",
        "icon": "🗂️",
        "desc": "Curated system prompts &amp; ready-to-copy templates",
    },
    {
        "label": "Use cases",
        "href": "use-cases.html",
        "icon": "🚀",
        "desc": "Real-world multi-agent workflows in production",
    },
    {
        "label": "Agent blueprint",
        "href": "blueprint.html",
        "icon": "🧭",
        "desc": "3-tier autonomous agent system architecture",
    },
]

CAMPUS_ITEMS = [
    {
        "label": "The AI board",
        "href": "board.html",
        "icon": "👥",
        "desc": "Meet your 19 specialist agents — free to explore",
    },
    {
        "label": "Community",
        "href": "community.html",
        "icon": "💬",
        "desc": "Open educational lab, builder support &amp; Q&amp;A",
    },
    {
        "label": "Join the waitlist",
        "href": "#waitlist",
        "icon": "✨",
        "desc": "Get early access when the interactive campus opens",
        "is_waitlist": True,
    },
]


def render_mega_link(item: dict, prefix: str, current_page: str) -> str:
    is_waitlist = item.get("is_waitlist", False)
    if is_waitlist:
        href = "#waitlist"
        extra_attrs = f' onclick="{WAITLIST_ONCLICK}" data-campus-gate="true"'
        active_cls = ""
    else:
        href = f"{prefix}{item['href']}"
        is_active = item["href"] == current_page
        active_cls = " active-mega-link" if is_active else ""
        extra_attrs = ' aria-current="page"' if is_active else ""

    return (
        f'                                    <a href="{href}" class="mega-link{active_cls}"{extra_attrs}>\n'
        f'                                        <div class="mega-icon">{item["icon"]}</div>\n'
        f'                                        <div class="mega-text">\n'
        f'                                            <strong>{item["label"]}</strong>\n'
        f'                                            <span>{item["desc"]}</span>\n'
        f'                                        </div>\n'
        f'                                    </a>'
    )


def render_nav(current_page: str, prefix: str) -> str:
    logo_href = "#hero" if current_page == "index.html" else f"{prefix}index.html"

    tools_active = any(i["href"] == current_page for i in TOOLS_ITEMS)
    learn_active = any(i["href"] == current_page for i in LEARN_ITEMS)
    campus_active = any(
        not i.get("is_waitlist") and i["href"] == current_page for i in CAMPUS_ITEMS
    )
    news_active = current_page == "news.html" or current_page.startswith("news/")

    tools_link_cls = "nav-link active-nav-link" if tools_active else "nav-link"
    learn_link_cls = "nav-link active-nav-link" if learn_active else "nav-link"
    campus_link_cls = "nav-link active-nav-link" if campus_active else "nav-link"
    news_link_cls = "nav-link active-nav-link" if news_active else "nav-link"
    news_aria = ' aria-current="page"' if news_active else ""

    tools_links_html = "\n".join(
        render_mega_link(item, prefix, current_page) for item in TOOLS_ITEMS
    )
    learn_links_html = "\n".join(
        render_mega_link(item, prefix, current_page) for item in LEARN_ITEMS
    )
    campus_links_html = "\n".join(
        render_mega_link(item, prefix, current_page) for item in CAMPUS_ITEMS
    )

    arrow_svg = (
        '<svg class="dropdown-arrow" width="12" height="12" '
        'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
        '<path d="M6 9l6 6 6-6" /></svg>'
    )

    return f"""    <!-- NAV:START -->
    <nav class="navbar" id="navbar">
        <div class="container nav-container">
            <a href="{logo_href}" class="logo">
                <img src="{prefix}images/favicon.png" alt="OfficeAIM Logo" class="logo-img" width="640" height="640">
            </a>
            <ul class="nav-links">
                <li class="nav-item-dropdown">
                    <a href="#tools" class="{tools_link_cls}">Tools {arrow_svg}</a>
                    <div class="mega-menu">
                        <div class="mega-menu-inner">
                            <div class="mega-menu-col">
                                <h4>Free tools &amp; generators</h4>
                                <div class="mega-menu-links-grid">
{tools_links_html}
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li class="nav-item-dropdown">
                    <a href="{prefix}learn.html" class="{learn_link_cls}">Learn {arrow_svg}</a>
                    <div class="mega-menu mega-menu-compact">
                        <div class="mega-menu-inner">
                            <div class="mega-menu-col">
                                <h4>Learning &amp; architecture</h4>
                                <div class="mega-menu-links-grid">
{learn_links_html}
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li class="nav-item-dropdown">
                    <a href="{prefix}board.html" class="{campus_link_cls}">Campus {arrow_svg}</a>
                    <div class="mega-menu mega-menu-compact">
                        <div class="mega-menu-inner">
                            <div class="mega-menu-col">
                                <h4>OfficeAIM campus</h4>
                                <div class="mega-menu-links-grid">
{campus_links_html}
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li><a id="nav-news-link" href="{prefix}news.html" class="{news_link_cls}"{news_aria}>News</a></li>
                <li class="mobile-only-nav-item">
                    <a href="#waitlist" onclick="{WAITLIST_ONCLICK}" data-campus-gate="true" class="btn-campus-mobile">
                        <span>Join the waitlist</span>
                    </a>
                </li>
            </ul>
            <div class="nav-ctas">
                <a href="#waitlist" onclick="{WAITLIST_ONCLICK}" data-campus-gate="true" class="btn btn-primary">Join the waitlist</a>
            </div>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle navigation menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>
    <!-- NAV:END -->"""


def render_footer(current_page: str, prefix: str) -> str:
    tools_li_html = "\n".join(
        f'                            <li><a href="{prefix}{item["href"]}">{item["label"]}</a></li>'
        for item in TOOLS_ITEMS
    )

    return f"""    <!-- FOOTER:START -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <img src="{prefix}images/logo_premium.png" alt="OfficeAIM Logo" class="footer-logo"
                        style="display:block;margin:0 auto 0.75rem;" width="640" height="640" loading="lazy">
                    <p class="footer-tagline" style="text-align:center;">Learn. Build. Automate.</p>
                    <p style="text-align:center;margin-top:0.5rem;">
                        <a href="{prefix}policy.html"
                            style="color:var(--text-muted);font-size:0.8rem;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:2px;">Privacy
                            &amp; terms</a>
                    </p>
                </div>
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>Tools</h4>
                        <ul>
{tools_li_html}
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>Learn &amp; campus</h4>
                        <ul>
                            <li><a href="{prefix}learn.html">Learning paths</a></li>
                            <li><a href="{prefix}learn/prompts.html">Prompt vault</a></li>
                            <li><a href="{prefix}use-cases.html">Use cases</a></li>
                            <li><a href="{prefix}blueprint.html">Agent blueprint</a></li>
                            <li><a href="{prefix}board.html">The AI board</a></li>
                            <li><a href="{prefix}community.html">Community</a></li>
                            <li><a id="footer-news-link" href="{prefix}news.html">News</a></li>
                            <li><a href="#waitlist" onclick="{WAITLIST_ONCLICK}" data-campus-gate="true">Join the waitlist</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>Connect</h4>
                        <ul>
                            <li><a href="https://www.instagram.com/office.aim/" target="_blank" rel="noopener">Instagram</a></li>
                            <li><a href="https://www.youtube.com/@Aimora-Officeaim" target="_blank" rel="noopener">YouTube</a></li>
                            <li><a href="https://www.facebook.com/profile.php?id=61584047901312" target="_blank" rel="noopener">Facebook</a></li>
                            <li><a href="https://www.linkedin.com/in/office-aim-hq-b8a7013a8/" target="_blank" rel="noopener">LinkedIn</a></li>
                            <li><a href="{prefix}security.html">Security &amp; trust</a></li>
                            <li><a href="{prefix}policy.html">Privacy &amp; terms</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-social">
                    <a href="https://www.instagram.com/office.aim/" target="_blank" rel="noopener" class="social-icon"
                        aria-label="Instagram">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </a>
                    <a href="https://www.youtube.com/@Aimora-Officeaim" target="_blank" rel="noopener" class="social-icon"
                        aria-label="YouTube">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/office-aim-hq-b8a7013a8/" target="_blank" rel="noopener" class="social-icon"
                        aria-label="LinkedIn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2026 OfficeAIM. Autonomous AI Systems &amp; Next-Gen Business Infrastructure. All tools are open-source and free for educational use. · <a href="{prefix}policy.html"
                        style="color:inherit;text-decoration:none;">Privacy &amp; Terms</a></p>
            </div>
        </div>
    </footer>
    <!-- FOOTER:END -->"""


NAV_MARKER_RE = re.compile(
    r"[ \t]*<!-- NAV:START -->.*?<!-- NAV:END -->",
    re.DOTALL,
)
NAV_TAG_RE = re.compile(
    r"[ \t]*<nav\b[^>]*\bclass=\"[^\"]*\bnavbar\b[^\"]*\"[^>]*>.*?</nav>",
    re.DOTALL,
)

FOOTER_MARKER_RE = re.compile(
    r"[ \t]*<!-- FOOTER:START -->.*?<!-- FOOTER:END -->",
    re.DOTALL,
)
FOOTER_TAG_RE = re.compile(
    r"[ \t]*<footer\b[^>]*\bclass=\"[^\"]*\bfooter\b[^\"]*\"[^>]*>.*?</footer>",
    re.DOTALL,
)


def sync_page(rel_path: str) -> bool:
    file_path = ROOT_DIR / rel_path
    if not file_path.exists():
        print(f"[WARN] File not found: {rel_path}", file=sys.stderr)
        return False

    prefix = "../" if "/" in rel_path else ""
    original = file_path.read_text(encoding="utf-8")
    updated = original

    nav_block = render_nav(rel_path, prefix)
    if NAV_MARKER_RE.search(updated):
        updated = NAV_MARKER_RE.sub(lambda _: nav_block, updated, count=1)
    elif NAV_TAG_RE.search(updated):
        updated = NAV_TAG_RE.sub(lambda _: nav_block, updated, count=1)
    else:
        print(f"[ERROR] No navbar target found in {rel_path}", file=sys.stderr)

    footer_block = render_footer(rel_path, prefix)
    if FOOTER_MARKER_RE.search(updated):
        updated = FOOTER_MARKER_RE.sub(lambda _: footer_block, updated, count=1)
    elif FOOTER_TAG_RE.search(updated):
        updated = FOOTER_TAG_RE.sub(lambda _: footer_block, updated, count=1)
    else:
        print(f"[ERROR] No footer target found in {rel_path}", file=sys.stderr)

    # Ensure script.js is loaded so mobile menu and waitlist modal work everywhere
    script_tag = f'<script src="{prefix}script.js"></script>'
    if "script.js" not in updated:
        updated = updated.replace("</body>", f"    {script_tag}\n</body>", 1)

    if updated != original:
        file_path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for page in PUBLIC_PAGES:
        if sync_page(page):
            changed += 1
            print(f"[UPDATED] {page}")
        else:
            print(f"[OK]      {page}")
    print(f"\nDone. {changed}/{len(PUBLIC_PAGES)} pages modified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
