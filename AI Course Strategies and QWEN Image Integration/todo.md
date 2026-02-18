## OfficeAIM Daily Action Plan

This plan is designed for approximately one hour of focused work each day. Please complete the tasks in order and mark them as done. Report your progress and any questions, and I will provide feedback and the next steps.

### Phase 1: Establish Daily Workflow and Initial Setup

**Day 1: Understand the Plan & Initial WordPress Tweaks**
- [x] **Task 1.1: Review the Daily Action Plan.** Read through this `todo.md` file to understand the overall structure and upcoming tasks.
- [x] **Task 1.2: Change WordPress Tagline.** Go to your WordPress Dashboard -> Settings -> General. Change the \'Tagline\' to: "Your AI Co-Pilot for the Modern Workplace." Save changes.
- [x] **Task 1.3: Optimize Hero Section Button Text.** On your homepage, change the text of your main Call-to-Action button to: "👉 JOIN THE FREE WAITLIST NOW".
- [x] **Task 1.4: Add Google Form Redirect Note.** Below your main CTA button, add the following line of text: "You will be redirected to a secure Google Form to join our list."

### Phase 2: Refine OfficeAIM Homepage (WordPress)

**Day 2: Convert to Focused Waitlist Landing Page (Marketing Pro & SEO Master)**

- [ ] **Task 2.1: Backup Homepage Content.** Go to your WordPress Dashboard → Pages → Open Home → Click Edit. Select all content → Copy into a Google Doc as a backup.
- [ ] **Task 2.2: Decide & Implement Single CTA.**
    - Primary CTA: "Join the free waitlist"
    - Secondary CTA (optional): "Start the free mini-course"
    - Only these CTAs should appear visually above the fold.
- [ ] **Task 2.3: Remove Distracting Navigation.**
    - **Option A (Recommended):** Dashboard → Appearance → Menus (or Customize → Menus). In the menu editor, remove all menu items (click the item → Delete). Save.
    - **Option B (If you have Custom CSS):** Find your homepage page id (inspect `<body>` tag for `page-id-123`). In Dashboard → Customize → Additional CSS, paste (replace 123 with your page id):
        ```css
        /* hide header/navigation on homepage only — replace 123 with your page id */
        .page-id-123 header.site-header,
        .page-id-123 nav.main-navigation {
          display: none !important;
        }
        ```
- [ ] **Task 2.4: Set Home as a Static Front Page.** Dashboard → Settings → Reading (or Customize → Homepage Settings). Under Your homepage displays, choose A static page and pick your Home page. Save.
- [ ] **Task 2.5: Structure Single-Scroll Sections with HTML Anchors.** For each section heading (Hero, Quick Win, What, How, Proof, FAQ, Join):
    - Edit the Home page.
    - Click the Heading block for that section. In the right sidebar under Advanced → HTML anchor, type the anchor ID (no #), for example: `hero`, `quick-win`, `what`, `how`, `proof`, `faq`, `join`. (IDs must be unique).
    - To create a link that jumps to that section: select text or a button, click the link icon and enter `#quick-win` (for example).
    - (Optional CSS for fixed headers): If you have a fixed/sticky header, add this CSS to the target heading (if needed):
        ```css
        /* offset anchor target so heading isn\'t hidden behind a fixed header */
        #quick-win { scroll-margin-top: 90px; } /* adjust 90px to match your header height (if header is fixed) */
        ```
- [ ] **Task 2.6: Replace Google Form with Embedded Opt-in (Recommended).** Use ConvertKit / MailerLite / Mailchimp to create an embed form. On WordPress.com, add a Custom HTML block and paste the embed code. (If embed is blocked, use the provider’s hosted form link as a CTA).
- [ ] **Task 2.7: Add a Lightweight In-Page Micro Nav (Optional).** If you removed the header, near the hero you can add small inline links (text or icon row) like: `Overview | Quick Win | What You Get | FAQ` — link them to `#overview`, `#quick-win`, etc.
- [ ] **Task 2.8: Test & QA.** Test anchor links across desktop and mobile. Test CTA form submission. Test page speed & mobile layout. If you used CSS, temporarily disable it to confirm no site-wide breakage.

**Day 3: Homepage Content Implementation (Revised)**
- [ ] **Task 3.1: Implement Hero Section Content.** (This will be provided by your AI Project Manager after you complete Day 2 tasks).
- [ ] **Task 3.2: Implement Quick Win Section Content.** (This will be provided by your AI Project Manager).
- [ ] **Task 3.3: Implement What You\'ll Get Section Content.** (This will be provided by your AI Project Manager).
- [ ] **Task 3.4: Implement How It Works Section Content.** (This will be provided by your AI Project Manager).
- [ ] **Task 3.5: Implement Proof / Testimonial Section Content.** (This will be provided by your AI Project Manager).
- [ ] **Task 3.6: Implement FAQ / Objections Section Content.** (This will be provided by your AI Project Manager).
- [ ] **Task 3.7: Implement Final CTA / Footer Section Content.** (This will be provided by your AI Project Manager).

**Day 4: WordPress Site Address & Visual Enhancements (Revised)**
- [ ] **Task 4.1: Check WordPress Site Address.** Go to your WordPress Dashboard -> Settings -> General. Check if `officeaim.wordpress.com` is available. If not, try variations (e.g., `officeaimai.wordpress.com`). Update if possible.
- [ ] **Task 4.2: Add Visuals to Homepage.** Integrate your OfficeAIM logo prominently. Consider adding simple, relevant icons (e.g., for bullet points) if your WordPress theme allows for it easily. (No Qwen.AI images yet, just basic theme features).

### Phase 3: Develop Core Course Content Outline

**Day 5: Outline Core Course Content - "The AI Productivity Sprint"**
- [ ] **Task 5.1: Instruct AI Project Manager to Outline Course.** Go to your ChatGPT conversation. Instruct your AI Project Manager to have the **Course Creator** agent draft a detailed 5-day outline for "The AI Productivity Sprint" course. This outline should leverage the content and themes already present on your WordPress site (`https://officeaim.wordpress.com/home/`) and the 

