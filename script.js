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
    if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');

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

// ============================================================
// 10) SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
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
// 13) INITIALIZE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Restore Initializations
    if (typeof renderForm === 'function') renderForm('email');
    currentLang = 'en';

    // 2. Fix Hub links for local preview (Universal Redirect to Build)
    const isLocalFile = window.location.protocol === 'file:';
    if (isLocalFile) {
        console.log("Local Preview Detected: Adjusting Hub links...");
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('/hub') || href.includes('hub/login'))) {
                // Point every hub-bound link to the local production build entry
                link.setAttribute('href', 'hub/dist/index.html');
                console.log(`Adjusted link: ${href} -> hub/dist/index.html`);
            }
        });
    }

    console.log('OfficeAim Landing Page Loaded ✓');
});
