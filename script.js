// ============================================================
// OFFICEAIM LANDING PAGE — JAVASCRIPT
// Prompt Generator + Multi-language + Interactions
// ============================================================

// ============================================================
// 1) MULTI-LANGUAGE SUPPORT
// ============================================================
const translations = {
    en: {
        nav: {
            waitlist: "Join waiting list",
            demo: "Try demo"
        },
        hero: {
            eyebrow: "Practical AI for everyday work",
            title: "Make AI your daily office assistant — in minutes.",
            subtitle: "Copy proven workflows for emails, reports, notes, and productivity. No jargon. No coding. Just real results.",
            social: "Join 250+ professionals already taking action with OfficeAim.",
            cta1: "Join the waiting list",
            cta2: "Try the prompt generator",
            note: "You'll be redirected to a secure Google Form."
        },
        why: {
            title: "Why OfficeAim?",
            benefit1: {
                title: "No tech background needed",
                desc: "Copy simple, proven systems. No coding, no complex setup—just practical workflows you can use right away."
            },
            benefit2: {
                title: "Step-by-step guidance",
                desc: "Practical workflows that save hours. We break down every process into clear, actionable steps."
            },
            benefit3: {
                title: "Made for office tasks",
                desc: "Emails, reports, notes, summaries—everything you need for daily office productivity."
            },
            antihype: "AI shouldn't be hype or confusion. We cut through the noise and show what works, step by step."
        },
        demo: {
            title: "OfficeAim Prompt Generator",
            subtitle: "Generate ready-to-use AI prompts for your daily tasks",
            privacy: "Don't paste sensitive data. This tool runs entirely in your browser.",
            selectTemplate: "Select a template:",
            templates: {
                email: "Professional Email",
                summary: "Document Summary",
                project: "Project Plan",
                marketing: "Marketing Copy"
            },
            tone: "Tone:",
            tones: {
                professional: "Professional",
                friendly: "Friendly",
                technical: "Technical"
            },
            language: "Output Language:",
            generate: "Generate Prompt",
            reset: "Reset",
            copy: "Copy",
            output: {
                title: "Your Generated Prompt"
            },
            helper: "Paste this prompt into ChatGPT, Gemini, or your preferred AI assistant."
        },
        starter: {
            title: "What you get when you join (Free)",
            course: {
                title: "AI Starter Course (Free)",
                desc: "Guided first steps into practical AI for the workplace"
            },
            cheatsheet: {
                title: "200 Prompt Cheat Sheet (Free)",
                desc: "Workplace writing + productivity prompts ready to copy"
            },
            toolkit: {
                title: "AI Toolkit (Free)",
                desc: "Curated tools that work in office settings"
            },
            examples: {
                title: "Practical Example Library",
                desc: "Real office tasks solved step by step"
            },
            cta: "Join the waiting list & get the free starter kit"
        },
        footer: {
            tagline: "Learn. Apply. Automate.",
            product: "Product",
            features: "Features",
            courses: "Courses",
            toolkit: "Toolkit",
            examples: "Examples",
            connect: "Connect",
            newsletter: "Newsletter",
            rights: "All rights reserved.",
            redirect: "You will be redirected to a secure Google Form for the waiting list."
        }
    },
    es: {
        nav: {
            waitlist: "Únete a la lista de espera",
            demo: "Probar demo"
        },
        hero: {
            eyebrow: "IA práctica para el trabajo diario",
            title: "Convierte la IA en tu asistente diario de oficina — en minutos.",
            subtitle: "Copia flujos de trabajo probados para emails, reportes, notas y productividad. Sin jerga. Sin código. Solo resultados reales.",
            social: "Únete a más de 250 profesionales que ya están tomando acción con OfficeAim.",
            cta1: "Únete a la lista de espera",
            cta2: "Probar el generador de prompts",
            note: "Serás redirigido a un formulario seguro de Google."
        },
        why: {
            title: "¿Por qué OfficeAim?",
            benefit1: {
                title: "No necesitas experiencia técnica",
                desc: "Copia sistemas simples y probados. Sin código, sin configuración compleja—solo flujos de trabajo prácticos que puedes usar de inmediato."
            },
            benefit2: {
                title: "Guía paso a paso",
                desc: "Flujos de trabajo prácticos que ahorran horas. Desglosamos cada proceso en pasos claros y accionables."
            },
            benefit3: {
                title: "Hecho para tareas de oficina",
                desc: "Emails, reportes, notas, resúmenes—todo lo que necesitas para la productividad diaria de oficina."
            },
            antihype: "La IA no debería ser hype ni confusión. Cortamos el ruido y mostramos lo que funciona, paso a paso."
        },
        demo: {
            title: "Generador de Prompts OfficeAim",
            subtitle: "Genera prompts de IA listos para usar en tus tareas diarias",
            privacy: "No pegues datos sensibles. Esta herramienta funciona completamente en tu navegador.",
            selectTemplate: "Selecciona una plantilla:",
            templates: {
                email: "Email Profesional",
                summary: "Resumen de Documento",
                project: "Plan de Proyecto",
                marketing: "Copy de Marketing"
            },
            tone: "Tono:",
            tones: {
                professional: "Profesional",
                friendly: "Amigable",
                technical: "Técnico"
            },
            language: "Idioma de salida:",
            generate: "Generar Prompt",
            reset: "Reiniciar",
            copy: "Copiar",
            output: {
                title: "Tu Prompt Generado"
            },
            helper: "Pega este prompt en ChatGPT, Gemini, o tu asistente de IA preferido."
        },
        footer: {
            tagline: "Aprende. Aplica. Automatiza.",
            product: "Producto",
            features: "Características",
            courses: "Cursos",
            toolkit: "Herramientas",
            examples: "Ejemplos",
            connect: "Conectar",
            newsletter: "Newsletter",
            rights: "Todos los derechos reservados.",
            redirect: "Serás redirigido a un formulario seguro de Google para la lista de espera."
        }
    },
    nl: {
        nav: {
            waitlist: "Meld je aan voor de wachtlijst",
            demo: "Probeer demo"
        },
        hero: {
            eyebrow: "Praktische AI voor dagelijks werk",
            title: "Maak AI je dagelijkse kantoorassistent — in minuten.",
            subtitle: "Kopieer bewezen workflows voor e-mails, rapporten, notities en productiviteit. Geen jargon. Geen code. Alleen echte resultaten.",
            social: "Sluit je aan bij 250+ professionals die al actie ondernemen met OfficeAim.",
            cta1: "Meld je aan voor de wachtlijst",
            cta2: "Probeer de promptgenerator",
            note: "Je wordt doorgestuurd naar een beveiligd Google-formulier."
        },
        why: {
            title: "Waarom OfficeAim?",
            benefit1: {
                title: "Geen technische achtergrond nodig",
                desc: "Kopieer eenvoudige, bewezen systemen. Geen code, geen complexe setup—alleen praktische workflows die je meteen kunt gebruiken."
            },
            benefit2: {
                title: "Stap-voor-stap begeleiding",
                desc: "Praktische workflows die uren besparen. We splitsen elk proces op in duidelijke, uitvoerbare stappen."
            },
            benefit3: {
                title: "Gemaakt voor kantoortaken",
                desc: "E-mails, rapporten, notities, samenvattingen—alles wat je nodig hebt voor dagelijkse kantoorproductiviteit."
            },
            antihype: "AI zou geen hype of verwarring moeten zijn. We snijden door de ruis en laten zien wat werkt, stap voor stap."
        },
        demo: {
            title: "OfficeAim Promptgenerator",
            subtitle: "Genereer kant-en-klare AI-prompts voor je dagelijkse taken",
            privacy: "Plak geen gevoelige gegevens. Deze tool draait volledig in je browser.",
            selectTemplate: "Kies een template:",
            templates: {
                email: "Professionele E-mail",
                summary: "Documentsamenvatting",
                project: "Projectplan",
                marketing: "Marketingcopy"
            },
            tone: "Toon:",
            tones: {
                professional: "Professioneel",
                friendly: "Vriendelijk",
                technical: "Technisch"
            },
            language: "Uitvoertaal:",
            generate: "Genereer Prompt",
            reset: "Resetten",
            copy: "Kopiëren",
            output: {
                title: "Je Gegenereerde Prompt"
            },
            helper: "Plak deze prompt in ChatGPT, Gemini, of je favoriete AI-assistent."
        },
        footer: {
            tagline: "Leren. Toepassen. Automatiseren.",
            product: "Product",
            features: "Functies",
            courses: "Cursussen",
            toolkit: "Toolkit",
            examples: "Voorbeelden",
            connect: "Verbinden",
            newsletter: "Nieuwsbrief",
            rights: "Alle rechten voorbehouden.",
            redirect: "Je wordt doorgestuurd naar een beveiligd Google-formulier voor de wachtlijst."
        }
    }
};

let currentLang = 'en';

// ============================================================
// 2) PROMPT TEMPLATES
// ============================================================
const promptTemplates = {
    email: {
        fields: [
            { name: 'purpose', label: 'Email Purpose', type: 'text', placeholder: 'e.g., Request meeting, Follow up, Announcement' },
            { name: 'recipient', label: 'Recipient', type: 'text', placeholder: 'e.g., Team, Client, Manager' },
            { name: 'keyPoints', label: 'Key Points', type: 'textarea', placeholder: 'List the main points you want to communicate' },
            { name: 'length', label: 'Length', type: 'select', options: ['Short (3-4 sentences)', 'Medium (1-2 paragraphs)', 'Long (3+ paragraphs)'] }
        ],
        generate: (data, tone, lang) => {
            return `# PROFESSIONAL EMAIL PROMPT

**Task:** Write a ${data.length.toLowerCase()} professional email

**Purpose:** ${data.purpose}
**Recipient:** ${data.recipient}
**Tone:** ${tone}
**Language:** ${lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : 'Dutch'}

**Key Points to Include:**
${data.keyPoints}

**Instructions:**
- Keep the tone ${tone.toLowerCase()}
- Make it clear and concise
- Include appropriate greeting and closing
- Ensure proper email structure

**Ask me 1 clarifying question if anything is missing.**`;
        }
    },
    summary: {
        fields: [
            { name: 'docType', label: 'Document Type', type: 'text', placeholder: 'e.g., Meeting notes, Report, Article' },
            { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Executive team, Colleagues, Clients' },
            { name: 'outputFormat', label: 'Desired Output', type: 'select', options: ['Bullet points', 'Brief summary', 'Action items', 'Key takeaways'] },
            { name: 'context', label: 'Additional Context', type: 'textarea', placeholder: 'Any specific focus areas or requirements' }
        ],
        generate: (data, tone, lang) => {
            return `# DOCUMENT SUMMARY PROMPT

**Task:** Create a ${data.outputFormat.toLowerCase()} summary

**Document Type:** ${data.docType}
**Target Audience:** ${data.audience}
**Tone:** ${tone}
**Language:** ${lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : 'Dutch'}

**Output Format:** ${data.outputFormat}

**Additional Context:**
${data.context}

**Instructions:**
- Focus on the most important information
- Use ${data.outputFormat.toLowerCase()} format
- Keep it ${tone.toLowerCase()} and appropriate for ${data.audience}
- Highlight actionable insights if applicable

**Ask me 1 clarifying question if anything is missing.**`;
        }
    },
    project: {
        fields: [
            { name: 'goal', label: 'Project Goal', type: 'text', placeholder: 'What is the main objective?' },
            { name: 'timeline', label: 'Timeline', type: 'text', placeholder: 'e.g., 2 weeks, 3 months, Q2 2026' },
            { name: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'Budget, resources, dependencies, etc.' },
            { name: 'stakeholders', label: 'Key Stakeholders', type: 'text', placeholder: 'Who needs to be involved?' },
            { name: 'outputFormat', label: 'Output Format', type: 'select', options: ['Detailed plan', 'High-level roadmap', 'Task breakdown', 'Gantt chart structure'] }
        ],
        generate: (data, tone, lang) => {
            return `# PROJECT PLAN PROMPT

**Task:** Create a ${data.outputFormat.toLowerCase()} for a project

**Project Goal:** ${data.goal}
**Timeline:** ${data.timeline}
**Key Stakeholders:** ${data.stakeholders}
**Tone:** ${tone}
**Language:** ${lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : 'Dutch'}

**Constraints:**
${data.constraints}

**Desired Output:** ${data.outputFormat}

**Instructions:**
- Break down the project into clear phases or milestones
- Include realistic timelines based on ${data.timeline}
- Consider the constraints mentioned
- Make it actionable and easy to follow
- Format as ${data.outputFormat.toLowerCase()}

**Ask me 1 clarifying question if anything is missing.**`;
        }
    },
    marketing: {
        fields: [
            { name: 'product', label: 'Product/Service', type: 'text', placeholder: 'What are you promoting?' },
            { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?' },
            { name: 'value', label: 'Value Proposition', type: 'textarea', placeholder: 'What makes it unique/valuable?' },
            { name: 'channel', label: 'Channel', type: 'select', options: ['Social media', 'Email', 'Website', 'Ad copy', 'Blog post'] },
            { name: 'variants', label: 'Number of Variants', type: 'select', options: ['1', '3', '5'] }
        ],
        generate: (data, tone, lang) => {
            return `# MARKETING COPY PROMPT

**Task:** Write ${data.variants} variant(s) of marketing copy

**Product/Service:** ${data.product}
**Target Audience:** ${data.audience}
**Channel:** ${data.channel}
**Tone:** ${tone}
**Language:** ${lang === 'en' ? 'English' : lang === 'es' ? 'Spanish' : 'Dutch'}

**Value Proposition:**
${data.value}

**Instructions:**
- Create ${data.variants} different version(s)
- Optimize for ${data.channel}
- Keep the tone ${tone.toLowerCase()}
- Focus on benefits, not just features
- Include a clear call-to-action
- Make it compelling and conversion-focused

**Ask me 1 clarifying question if anything is missing.**`;
        }
    }
};

// ============================================================
// 3) DOM ELEMENTS
// ============================================================
let currentTemplate = 'email';
const formArea = document.getElementById('formArea');
const outputArea = document.getElementById('outputArea');
const outputContent = document.getElementById('outputContent');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const toneSelector = document.getElementById('toneSelector');
const languageOutput = document.getElementById('languageOutput');
const templateCards = document.querySelectorAll('.template-card');
const newsletterForm = document.getElementById('newsletterForm');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');

// ============================================================
// 4) TEMPLATE SWITCHING
// ============================================================
function renderForm(templateName) {
    if (!formArea) return;
    currentTemplate = templateName;
    const template = promptTemplates[templateName];

    let formHTML = '';
    template.fields.forEach(field => {
        formHTML += `<div class="form-group">`;
        formHTML += `<label for="${field.name}">${field.label}:</label>`;

        if (field.type === 'text') {
            formHTML += `<input type="text" id="${field.name}" name="${field.name}" placeholder="${field.placeholder}" required>`;
        } else if (field.type === 'textarea') {
            formHTML += `<textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder}" required></textarea>`;
        } else if (field.type === 'select') {
            formHTML += `<select id="${field.name}" name="${field.name}" required>`;
            field.options.forEach(option => {
                formHTML += `<option value="${option}">${option}</option>`;
            });
            formHTML += `</select>`;
        }

        formHTML += `</div>`;
    });

    formArea.innerHTML = formHTML;
}

// Template card click handlers
templateCards.forEach(card => {
    card.addEventListener('click', () => {
        templateCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const templateName = card.dataset.template;
        renderForm(templateName);
        outputArea.style.display = 'none';
    });
});

// ============================================================
// 5) PROMPT GENERATION
// ============================================================
if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        const template = promptTemplates[currentTemplate];
        const formData = {};
        let isValid = true;

        // Collect form data
        template.fields.forEach(field => {
            const element = document.getElementById(field.name);
            if (element && element.value.trim() === '') {
                isValid = false;
                element.style.borderColor = 'var(--accent-primary)';
            } else if (element) {
                formData[field.name] = element.value;
                element.style.borderColor = '';
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields');
            return;
        }

        // Generate prompt
        const tone = toneSelector.value;
        const lang = languageOutput.value;
        const generatedPrompt = template.generate(formData, tone, lang);

        // Display output
        outputContent.textContent = generatedPrompt;
        outputArea.style.display = 'block';
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// ============================================================
// 6) COPY FUNCTIONALITY
// ============================================================
if (copyBtn) copyBtn.addEventListener('click', async () => {
    const text = outputContent.textContent;

    try {
        await navigator.clipboard.writeText(text);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = 'rgba(34, 211, 238, 0.2)';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
        }, 2000);
    }
});

// ============================================================
// 7) RESET FUNCTIONALITY
// ============================================================
if (resetBtn) resetBtn.addEventListener('click', () => {
    renderForm(currentTemplate);
    outputArea.style.display = 'none';
    toneSelector.value = 'professional';
    languageOutput.value = 'en';
});

// ============================================================
// 8) NEWSLETTER FORM
// ============================================================
if (newsletterForm) {
    if (newsletterForm) newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;

        // Placeholder - integrate with your newsletter provider
        alert(`Thank you for subscribing with: ${email}\n\nIntegration with newsletter provider pending.`);
        newsletterForm.reset();
    });
}

// ============================================================
// 9) MOBILE MENU TOGGLE
// ============================================================
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;
        navLinks.classList.toggle('active');

        if (navLinks.classList.contains('active') && window.innerWidth <= 768) {
            ensureMobileNavCTAs();
        }

        // Toggle animation for burger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        mobileMenuToggle.classList.toggle('active');
        if (mobileMenuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Allow tapping dropdown headers on mobile to collapse/expand groups
document.querySelectorAll('.nav-item-dropdown > .nav-link').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const parent = trigger.closest('.nav-item-dropdown');
            if (parent) parent.classList.toggle('collapsed');
        }
    });
});

// Clean up mobile menu open state on desktop resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.classList.remove('active');
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.classList.remove('active');
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (spans.length === 3) {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    }
});

// Automatically ensure mobile action shortcut exists in mobile viewport
function ensureMobileNavCTAs() {
    if (window.innerWidth > 768) return; // Strict guard: never execute in desktop

    const navLinks = document.querySelector('.nav-links');
    if (!navLinks || navLinks.querySelector('.mobile-only-nav-item')) return;

    const campusLi = document.createElement('li');
    campusLi.className = 'mobile-only-nav-item';
    campusLi.innerHTML = `
        <a href="#waitlist" data-campus-gate="true" onclick="if(window.openCampusWaitlistModal){event.preventDefault();window.openCampusWaitlistModal();}" class="btn-campus-mobile">
            <span>Join the waitlist</span>
        </a>
    `;

    navLinks.appendChild(campusLi);
}

// ============================================================
// 10) SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#waitlist') {
            e.preventDefault();
            if (window.openCampusWaitlistModal) window.openCampusWaitlistModal();
            return;
        }
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================================
// 11) NAVBAR SCROLL EFFECT
// ============================================================
let lastScroll = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (!navbar) return;
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ============================================================
// 12) INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.benefit-card, .starter-card, .example-card, .feature-item, .gpt-card, .plan-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================================
// 13) INITIALIZE & NATIVE INTERACTIVE WAITLIST MODAL (SUPABASE)
// ============================================================
const OA_SUPABASE_URL = 'https://guemwhrdqmbneoccucht.supabase.co';
const OA_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZW13aHJkcW1ibmVvY2N1Y2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTExODgsImV4cCI6MjA4NjQ4NzE4OH0.VvKIYP7lJSxa_a3e8-Gb3xGfukJzmmacUUt79WA-OM8';

function resolveOfficeAimPath(relativePath) {
    const clean = relativePath.replace(/^\/+/, '');
    const path = window.location.pathname || '';
    if (path.includes('/resources/') || path.includes('/learn/') || path.includes('/news/')) {
        return '../' + clean;
    }
    return clean;
}

function getDynamicWaitlistRecommendation(role, bottleneck, stack) {
    const r = (role || '').toLowerCase();
    const b = (bottleneck || '').toLowerCase();
    const s = (stack || '').toLowerCase();

    if (b.includes('website') || b.includes('web') || r.includes('entrepreneur') || r.includes('builder')) {
        return {
            badge: 'Tailored path · Full-stack architecture',
            headline: 'Launch your first full-stack blueprint',
            message: 'Awesome! While we open the Campus, test our Web Blueprint Studio to design your first full-stack app.',
            primaryLabel: 'Open Web Blueprint Studio →',
            primaryUrl: resolveOfficeAimPath('resources/website-creator.html'),
            secondaryLabel: 'Explore 26 AI skills →',
            secondaryUrl: resolveOfficeAimPath('skills.html')
        };
    }

    if (b.includes('automate') || b.includes('n8n') || r.includes('automation') || r.includes('operator') || s === 'n8n') {
        return {
            badge: 'Tailored path · Autonomous pipelines',
            headline: 'Deploy production-ready n8n pipelines',
            message: 'We recommend exploring the n8n Vault with 98 ready-to-copy automation workflows.',
            primaryLabel: 'Explore the n8n Vault (98 workflows) →',
            primaryUrl: resolveOfficeAimPath('resources/workflows.html'),
            secondaryLabel: 'Open the Prompt Vault →',
            secondaryUrl: resolveOfficeAimPath('learn/prompts.html')
        };
    }

    return {
        badge: 'Tailored path · Prompt engineering & AI skills',
        headline: 'Master prompts and modular AI skills',
        message: 'Start today with our 26 AI skills and the OfficeAIM Prompt Vault.',
        primaryLabel: 'Open the OfficeAIM Prompt Vault →',
        primaryUrl: resolveOfficeAimPath('learn/prompts.html'),
        secondaryLabel: 'Explore the 26 AI skills →',
        secondaryUrl: resolveOfficeAimPath('skills.html')
    };
}

window.openCampusWaitlistModal = function () {
    let modal = document.getElementById('oa-campus-waitlist-modal');
    if (!modal) {
        const styleEl = document.createElement('style');
        styleEl.id = 'oa-waitlist-modal-styles';
        styleEl.textContent = `
            #oa-campus-waitlist-modal * { box-sizing: border-box; }
            .oa-wl-input, .oa-wl-select {
                width: 100%;
                padding: 0.78rem 0.95rem;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(15, 23, 42, 0.75);
                color: #F8FAFC;
                font-size: 0.9rem;
                font-family: 'Plus Jakarta Sans', sans-serif;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .oa-wl-input:focus, .oa-wl-select:focus {
                border-color: #00F0FF;
                box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.14);
            }
            .oa-wl-input::placeholder { color: #64748B; }
            .oa-wl-label {
                display: block;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: #94A3B8;
                margin-bottom: 0.42rem;
                text-align: left;
            }
            .oa-wl-option-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }
            .oa-wl-option-btn {
                width: 100%;
                text-align: left;
                padding: 0.72rem 0.95rem;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.03);
                color: #E2E8F0;
                font-size: 0.86rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all 0.18s ease;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            .oa-wl-option-btn:hover {
                border-color: rgba(0, 240, 255, 0.4);
                background: rgba(0, 240, 255, 0.06);
            }
            .oa-wl-option-btn.active {
                border-color: #FF7A18;
                background: rgba(255, 122, 24, 0.14);
                color: #FFFFFF;
                box-shadow: 0 0 18px rgba(255, 122, 24, 0.18);
            }
            .oa-wl-pill-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.45rem;
                margin-top: 0.35rem;
            }
            .oa-wl-pill {
                padding: 0.45rem 0.85rem;
                border-radius: 999px;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(255, 255, 255, 0.04);
                color: #CBD5E1;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.18s ease;
            }
            .oa-wl-pill.active {
                border-color: #00F0FF;
                background: rgba(0, 240, 255, 0.15);
                color: #00F0FF;
            }
        `;
        document.head.appendChild(styleEl);

        modal = document.createElement('div');
        modal.id = 'oa-campus-waitlist-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(3,7,18,0.86);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;transition:opacity 0.25s ease;overflow-y:auto;';
        modal.innerHTML = `
            <div style="position:relative;width:100%;max-width:540px;background:linear-gradient(165deg,rgba(13,19,33,0.98),rgba(7,10,18,0.99));border:1px solid rgba(255,122,24,0.38);border-radius:24px;padding:2rem 1.85rem;text-align:left;color:#F8FAFC;box-shadow:0 25px 60px -12px rgba(0,0,0,0.85),0 0 40px rgba(255,122,24,0.14);font-family:'Plus Jakarta Sans',sans-serif;max-height:92vh;overflow-y:auto;">
                <button type="button" id="oa-campus-waitlist-close" aria-label="Close modal" style="position:absolute;top:1rem;right:1rem;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#94A3B8;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">×</button>
                
                <div id="oa-wl-header-area" style="text-align:center;margin-bottom:1.35rem;">
                    <div style="display:inline-flex;align-items:center;gap:6px;padding:0.35rem 0.9rem;border-radius:999px;background:rgba(255,122,24,0.12);border:1px solid rgba(255,122,24,0.3);color:#FF7A18;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.85rem;">
                        <span>⚡ Priority access · Waitlist open</span>
                    </div>
                    <h2 style="font-size:1.65rem;font-weight:800;line-height:1.2;margin:0 0 0.55rem;color:#FFFFFF;letter-spacing:-0.02em;">We are building the Campus</h2>
                    <p style="font-size:0.88rem;line-height:1.55;color:#94A3B8;margin:0 auto;max-width:440px;">
                        The OfficeAIM Campus and its 19 specialized AI agents are in their final stabilization phase. Complete your profile below for priority access and an instant tailored resource.
                    </p>
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:1.15rem;">
                        <div id="oa-wl-prog-1" style="flex:1;height:5px;border-radius:999px;background:#FF7A18;transition:background 0.25s;"></div>
                        <div id="oa-wl-prog-2" style="flex:1;height:5px;border-radius:999px;background:rgba(255,255,255,0.12);transition:background 0.25s;"></div>
                        <div id="oa-wl-prog-3" style="flex:1;height:5px;border-radius:999px;background:rgba(255,255,255,0.12);transition:background 0.25s;"></div>
                    </div>
                    <div id="oa-wl-step-caption" style="font-size:0.72rem;font-weight:700;color:#00F0FF;text-transform:uppercase;letter-spacing:0.08em;margin-top:0.5rem;">
                        Step 1 of 3 · Contact &amp; VIP access
                    </div>
                </div>

                <form id="oa-waitlist-native-form" novalidate>
                    <!-- STEP 1 -->
                    <div id="oa-wl-step-1">
                        <div style="margin-bottom:0.95rem;">
                            <label class="oa-wl-label" for="oa-wl-name">1. Full name *</label>
                            <input type="text" id="oa-wl-name" class="oa-wl-input" placeholder="e.g. Alex Rivera" required />
                        </div>
                        <div style="margin-bottom:0.95rem;">
                            <label class="oa-wl-label" for="oa-wl-email">2. Email address *</label>
                            <input type="email" id="oa-wl-email" class="oa-wl-input" placeholder="alex@company.com" required />
                        </div>
                        <div style="margin-bottom:1.25rem;">
                            <label class="oa-wl-label" for="oa-wl-phone">3. WhatsApp / phone number <span style="color:#64748B;font-weight:500;text-transform:none;">(Optional — for 1-click VIP alerts)</span></label>
                            <input type="tel" id="oa-wl-phone" class="oa-wl-input" placeholder="+1 (555) 000-0000" />
                        </div>
                        <div id="oa-wl-err-1" style="display:none;color:#F87171;font-size:0.8rem;font-weight:600;margin-bottom:0.85rem;text-align:center;"></div>
                        <button type="button" id="oa-wl-next-1" style="width:100%;padding:0.95rem 1.25rem;border-radius:14px;border:none;background:linear-gradient(135deg,#FF7A18,#F59E0B);color:#FFFFFF;font-weight:800;font-size:0.92rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;box-shadow:0 10px 25px -5px rgba(255,122,24,0.45);">
                            <span>Next: Your profile &amp; goal</span>
                            <span>→</span>
                        </button>
                    </div>

                    <!-- STEP 2 -->
                    <div id="oa-wl-step-2" style="display:none;">
                        <label class="oa-wl-label">4. Your primary role or profile *</label>
                        <div class="oa-wl-option-grid" data-group="user_role">
                            <button type="button" class="oa-wl-option-btn active" data-val="Entrepreneur / Independent Builder">
                                <span>🚀 Entrepreneur / Independent builder</span>
                                <span>✓</span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Automation Engineer / AI Operator">
                                <span>⚙️ Automation engineer / AI operator</span>
                                <span></span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Student / Learner">
                                <span>🎓 Student / Learner</span>
                                <span></span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Other">
                                <span>✨ Other professional</span>
                                <span></span>
                            </button>
                        </div>

                        <label class="oa-wl-label">5. Main reason for joining *</label>
                        <div class="oa-wl-option-grid" data-group="join_reason">
                            <button type="button" class="oa-wl-option-btn active" data-val="Founding member discount">
                                <span>💎 Founding member discount</span>
                                <span>✓</span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Discover free AI software & how to use it">
                                <span>🧰 Discover free AI software &amp; how to use it</span>
                                <span></span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Connect with other professionals">
                                <span>🤝 Connect with other professionals</span>
                                <span></span>
                            </button>
                        </div>

                        <div style="display:flex;gap:0.65rem;margin-top:1.15rem;">
                            <button type="button" id="oa-wl-back-2" style="flex:0.4;padding:0.9rem;border-radius:14px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#CBD5E1;font-weight:700;font-size:0.86rem;cursor:pointer;">
                                ← Back
                            </button>
                            <button type="button" id="oa-wl-next-2" style="flex:1;padding:0.9rem 1.2rem;border-radius:14px;border:none;background:linear-gradient(135deg,#FF7A18,#F59E0B);color:#FFFFFF;font-weight:800;font-size:0.9rem;cursor:pointer;box-shadow:0 10px 25px -5px rgba(255,122,24,0.45);">
                                Final step: Current focus →
                            </button>
                        </div>
                    </div>

                    <!-- STEP 3 -->
                    <div id="oa-wl-step-3" style="display:none;">
                        <label class="oa-wl-label">6. What is your biggest current bottleneck? *</label>
                        <div class="oa-wl-option-grid" data-group="main_bottleneck">
                            <button type="button" class="oa-wl-option-btn active" data-val="Build my no-code website or full-stack app">
                                <span>🌐 Build my no-code website or full-stack app</span>
                                <span>✓</span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Automate social media, content & n8n workflows">
                                <span>⚡ Automate social media, content &amp; n8n workflows</span>
                                <span></span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="Create AI agents, prompts & databases">
                                <span>🧠 Create AI agents, prompts &amp; databases</span>
                                <span></span>
                            </button>
                            <button type="button" class="oa-wl-option-btn" data-val="None, just exploring AI">
                                <span>🔍 None, just exploring AI</span>
                                <span></span>
                            </button>
                        </div>

                        <div style="margin-bottom:1.15rem;">
                            <label class="oa-wl-label">Primary tool or stack you use most</label>
                            <div class="oa-wl-pill-row" id="oa-wl-stack-pills">
                                <button type="button" class="oa-wl-pill active" data-stack="ChatGPT">ChatGPT</button>
                                <button type="button" class="oa-wl-pill" data-stack="Claude">Claude</button>
                                <button type="button" class="oa-wl-pill" data-stack="n8n">n8n</button>
                                <button type="button" class="oa-wl-pill" data-stack="Supabase">Supabase</button>
                                <button type="button" class="oa-wl-pill" data-stack="None">None yet</button>
                            </div>
                        </div>

                        <div id="oa-wl-err-3" style="display:none;color:#F87171;font-size:0.8rem;font-weight:600;margin-bottom:0.85rem;text-align:center;"></div>

                        <div style="display:flex;gap:0.65rem;">
                            <button type="button" id="oa-wl-back-3" style="flex:0.38;padding:0.9rem;border-radius:14px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#CBD5E1;font-weight:700;font-size:0.86rem;cursor:pointer;">
                                ← Back
                            </button>
                            <button type="submit" id="oa-wl-submit" style="flex:1;padding:0.95rem 1.2rem;border-radius:14px;border:none;background:linear-gradient(135deg,#FF7A18,#F59E0B);color:#FFFFFF;font-weight:800;font-size:0.92rem;cursor:pointer;box-shadow:0 12px 25px -5px rgba(255,122,24,0.5);">
                                Lock in my priority spot →
                            </button>
                        </div>
                    </div>
                </form>

                <!-- SUCCESS & DYNAMIC RECOMMENDATION VIEW -->
                <div id="oa-wl-success-view" style="display:none;text-align:center;padding:0.5rem 0 0.25rem;">
                    <div style="width:54px;height:54px;border-radius:16px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);color:#10B981;font-size:1.6rem;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
                        ✓
                    </div>
                    <div id="oa-wl-rec-badge" style="display:inline-flex;align-items:center;gap:6px;padding:0.32rem 0.85rem;border-radius:999px;background:rgba(0,240,255,0.12);border:1px solid rgba(0,240,255,0.35);color:#00F0FF;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.75rem;">
                        Tailored recommendation
                    </div>
                    <h3 id="oa-wl-rec-headline" style="font-size:1.45rem;font-weight:800;color:#FFFFFF;margin:0 0 0.55rem;">You are on the official waitlist!</h3>
                    <p id="oa-wl-rec-msg" style="font-size:0.92rem;line-height:1.6;color:#CBD5E1;margin:0 auto 1.35rem;max-width:440px;"></p>
                    
                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(0,240,255,0.25);border-radius:18px;padding:1.15rem;margin-bottom:1.1rem;">
                        <a id="oa-wl-rec-primary" href="resources/website-creator.html" style="display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:0.95rem 1.25rem;border-radius:12px;background:linear-gradient(135deg,#00F0FF,#0EA5E9);color:#030712;font-weight:800;font-size:0.92rem;text-decoration:none;box-shadow:0 10px 25px -5px rgba(0,240,255,0.38);margin-bottom:0.65rem;">
                            <span>Open recommended studio →</span>
                        </a>
                        <a id="oa-wl-rec-secondary" href="skills.html" style="display:inline-flex;align-items:center;justify-content:center;width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#E2E8F0;font-weight:700;font-size:0.84rem;text-decoration:none;">
                            <span>Explore 26 AI skills →</span>
                        </a>
                    </div>
                </div>

                <div style="text-align:center;margin-top:0.85rem;">
                    <button type="button" id="oa-campus-waitlist-dismiss" style="background:transparent;border:none;color:#64748B;font-size:0.8rem;font-weight:600;cursor:pointer;padding:0.35rem 0.75rem;">
                        Continue exploring free resources
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // State inside modal closure
        const state = {
            user_role: 'Entrepreneur / Independent Builder',
            join_reason: 'Founding member discount',
            main_bottleneck: 'Build my no-code website or full-stack app',
            tech_stack: 'ChatGPT'
        };

        const setStep = (stepNum) => {
            const s1 = modal.querySelector('#oa-wl-step-1');
            const s2 = modal.querySelector('#oa-wl-step-2');
            const s3 = modal.querySelector('#oa-wl-step-3');
            const p1 = modal.querySelector('#oa-wl-prog-1');
            const p2 = modal.querySelector('#oa-wl-prog-2');
            const p3 = modal.querySelector('#oa-wl-prog-3');
            const cap = modal.querySelector('#oa-wl-step-caption');

            s1.style.display = stepNum === 1 ? 'block' : 'none';
            s2.style.display = stepNum === 2 ? 'block' : 'none';
            s3.style.display = stepNum === 3 ? 'block' : 'none';

            p1.style.background = stepNum >= 1 ? '#FF7A18' : 'rgba(255,255,255,0.12)';
            p2.style.background = stepNum >= 2 ? '#FF7A18' : 'rgba(255,255,255,0.12)';
            p3.style.background = stepNum >= 3 ? '#00F0FF' : 'rgba(255,255,255,0.12)';

            if (stepNum === 1) cap.textContent = 'Step 1 of 3 · Contact & VIP access';
            if (stepNum === 2) cap.textContent = 'Step 2 of 3 · Your role & goal';
            if (stepNum === 3) cap.textContent = 'Step 3 of 3 · Current bottleneck & stack';
        };

        // Option groups
        modal.querySelectorAll('.oa-wl-option-grid').forEach(grid => {
            const group = grid.getAttribute('data-group');
            grid.querySelectorAll('.oa-wl-option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    grid.querySelectorAll('.oa-wl-option-btn').forEach(b => {
                        b.classList.remove('active');
                        b.querySelector('span:last-child').textContent = '';
                    });
                    btn.classList.add('active');
                    btn.querySelector('span:last-child').textContent = '✓';
                    state[group] = btn.getAttribute('data-val');
                });
            });
        });

        // Stack pills
        modal.querySelectorAll('#oa-wl-stack-pills .oa-wl-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                modal.querySelectorAll('#oa-wl-stack-pills .oa-wl-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                state.tech_stack = pill.getAttribute('data-stack');
            });
        });

        // Step navigation
        modal.querySelector('#oa-wl-next-1').addEventListener('click', () => {
            const nameVal = modal.querySelector('#oa-wl-name').value.trim();
            const emailVal = modal.querySelector('#oa-wl-email').value.trim();
            const errEl = modal.querySelector('#oa-wl-err-1');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!nameVal) {
                errEl.textContent = 'Please enter your full name to continue.';
                errEl.style.display = 'block';
                return;
            }
            if (!emailRegex.test(emailVal)) {
                errEl.textContent = 'Please enter a valid email address.';
                errEl.style.display = 'block';
                return;
            }
            errEl.style.display = 'none';
            setStep(2);
        });

        modal.querySelector('#oa-wl-back-2').addEventListener('click', () => setStep(1));
        modal.querySelector('#oa-wl-next-2').addEventListener('click', () => setStep(3));
        modal.querySelector('#oa-wl-back-3').addEventListener('click', () => setStep(2));

        // Submit handler -> Supabase public.waitlist_entries
        modal.querySelector('#oa-waitlist-native-form').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const submitBtn = modal.querySelector('#oa-wl-submit');
            const err3 = modal.querySelector('#oa-wl-err-3');
            err3.style.display = 'none';

            const fullName = modal.querySelector('#oa-wl-name').value.trim();
            const email = modal.querySelector('#oa-wl-email').value.trim().toLowerCase();
            const phone = modal.querySelector('#oa-wl-phone').value.trim();

            const payload = {
                full_name: fullName,
                email: email,
                phone_whatsapp: phone || null,
                user_role: state.user_role,
                join_reason: state.join_reason,
                main_bottleneck: state.main_bottleneck,
                tech_stack: state.tech_stack,
                preferred_channel: phone ? 'WhatsApp' : 'Email'
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving your priority profile...';

            try {
                // Persist locally as instant backup
                localStorage.setItem('oa_waitlist_profile', JSON.stringify({ ...payload, saved_at: new Date().toISOString() }));

                const response = await fetch(`${OA_SUPABASE_URL}/rest/v1/waitlist_entries`, {
                    method: 'POST',
                    headers: {
                        'apikey': OA_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${OA_SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(payload)
                });

                // 201 Created, 200 OK, 204 No Content, or 409 Conflict (already on waitlist) all show recommendation
                if (!response.ok && response.status !== 409) {
                    console.warn('Supabase waitlist status:', response.status);
                }
            } catch (netErr) {
                console.warn('Waitlist saved to local buffer:', netErr);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Lock in my priority spot →';
            }

            // Show dynamic recommendation card
            const rec = getDynamicWaitlistRecommendation(state.user_role, state.main_bottleneck, state.tech_stack);
            modal.querySelector('#oa-wl-header-area').style.display = 'none';
            modal.querySelector('#oa-waitlist-native-form').style.display = 'none';
            const successView = modal.querySelector('#oa-wl-success-view');
            successView.querySelector('#oa-wl-rec-badge').textContent = rec.badge;
            successView.querySelector('#oa-wl-rec-headline').textContent = `Welcome aboard, ${fullName.split(' ')[0]}!`;
            successView.querySelector('#oa-wl-rec-msg').textContent = rec.message;

            const priBtn = successView.querySelector('#oa-wl-rec-primary');
            priBtn.href = rec.primaryUrl;
            priBtn.querySelector('span').textContent = rec.primaryLabel;

            const secBtn = successView.querySelector('#oa-wl-rec-secondary');
            secBtn.href = rec.secondaryUrl;
            secBtn.querySelector('span').textContent = rec.secondaryLabel;

            successView.style.display = 'block';
        });

        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => { modal.style.display = 'none'; }, 220);
        };
        modal.querySelector('#oa-campus-waitlist-close').addEventListener('click', closeModal);
        modal.querySelector('#oa-campus-waitlist-dismiss').addEventListener('click', closeModal);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) closeModal();
        });
        document.addEventListener('keydown', (ev) => {
            if (ev.key === 'Escape' && modal.style.display === 'flex') closeModal();
        });
    } else {
        // Reset to Step 1 if reopened before completing
        const successView = modal.querySelector('#oa-wl-success-view');
        if (successView && successView.style.display === 'none') {
            modal.querySelector('#oa-wl-header-area').style.display = 'block';
            modal.querySelector('#oa-waitlist-native-form').style.display = 'block';
        }
    }
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
};

// Allow Mascot iframe or child components to open the native Waitlist modal via postMessage
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'open-waitlist-modal') {
        window.openCampusWaitlistModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Restore Initializations
    if (typeof renderForm === 'function') renderForm('email');
    currentLang = 'en';

    // 2. Intercept ALL Campus / Waitlist / Google Form triggers and route to Native Waitlist Modal
    document.querySelectorAll('a').forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        const text = (link.textContent || '').toLowerCase();
        const isDataCampusGate = link.getAttribute('data-campus-gate') === 'true';

        const isCampusGate =
            isDataCampusGate ||
            href.includes('docs.google.com/forms') ||
            href === '#waitlist' ||
            href === '/hub' ||
            href === '/hub/' ||
            href === '/hub/login' ||
            href === 'construction.html' ||
            href === '/construction.html' ||
            href === '../construction.html' ||
            text.includes('claim my seat') ||
            text.includes('create your free account') ||
            text.includes('create account') ||
            text.includes('join waitlist') ||
            text.includes('campus waitlist') ||
            text.includes('enter campus') ||
            text.includes('enter the campus');

        if (isCampusGate) {
            link.setAttribute('href', '#waitlist');
            link.removeAttribute('target');
            link.removeAttribute('rel');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.openCampusWaitlistModal();
            });
        }
    });

    if (window.location.hash === '#waitlist') {
        window.openCampusWaitlistModal();
    }

    console.log('OfficeAim Landing Page Loaded ✓');
});

// ============================================================
// 14) GLOBAL PROMPT COPY HELPER
// ============================================================
window.copyPrompt = function (elementId, btn) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText || el.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span>✓ Copied!</span>';
        btn.style.borderColor = '#10B981';
        btn.style.color = '#10B981';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy prompt failed:', err);
    });
};

