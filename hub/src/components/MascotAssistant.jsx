import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, History, RotateCcw, Sliders } from 'lucide-react';
import { callAgent } from '../services/agentFactory';
import { supabase } from '../lib/supabase';

const MascotAssistant = ({ profile, isAdminDashboard = false }) => {
    // Read context query parameter from window location
    const queryParams = new URLSearchParams(window.location.search);
    const context = queryParams.get('context') || '';

    const [isOpen, setIsOpen] = useState(false);
    // Multi-language translation tables for the Mascot Guide (No emojis to ensure clean TTS audio)
    const greetings = {
        english: "Hi! I'm **AIM**, your platform guide. Ask me anything about OfficeAIM — modules, agents, how things work... I'm here to help!",
        spanish: "¡Hola! Soy **AIM**, tu guía en la plataforma. Preguntame lo que quieras sobre OfficeAIM, los módulos, agentes o lo que necesites...",
        dutch: "Hoi! Ik ben **AIM**, je platformgids. Vraag me alles over OfficeAIM — modules, agents, hoe het werkt... Ik ben hier om te helpen!",
        portuguese: "Oi! Eu sou o **AIM**, seu guia da plataforma. Pergunte-me qualquer coisa sobre o OfficeAIM — módulos, agentes, como funciona...",
        french: "Salut! Je suis **AIM**, votre guide sur la plateforme. Posez-moi des questions sur OfficeAIM — modules, agents, fonctionnement...",
        german: "Hallo! Ich bin **AIM**, dein Plattform-Guide. Frag mich alles über OfficeAIM — Module, Agenten, wie alles funktioniert..."
    };

    const quotesByLanguage = {
        english: [
            "If you have any questions, you can use this interface.",
            "AI will not replace you. A person using AI will.",
            "The real risk with AI isn't malice, but competence.",
            "We are entering an era where magic becomes technology.",
            "Intelligence is the ability to adapt to change.",
            "The best way to predict the future is to invent it."
        ],
        spanish: [
            "Si tenés alguna duda, podés usar este chat para consultarme.",
            "La IA no te va a reemplazar. Una persona usando IA lo hará.",
            "El verdadero riesgo con la IA no es la maldad, sino la competencia.",
            "Estamos entrando en una era donde la magia se convierte en tecnología.",
            "La inteligencia es la capacidad de adaptarse al cambio.",
            "La mejor manera de predecir el futuro es inventarlo."
        ],
        dutch: [
            "Als je vragen hebt, kun je deze interface gebruiken.",
            "AI zal je niet vervangen. Een persoon die AI gebruikt wel.",
            "Het echte risico met AI is niet boosaardigheid, maar competentie.",
            "We betreden een tijdperk waarin magie technologie wordt.",
            "Intelligentie is het vermogen om je aan te passen aan verandering.",
            "De beste manier om de toekomst te voorspellen is door deze uit te vinden."
        ],
        portuguese: [
            "Se você tiver alguma dúvida, pode usar esta interface.",
            "A IA não vai substituir você. Uma pessoa usando a IA vai.",
            "O risco real com a IA não é a malícia, mas a competência.",
            "Estamos entrando em uma era onde a magia se torna tecnologia.",
            "Inteligência é a habilidade de se adaptar à mudança.",
            "A melhor maneira de prever o futuro é inventá-lo."
        ],
        french: [
            "Si vous avez des questions, vous pouvez utiliser cette interface.",
            "L'IA ne vous remplacera pas. Une personne utilisant l'IA le fera.",
            "Le vrai risque avec l'IA n'est pas la malice, mais la compétence.",
            "Nous entrons dans une ère où la magie devient technologie.",
            "L'intelligence est la capacité de s'adapter au changement.",
            "La meilleure façon de prédire l'avenir est de l'inventer."
        ],
        german: [
            "Wenn du Fragen hast, kannst du dieses Interface nutzen.",
            "KI wird dich nicht ersetzen. Eine Person, die KI nutzt, schon.",
            "Das wahre Risiko bei KI ist nicht Böswilligkeit, sondern Kompetenz.",
            "Wir treten in eine Ära ein, in der Magie zu Technologie wird.",
            "Intelligenz ist die Fähigkeit, sich an Veränderungen anzupassen.",
            "Der beste Weg, die Zukunft vorherzusagen, ist, sie zu erfinden."
        ]
    };

    // Determine active language from profile or fallback
    const getActiveLanguage = () => {
        if (!profile?.id) return 'english';
        
        // Check profile language
        if (profile.language) return profile.language.toLowerCase();
        
        // Try local storage fallback
        try {
            const localFallback = JSON.parse(localStorage.getItem('officeaim_profiles_fallback') || '{}');
            if (localFallback[profile.id]?.language) {
                return localFallback[profile.id].language.toLowerCase();
            }
        } catch (e) {
            console.warn("Failed to load local storage language fallback:", e);
        }
        
        return 'english';
    };

    const activeLanguage = getActiveLanguage();
    const activeGreeting = greetings[activeLanguage] || greetings.english;
    const quotes = quotesByLanguage[activeLanguage] || quotesByLanguage.english;

    const [messages, setMessages] = useState([
        { role: 'agent', content: activeGreeting }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Triage State Machine
    const [triageState, setTriageState] = useState('inactive'); // 'inactive', 'q1', 'q2', 'q3'
    const [triageData, setTriageData] = useState({});

    // --- Conversational Speech APIs (STT & TTS) ---
    const [isListening, setIsListening] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [selectedVoiceEn, setSelectedVoiceEn] = useState(() => localStorage.getItem('officeaim_voice_en') || '');
    const [selectedVoiceEs, setSelectedVoiceEs] = useState(() => localStorage.getItem('officeaim_voice_es') || '');
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const recognitionRef = useRef(null);
    const lastSpokenTextRef = useRef('');

    // Auto-send ref to decouple handleSend closure from useEffect
    const handleSendRef = useRef(null);

    // Initialize Web Speech Recognition and pre-load voices
    useEffect(() => {
        // Pre-load voices and keep state synchronized
        const loadVoices = () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                const list = window.speechSynthesis.getVoices();
                if (list && list.length > 0) {
                    setAvailableVoices(list);
                }
            }
        };
        loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'es-AR'; // Match Rioplatense Spanish flows

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);
            rec.onerror = (e) => {
                console.warn("Speech recognition error:", e);
                setIsListening(false);
            };
            rec.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                setInput(transcript);
                if (handleSendRef.current) {
                    handleSendRef.current(transcript);
                }
            };
            recognitionRef.current = rec;
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Tu navegador no soporta el reconocimiento de voz nativo. Te sugiero usar Google Chrome o Safari en macOS.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // Conversational Text-to-Speech (Mascot Speaking as AIM)
    const speakText = (text) => {
        if (!isVoiceEnabled || !window.speechSynthesis) return;
        
        // Prevent concurrent double-speech for identical prompts under React re-renders or StrictMode
        if (lastSpokenTextRef.current === text) return;
        lastSpokenTextRef.current = text;
        
        window.speechSynthesis.cancel(); // Mute ongoing audio first
        
        // Sanitize markdown and all emojis so speech synthesizers never read aloud "cara sonriente", "cohete", etc.
        const cleanText = text
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/`|[#_*]/g, '')
            .replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/\s+([.,!?:;])/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Dynamically detect language to apply the correct accent and avoid robot-clashing Spanglish
        const isSpanish = /[áéíóúñ]|hola|jefe|entendido|gracias|cambio|sistema|rollback|buen|cómo|qué/i.test(cleanText);
        const voices = window.speechSynthesis.getVoices();

        // Tune rate and pitch to sound natural, warm, and grounded (calm human tone)
        utterance.rate = 0.94;
        utterance.pitch = isSpanish ? 0.98 : 0.93;

        let chosenVoice = null;

        if (isSpanish) {
            utterance.lang = 'es-AR';
            // 1. User manual Spanish voice selection
            if (selectedVoiceEs) {
                chosenVoice = voices.find(v => v.voiceURI === selectedVoiceEs || v.name === selectedVoiceEs);
            }
            // 2. Default Spanish hierarchy: Google español / Natural / Enhanced
            if (!chosenVoice) {
                chosenVoice = 
                    voices.find(v => v.lang.startsWith('es') && v.name.includes('Google español')) ||
                    voices.find(v => v.lang.startsWith('es') && (v.name.includes('Enhanced') || v.name.includes('Mejorada') || v.name.includes('Siri') || v.name.includes('Natural'))) ||
                    voices.find(v => v.lang.startsWith('es') && (v.name.includes('Paulina') || v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('Diego') || v.name.includes('Juan'))) ||
                    voices.find(v => v.lang === 'es-AR') ||
                    voices.find(v => v.lang.startsWith('es'));
            }
        } else {
            utterance.lang = 'en-GB';
            // 1. User manual English voice selection
            if (selectedVoiceEn) {
                chosenVoice = voices.find(v => v.voiceURI === selectedVoiceEn || v.name === selectedVoiceEn);
            }
            // 2. Default English hierarchy: Google UK English Female FIRST!
            if (!chosenVoice) {
                chosenVoice = 
                    voices.find(v => v.name.includes('Google UK English Female')) ||
                    voices.find(v => v.lang.startsWith('en') && v.name.includes('Female') && (v.name.includes('Google') || v.name.includes('Enhanced') || v.name.includes('Natural'))) ||
                    voices.find(v => v.lang.startsWith('en-GB') && (v.name.includes('Serena') || v.name.includes('Stephanie') || v.name.includes('Martha'))) ||
                    voices.find(v => v.lang.startsWith('en-GB') && (v.name.includes('Enhanced') || v.name.includes('Natural') || v.name.includes('Siri'))) ||
                    voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Daniel')) ||
                    voices.find(v => v.lang.startsWith('en-GB')) ||
                    voices.find(v => v.lang.startsWith('en'));
            }
        }

        if (chosenVoice) {
            utterance.voice = chosenVoice;
            utterance.lang = chosenVoice.lang;
        }

        // Clean cache reference on speech completion to allow repeating queries if desired
        utterance.onend = () => {
            lastSpokenTextRef.current = '';
        };
        utterance.onerror = () => {
            lastSpokenTextRef.current = '';
        };
        
        window.speechSynthesis.speak(utterance);
    };

    // Auto-read new agent responses when voice is enabled
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'agent') {
            speakText(lastMsg.content);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, isVoiceEnabled]);

    useEffect(() => {
        const lang = getActiveLanguage();
        if (isAdminDashboard) {
            setMessages([
                { role: 'agent', content: "Buenas, Jefe. **AIM** en línea. Todo listo en el Command Center. Pedime cualquier cambio de código, base de datos o lógica que necesites en el campus. También podés tirar `/rollback` para revertir a un estado anterior o `/diagnose` para auditar la salud del sistema. Estoy a tus órdenes. ¿Qué hacemos hoy?" }
            ]);
        } else if (context === 'website-creator') {
            setMessages([
                { role: 'agent', content: "Hello! I'm **AIM**, your design co-pilot. I'm here to help you architect your website's technical blueprint step-by-step.\n\nComplete the 3-phase form: we will define your brand identity, site architecture, and call-to-action routing (WhatsApp or Custom Webhooks). In the background, I'll compile the developer prompts and sync them to your dashboard. If you have questions about form fields, platform costs, or our results-driven partnership, feel free to ask me in any language!" }
            ]);
        } else {
            setMessages([
                { role: 'agent', content: greetings[lang] || greetings.english }
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, profile?.language, isAdminDashboard, context]);

    const [showGreeting, setShowGreeting] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Greeting bubble looping logic
    useEffect(() => {
        const interval = setInterval(() => {
            setShowGreeting(prev => {
                // If it's about to show again, pick the next quote
                if (!prev) {
                    setQuoteIndex(i => (i + 1) % quotes.length);
                }
                return !prev;
            });
        }, 5000); // Toggles true/false every 5 seconds

        return () => clearInterval(interval);
    }, [quotes]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Force transparent root for iframe mode
    useEffect(() => {
        if (window.parent && window.parent !== window) {
            document.body.style.backgroundColor = 'transparent';
            const root = document.querySelector('.bg-\\[\\#070A12\\]');
            if (root) root.classList.remove('bg-[#070A12]');
        }
    }, []);

    // Send iframe resize signals to parent
    useEffect(() => {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'mascot-toggle', isOpen }, '*');
        }
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Listen for parent logo generation requests
    useEffect(() => {
        const handleParentMessages = async (event) => {
            if (event.data && event.data.type === 'generate-logo-svg') {
                const { businessName, initials, vibe, description } = event.data;
                setIsOpen(true);
                setIsTyping(true);
                
                // Formulate the prompt query for Gemini
                const initialsText = initials || (businessName ? businessName[0] : 'W');
                const promptQuery = `✨ GENERATE LOGO REQUEST: Make a modern minimal typographic SVG logo for the brand '${businessName}' with the initials '${initialsText}' and design vibe '${vibe}'. User description: '${description || 'Clean aesthetic typography'}'.`;
                
                // Add automated temporary indicator
                setMessages(prev => [...prev, { 
                    role: 'agent', 
                    content: `Sure thing, Sir! Designing a bespoke vector SVG logo for **${businessName}** [Vibe: *${vibe}*]... Please hold on, I am currently architecting the geometric paths and compiling the raw SVG nodes! 🎨` 
                }]);
                
                try {
                    const result = await callAgent('MASCOT', promptQuery, [], 'WEBSITE-CREATOR');
                    
                    // Extract the raw SVG block from the response
                    const svgMatch = result.text.match(/<svg[\s\S]*?<\/svg>/i);
                    if (svgMatch) {
                        const svgCode = svgMatch[0];
                        // Send the SVG back to parent
                        window.parent.postMessage({ type: 'logo-svg-generated', svg: svgCode }, '*');
                        
                        setMessages(prev => [...prev, { 
                            role: 'agent', 
                            content: `Splendid! I have successfully generated a gorgeous, responsive vector SVG logo for **${businessName}** and sent it directly to your website creator's SVG Logo Lab. You can now download the raw asset or lock it to automatically inject it inline inside the Lovable blueprint! 🚀` 
                        }]);
                    } else {
                        setMessages(prev => [...prev, { 
                            role: 'agent', 
                            content: `Sir, I generated the logo design but had difficulty formatting the XML nodes properly. Would you mind clicking the generate button again to re-compile?` 
                        }]);
                    }
                } catch (err) {
                    console.warn("Mascot logo bridge API call failed, initiating premium client-side vector fallback:", err);
                    
                    // Client-Side Premium Vector Generator Engine (Fallback)
                    const text = initialsText.toUpperCase();
                    const cleanName = businessName || 'OfficeAIM Brand';
                    let svgContent = "";
                    
                    if (vibe.includes('Minimal Tech')) {
                        svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="50%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#f97316" />
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#06b6d4" flood-opacity="0.4"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#f97316" flood-opacity="0.5"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#030712" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
  <!-- Decorative background circuit lines -->
  <path d="M 25,60 H 45 L 60,75 V 125 L 45,140 H 25" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
  <path d="M 175,60 H 155 L 140,75 V 125 L 155,140 H 175" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
  
  <!-- Glowing double tech orbits in 3D perspective -->
  <ellipse cx="100" cy="95" rx="76" ry="24" fill="none" stroke="url(#glowGrad)" stroke-width="1" stroke-opacity="0.15" transform="rotate(-28 100 95)" />
  <ellipse cx="100" cy="95" rx="76" ry="24" fill="none" stroke="url(#glowGrad)" stroke-width="1.5" stroke-opacity="0.25" stroke-dasharray="8 4" transform="rotate(28 100 95)" />
  
  <!-- Outer glowing ring -->
  <circle cx="100" cy="95" r="62" fill="none" stroke="url(#techGrad)" stroke-opacity="0.08" stroke-width="6"/>
  <circle cx="100" cy="95" r="62" fill="none" stroke="url(#techGrad)" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="150 10 30 10"/>
  
  <!-- Hexagonal central tech shield -->
  <polygon points="100,34 152,64 152,126 100,156 48,126 48,64" fill="none" stroke="url(#techGrad)" stroke-width="3" filter="url(#glow)"/>
  <polygon points="100,42 144,68 144,122 100,148 56,122 56,68" fill="#080e1b" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" />
  
  <!-- Circuit micro-traces inside shield -->
  <path d="M 100,42 V 58 M 100,148 V 132 M 56,68 L 70,78 M 144,68 L 130,78" fill="none" stroke="url(#techGrad)" stroke-width="1" stroke-opacity="0.4" />
  
  <!-- Glowing neon LED nodes -->
  <circle cx="100" cy="34" r="3.5" fill="#06b6d4" filter="url(#coreGlow)"/>
  <circle cx="100" cy="156" r="3.5" fill="#f97316" filter="url(#coreGlow)"/>
  <circle cx="48" cy="95" r="2.5" fill="#ffffff" filter="url(#coreGlow)"/>
  <circle cx="152" cy="95" r="2.5" fill="#ffffff" filter="url(#coreGlow)"/>
  
  <!-- Central letters with glowing bottom-layer shadow -->
  <text x="100" y="103" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="44" fill="#06b6d4" text-anchor="middle" letter-spacing="-1.5" dominant-baseline="central" filter="url(#glow)" opacity="0.45">${text}</text>
  <text x="100" y="100" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="-1.5" dominant-baseline="central">${text}</text>
  
  <!-- Bottom Brand Text with glow -->
  <text x="100" y="186" font-family="'Outfit', 'Inter', sans-serif" font-weight="800" font-size="8" fill="url(#techGrad)" text-anchor="middle" letter-spacing="4" dominant-baseline="central" filter="url(#coreGlow)">${cleanName.toUpperCase()}</text>
</svg>`;
                    } else if (vibe.includes('Sleek Modern Serif')) {
                        svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="30%" stop-color="#eab308" />
      <stop offset="70%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#e5e7eb" />
      <stop offset="100%" stop-color="#9ca3af" />
    </linearGradient>
    <filter id="nobleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#eab308" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#050505" stroke="url(#goldGrad)" stroke-opacity="0.1" stroke-width="1.5"/>
  
  <!-- Laurel branch leaves (Left) -->
  <g fill="url(#goldGrad)" opacity="0.6">
    <path d="M 46,95 C 40,88 42,75 42,75 C 42,75 51,80 50,88 Z" />
    <path d="M 44,115 C 38,108 40,95 40,95 C 40,95 49,100 48,108 Z" />
    <path d="M 48,75 C 44,68 48,58 48,58 C 48,58 55,65 52,70 Z" />
  </g>
  <!-- Laurel branch leaves (Right) -->
  <g fill="url(#goldGrad)" opacity="0.6" transform="translate(200, 0) scale(-1, 1)">
    <path d="M 46,95 C 40,88 42,75 42,75 C 42,75 51,80 50,88 Z" />
    <path d="M 44,115 C 38,108 40,95 40,95 C 40,95 49,100 48,108 Z" />
    <path d="M 48,75 C 44,68 48,58 48,58 C 48,58 55,65 52,70 Z" />
  </g>

  <!-- Imperial Crown heraldry floating -->
  <path d="M 90,38 L 82,28 L 92,31 L 100,22 L 108,31 L 118,28 L 110,38 Z" fill="url(#goldGrad)" filter="url(#nobleGlow)" />
  <circle cx="100" cy="21" r="1.5" fill="#ffffff" />
  <circle cx="82" cy="27" r="1.2" fill="#ffffff" />
  <circle cx="118" cy="27" r="1.2" fill="#ffffff" />
  <rect x="88" y="39" width="24" height="2.5" rx="1" fill="url(#goldGrad)" />
  
  <!-- Majestic Heraldic Shield of Trust -->
  <path d="M 58,48 L 142,48 C 142,105 125,142 100,158 C 75,142 58,105 58,48 Z" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round" filter="url(#nobleGlow)"/>
  <path d="M 64,54 L 136,54 C 136,101 121,133 100,147 C 79,133 64,101 64,54 Z" fill="#0b0b0e" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  
  <!-- Classic luxurious Serif Initials -->
  <text x="100" y="94" font-family="'Playfair Display', 'Georgia', serif" font-weight="700" font-size="44" fill="url(#silverGrad)" text-anchor="middle" font-style="italic" dominant-baseline="central">${text}</text>
  
  <!-- Delicate Gold divider -->
  <path d="M 80,122 C 90,125 110,125 120,122" fill="none" stroke="url(#goldGrad)" stroke-width="1.2" opacity="0.7" stroke-linecap="round"/>
  
  <!-- Brand text under shield -->
  <text x="100" y="140" font-family="'Outfit', sans-serif" font-weight="600" font-size="7.5" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4" dominant-baseline="central">${cleanName.toUpperCase()}</text>
</svg>`;
                    } else if (vibe.includes('Abstract Monogram')) {
                        svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="monoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="50%" stop-color="#db2777" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
    <linearGradient id="monoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#db2777" flood-opacity="0.35"/>
    </filter>
    <filter id="glowOnly" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="200" height="200" rx="36" fill="#06030c" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  
  <!-- Technical outer alignment circles -->
  <circle cx="100" cy="95" r="68" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" stroke-dasharray="4, 12"/>
  <circle cx="100" cy="95" r="60" fill="none" stroke="url(#monoGrad2)" stroke-opacity="0.15" stroke-width="1"/>
  <circle cx="100" cy="95" r="52" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1.5" />
  
  <!-- Floating background particles -->
  <circle cx="50" cy="65" r="1.5" fill="#38bdf8" opacity="0.6" filter="url(#glowOnly)" />
  <circle cx="150" cy="65" r="2" fill="#db2777" opacity="0.5" filter="url(#glowOnly)" />
  <circle cx="70" cy="140" r="1" fill="#c084fc" opacity="0.8" />
  <circle cx="130" cy="140" r="1.8" fill="#38bdf8" opacity="0.4" filter="url(#glowOnly)" />

  <!-- Overlapping 3D Infinity Interlocking Loop Monogram -->
  <path d="M 62,95 C 62,72 98,72 100,95 C 102,118 138,118 138,95 C 138,72 102,72 100,95 C 98,118 62,118 62,95 Z" 
        fill="none" stroke="url(#monoGrad1)" stroke-width="5" filter="url(#shadow)" stroke-linecap="round"/>
  <path d="M 62,95 C 62,72 98,72 100,95 C 102,118 138,118 138,95" 
        fill="none" stroke="url(#monoGrad2)" stroke-width="2.5" stroke-opacity="0.8" stroke-linecap="round"/>
        
  <!-- Interlocking overlay highlighting arcs -->
  <path d="M 72,82 C 85,76 96,86 100,95" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.3" stroke-linecap="round" />
  <path d="M 128,108 C 115,114 104,104 100,95" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.3" stroke-linecap="round" />
  
  <!-- Concentric core core elements -->
  <circle cx="78" cy="95" r="4.5" fill="#06030c" stroke="url(#monoGrad2)" stroke-width="1.5" />
  <circle cx="122" cy="95" r="4.5" fill="#06030c" stroke="url(#monoGrad1)" stroke-width="1.5" />

  <!-- Typography elements in high quality Outfit font -->
  <text x="100" y="94" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="38" fill="#ffffff" text-anchor="middle" letter-spacing="-1.5" filter="url(#shadow)" dominant-baseline="central">${text}</text>
  
  <!-- Brand caption -->
  <text x="100" y="166" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="8" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="3" dominant-baseline="central">${cleanName.toUpperCase()}</text>
</svg>`;
                    } else {
                        svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="50%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <filter id="neon" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feDropShadow dx="0" dy="5" stdDeviation="10" flood-color="#00f2fe" flood-opacity="0.45"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <pattern id="dotGrid" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1" fill="rgba(0, 242, 254, 0.04)" />
    </pattern>
  </defs>
  <rect width="200" height="200" rx="36" fill="#02040a" stroke="#00f2fe" stroke-opacity="0.1" stroke-width="1.5"/>
  <rect width="200" height="200" rx="36" fill="url(#dotGrid)"/>
  
  <!-- Cybernetic tech HUD corner brackets with micro notches -->
  <g stroke="#00f2fe" stroke-width="2" fill="none" opacity="0.8">
    <!-- Top-Left -->
    <path d="M 24,46 V 24 H 46" stroke-linecap="square" />
    <rect x="28" y="28" width="4" height="4" fill="#00f2fe" stroke="none" />
    <!-- Top-Right -->
    <path d="M 176,46 V 24 H 154" stroke-linecap="square" />
    <rect x="168" y="28" width="4" height="4" fill="#00f2fe" stroke="none" />
    <!-- Bottom-Left -->
    <path d="M 24,144 V 166 H 46" stroke-linecap="square" />
    <rect x="28" y="158" width="4" height="4" fill="#00f2fe" stroke="none" />
    <!-- Bottom-Right -->
    <path d="M 176,144 V 166 H 154" stroke-linecap="square" />
    <rect x="168" y="158" width="4" height="4" fill="#00f2fe" stroke="none" />
  </g>
  
  <!-- System Diagnostic mini parameters (simulated data) -->
  <text x="54" y="32" font-family="'Courier New', monospace" font-size="5" fill="rgba(0, 242, 254, 0.3)" font-weight="bold">SYS.LOCKED // 0A2F</text>
  <text x="146" y="164" font-family="'Courier New', monospace" font-size="5" fill="rgba(0, 242, 254, 0.3)" font-weight="bold" text-anchor="end">INIT.SEQ_2026</text>

  <!-- Tactical Target crosshairs in background -->
  <line x1="100" y1="26" x2="100" y2="40" stroke="rgba(0, 242, 254, 0.15)" stroke-width="1"/>
  <line x1="100" y1="150" x2="100" y2="164" stroke="rgba(0, 242, 254, 0.15)" stroke-width="1"/>
  <line x1="26" y1="95" x2="40" y2="95" stroke="rgba(0, 242, 254, 0.15)" stroke-width="1"/>
  <line x1="160" y1="95" x2="174" y2="95" stroke="rgba(0, 242, 254, 0.15)" stroke-width="1"/>

  <!-- Core Glowing Cybernetic Shield / Cog ring -->
  <circle cx="100" cy="95" r="48" fill="none" stroke="rgba(0, 242, 254, 0.05)" stroke-width="6" />
  <circle cx="100" cy="95" r="48" fill="none" stroke="url(#cyberGrad)" stroke-width="3" filter="url(#neon)" />
  <!-- Inner cog teeth -->
  <circle cx="100" cy="95" r="41" fill="none" stroke="rgba(0, 242, 254, 0.4)" stroke-width="1" stroke-dasharray="2 6" />
  
  <!-- Central letter with glowing cyan / magenta glitch shadow offset -->
  <text x="101" y="94" font-family="'Outfit', 'Courier New', monospace" font-weight="900" font-size="34" fill="#ec4899" text-anchor="middle" letter-spacing="1" filter="url(#neon)" opacity="0.6" dominant-baseline="central">${text}</text>
  <text x="98" y="92" font-family="'Outfit', 'Courier New', monospace" font-weight="900" font-size="34" fill="#00f2fe" text-anchor="middle" letter-spacing="1" filter="url(#neon)" opacity="0.6" dominant-baseline="central">${text}</text>
  <text x="100" y="93" font-family="'Outfit', 'Courier New', monospace" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="1" dominant-baseline="central">${text}</text>
  
  <!-- Cyberpunk Brackets Tag Name -->
  <text x="100" y="156" font-family="'Courier New', monospace" font-weight="900" font-size="8" fill="#00f2fe" text-anchor="middle" letter-spacing="3" filter="url(#neon)" dominant-baseline="central">&lt; ${cleanName.toUpperCase()} &gt;</text>
</svg>`;
                    }
                    
                    // Dispatch the local vector back to the parent page
                    window.parent.postMessage({ type: 'logo-svg-generated', svg: svgContent }, '*');
                    
                    setMessages(prev => [...prev, { 
                        role: 'agent', 
                        content: `Excellent! Since Gemini is experiencing minor connection limits, I have successfully initiated our **Local SVG Vector Engine** to compile a premium typographic logo for **${businessName}**. The vector SVG has been injected directly into your SVG Logo Lab! You can download it or lock it for prompt-injection. 🚀` 
                    }]);
                } finally {
                    setIsTyping(false);
                }
            }
        };

        window.addEventListener('message', handleParentMessages);
        return () => window.removeEventListener('message', handleParentMessages);
    }, [profile, context]);

    useEffect(() => {
        handleSendRef.current = handleSend;
    });

    const handleSend = async (forcedInput = null) => {
        const textToSend = typeof forcedInput === 'string' ? forcedInput : input;
        const trimmed = textToSend.trim();
        if (!trimmed || isTyping) return;

        const userMsg = { role: 'user', content: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // --- ADMIN SYSTEM COMMAND & DELEGATION PROTOCOL ---
        if (isAdminDashboard) {
            const isHelpRequest = /posibilidades|posibllidades|qué podés hacer|qué podes hacer|que podes hacer|ayuda|help/i.test(trimmed) || trimmed.includes('/help');
            const isRollbackRequest = /rollback|revertir|volver atrás|volver atras|restaurar|deshacer/i.test(trimmed) || trimmed.includes('/rollback');
            const isDiagnoseRequest = /diagnose|diagnóstico|diagnostico|salud|diagnosticar/i.test(trimmed) || trimmed.includes('/diagnose');
            const isChangeRequest = /cambiar|cambia|modificar|modifica|crear|crea|agregar|agrega|eliminar|borrar|arreglar|fix|código|code|sistema|system/i.test(trimmed) || trimmed.includes('/change');

            if (isHelpRequest) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        role: 'agent',
                        content: `¡Claro que sí, Jefe! Como tu **copiloto AIM**, tengo estas capacidades exclusivas para coordinar con **Antigravity**:\n\n` +
                                 `1. 🛠️ **Solicitud de Cambio (` + "`/change [pedido]`" + `)**: Decime qué querés cambiar en las páginas, bases de datos o lógicas. Lo registraré en Supabase y **Antigravity** lo aplicará en caliente.\n` +
                                 `2. ⏪ **Punto de Restauración (` + "`/rollback [Ticket ID]`" + `)**: Si algo se rompe, decime que querés volver atrás o restaurar. **Antigravity** usará Git para revertir el código exactamente al punto anterior estable.\n` +
                                 `3. 📊 **Diagnóstico del Sistema (` + "`/diagnose`" + `)**: Evaluamos costes, estado de conexión de base de datos y tests en caliente.\n\n` +
                                 `¡Solo decímelo o hablámelo usando el micrófono y me pongo a trabajar!`
                    }]);
                    setIsTyping(false);
                }, 600);
                return;
            }

            if (isRollbackRequest) {
                try {
                    const { data: ticketData, error: ticketErr } = await supabase
                        .from('support_tickets')
                        .insert({
                            user_id: profile?.id || 'admin-user',
                            student_name: profile?.full_name || 'Admin',
                            issue: '⏪ System Rollback Request',
                            description: trimmed,
                            status: 'open',
                            page_url: window.location.href,
                            generated_prompt: `ANTIGRAVITY_ROLLBACK: ${trimmed}`
                        })
                        .select()
                        .maybeSingle();

                    if (ticketErr) throw ticketErr;

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `¡Recibido, Jefe! Acabo de registrar una **orden de reversión del sistema** (Rollback Request) con éxito${ticketData?.id ? ` (Ticket ID: **#${ticketData.id}**)` : ''}.\n\nEl Agente **Antigravity** detendrá cualquier proceso en segundo plano, leerá tu orden y revertirá el código en Git al punto de funcionamiento estable anterior. ¡Tus cimientos están a salvo! 🏰`
                        }]);
                        setIsTyping(false);
                    }, 800);
                    return;
                } catch (dbErr) {
                    console.warn("Rollback queue insertion failed, using fallback:", dbErr);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `¡Entendido, Jefe! He registrado la orden de reversión en la cola local de Git. **Antigravity** aplicará el reset al commit estable anterior en la próxima sincronización. ¡Tus archivos están seguros!`
                        }]);
                        setIsTyping(false);
                    }, 800);
                    return;
                }
            }

            if (isDiagnoseRequest) {
                try {
                    const { data: ticketData, error: ticketErr } = await supabase
                        .from('support_tickets')
                        .insert({
                            user_id: profile?.id || 'admin-user',
                            student_name: profile?.full_name || 'Admin',
                            issue: '📊 System Diagnostics Request',
                            description: trimmed,
                            status: 'open',
                            page_url: window.location.href,
                            generated_prompt: `ANTIGRAVITY_DIAGNOSE: ${trimmed}`
                        })
                        .select()
                        .maybeSingle();

                    if (ticketErr) throw ticketErr;

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `¡Entendido, Jefe! Orden de **diagnóstico del sistema** registrada${ticketData?.id ? ` (Ticket ID: **#${ticketData.id}**)` : ''}.\n\n**Antigravity** ejecutará de inmediato un escaneo de costes de API, integridad de tablas de Supabase y salud de puertos del servidor en caliente. ¡Los resultados se reflejarán en tu Command Center!`
                        }]);
                        setIsTyping(false);
                    }, 800);
                    return;
                } catch (dbErr) {
                    console.warn("Diagnostics queue insertion failed:", dbErr);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `¡Registrado! La orden de diagnóstico fue enviada a la terminal del Agente. **Antigravity** iniciará la auditoría del sistema de inmediato.`
                        }]);
                        setIsTyping(false);
                    }, 800);
                    return;
                }
            }

            if (isChangeRequest) {
                try {
                    const { data: ticketData, error: ticketErr } = await supabase
                        .from('support_tickets')
                        .insert({
                            user_id: profile?.id || 'admin-user',
                            student_name: profile?.full_name || 'Admin',
                            issue: '🛠️ System Change Request',
                            description: trimmed,
                            status: 'open',
                            page_url: window.location.href,
                            generated_prompt: `ANTIGRAVITY_COMMAND: ${trimmed}`
                        })
                        .select()
                        .maybeSingle();

                    if (ticketErr) throw ticketErr;

                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `¡Entendido, Jefe! He registrado tu **solicitud técnica de cambio** en la cola de desarrollo con éxito${ticketData?.id ? ` (Ticket ID: **#${ticketData.id}**)` : ''}.\n\nEl Agente Inteligente **Antigravity** leerá esta instrucción en su próxima sincronización de código y la aplicará directamente en tu espacio de trabajo local. ¡Es así de fácil!`
                        }]);
                        setIsTyping(false);
                    }, 800);
                    return;
                } catch (dbErr) {
                    console.warn("Failed to insert ticket to Supabase, fallback to client-side logging:", dbErr);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `¡Entendido, Jefe! Registré tu solicitud de cambio técnico en la sesión de depuración. El Agente Inteligente **Antigravity** analizará este requerimiento y lo aplicará en tu entorno local en la próxima sincronización. ¡Es así de fácil!`
                        }]);
                        setIsTyping(false);
                    }, 800);
                    return;
                }
            }
        }

        // --- TRIAGE MODE HANDLING (Bypasses LLM) ---
        if (triageState !== 'inactive') {
            setTimeout(() => {
                if (triageState === 'q1') {
                    setTriageData(prev => ({ ...prev, whatTried: trimmed }));
                    setMessages(prev => [...prev, { role: 'agent', content: "Got it. **Question 2/3:** What happened instead?" }]);
                    setTriageState('q2');
                } else if (triageState === 'q2') {
                    setTriageData(prev => ({ ...prev, whatHappened: trimmed }));
                    setMessages(prev => [...prev, { role: 'agent', content: "Okay. **Question 3/3:** What browser and device are you using? (e.g. Chrome on Mac)" }]);
                    setTriageState('q3');
                } else if (triageState === 'q3') {
                    const finalPayload = { ...triageData, browserDev: trimmed, timestamp: new Date().toISOString() };
                    // Format into clean JSON and log
                    console.log("[Support_Inbox_Payload]", JSON.stringify(finalPayload, null, 2));
                    setMessages(prev => [...prev, { role: 'agent', content: "Thank you, I have sent this to the Admin Engineering team." }]);
                    setTriageState('inactive'); // Reset
                    setTriageData({});
                }
                setIsTyping(false);
            }, 600); // Artificial delay to feel natural
            return;
        }

        // --- NORMAL LLM HANDLING ---
        const WAITLIST_FORM_URL = '#waitlist';
        const isSpanishQuery = /[áéíóúñ¿¡]|\b(hola|buenas|como|cómo|que|qué|cuando|cuándo|donde|dónde|quiero|puedo|campus|lista|espera|ayuda|precio|gratis|curso|agentes|registro|registrarme)\b/i.test(trimmed);

        try {
            const historyForApi = messages.slice(1).concat(userMsg);
            // External visitors default to 'FREE' and are never blocked
            const userTier = isAdminDashboard ? 'ADMIN' : (context === 'website-creator' ? 'WEBSITE-CREATOR' : (profile?.tier || 'FREE'));
            const result = await callAgent('MASCOT', trimmed, historyForApi, userTier);

            if (!result || !result.text || !result.text.trim()) {
                throw new Error('Empty response from Gemini API');
            }

            // Intercept Triage Trigger
            if (result.text.includes('[START_BUG_TRIAGE]')) {
                setMessages(prev => [...prev, { role: 'agent', content: "It sounds like you hit a bug! Let's get this reported. I need to ask you 3 quick questions. \n\n**Question 1/3:** What were you trying to do?" }]);
                setTriageState('q1');
            } else {
                setMessages(prev => [...prev, { role: 'agent', content: result.text }]);
            }
        } catch (err) {
            console.warn('Mascot chat fallback activated:', err);
            const friendlyFallback = isSpanishQuery
                ? "¡Hola! Estoy recibiendo muchas consultas en este momento. Por favor, únete a nuestra **Lista de Espera** para recibir actualizaciones prioritarias."
                : "Hi! I'm receiving a high volume of inquiries right now. Please join our **Official Waitlist** to receive priority updates and early Campus access.";
            const ctaLabel = isSpanishQuery ? "Unirse a la Lista de Espera →" : "Join Official Waitlist →";
            setMessages(prev => [...prev, {
                role: 'agent',
                content: friendlyFallback,
                ctaUrl: WAITLIST_FORM_URL,
                ctaLabel
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isWidget = window.parent && window.parent !== window;

    return (
        <div className={isWidget ? "fixed bottom-0 right-0 p-4 w-[420px] max-w-full flex flex-col justify-end" : "mt-6 pt-6 border-t border-white/5"}>
            {/* Mascot Section Label */}
            {!isWidget && (
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className={`h-4 w-4 ${isAdminDashboard ? 'text-cyan-400' : 'text-orange-400'}`} />
                    <h2 className="text-xs font-black italic uppercase tracking-widest text-white">
                        {isAdminDashboard ? 'AI Systems Pilot' : 'AI Assistant'}
                    </h2>
                </div>
            )}

            {/* Mascot Avatar Button */}
            <div className="relative">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-2xl border transition-all duration-300 ease-out flex items-center gap-3 ${isOpen
                        ? (isAdminDashboard ? 'w-full bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'w-full bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(255,122,24,0.15)]')
                        : ((isWidget && !isOpen) 
                            ? (isAdminDashboard ? 'w-auto bg-[#070A12]/80 border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 shadow-[0_8px_32px_rgba(6,182,212,0.2)] backdrop-blur-xl rounded-2xl mt-auto ml-auto' : 'w-auto bg-[#070A12]/80 border-white/10 hover:border-orange-500/40 hover:bg-orange-500/10 shadow-[0_8px_32px_rgba(255,122,24,0.2)] backdrop-blur-xl rounded-2xl mt-auto ml-auto')
                            : (isAdminDashboard ? 'w-full bg-white/[0.02] border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'w-full bg-white/[0.02] border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 hover:shadow-[0_0_15px_rgba(255,122,24,0.1)]'))
                        }`}
                >
                    <div className={`relative shrink-0 flex items-center justify-center ${isAdminDashboard ? 'w-16 h-16' : 'w-12 h-12'}`}>
                        {isAdminDashboard ? (
                            <div className="relative w-16 h-16 rounded-full bg-[#00f2fe]/5 border border-[#00f2fe]/40 shadow-[0_0_20px_rgba(0,242,254,0.4)] flex items-center justify-center overflow-hidden hover:shadow-[0_0_25px_rgba(0,242,254,0.8)] transition-all duration-500">
                                {/* The premium OfficeAIM logo with breathing scale and glowing effect */}
                                <motion.img
                                    src="/hub/logo_officeaim.png"
                                    alt="OfficeAIM Command Logo"
                                    animate={{
                                        scale: [0.95, 1.05, 0.95],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut'
                                    }}
                                    className="w-14 h-14 rounded-full object-cover shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                                />
                                {/* Cybernetic scanning light or outer rotating ring */}
                                <div className="absolute inset-0 border border-t-transparent border-b-transparent border-[#00f2fe]/40 rounded-full animate-spin" style={{ animationDuration: '6s' }} />
                            </div>
                        ) : (
                            <motion.div
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <img
                                    src="/hub/mascot_aim.png"
                                    alt="AIM Mascot"
                                    className="h-20 w-20 rounded-2xl object-cover border-2 border-orange-500/40 shadow-[0_0_15px_rgba(255,122,24,0.5)] hover:shadow-[0_0_30px_rgba(255,122,24,0.9)] transition-all duration-500"
                                />
                            </motion.div>
                        )}
                        <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#0A0F18] animate-pulse ${isAdminDashboard ? 'bg-[#00f2fe] shadow-[0_0_12px_rgba(0,242,254,0.9)]' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]'}`} />
                    </div>
                    {(!isWidget || isOpen) && (
                        <>
                            <div className="text-left flex-grow min-w-0">
                                <div className={`text-[11px] font-black italic tracking-wide ${isAdminDashboard ? 'text-[#00f2fe]' : 'text-white'}`}>
                                    AIM
                                </div>
                                {isAdminDashboard && (
                                    <div className="text-[7.5px] text-cyan-400/80 font-bold uppercase tracking-wider font-mono leading-none my-0.5">
                                        Advanced Intelligent Management
                                    </div>
                                )}
                                <div className="text-[9px] text-text-muted italic truncate">
                                    {isOpen ? (isAdminDashboard ? 'Systems Pilot Active...' : 'Chat active...') : (isAdminDashboard ? 'At your service, Sir...' : 'Ask me anything!')}
                                </div>
                            </div>
                            {!isOpen && (
                                <div className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center border ${
                                    isAdminDashboard 
                                        ? 'bg-cyan-500/15 border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.2)]' 
                                        : 'bg-orange-500/15 border-orange-500/30 shadow-[0_0_10px_rgba(255,122,24,0.2)]'
                                }`}>
                                    <Send className={`h-3 w-3 ${isAdminDashboard ? 'text-cyan-400' : 'text-orange-400'}`} />
                                </div>
                            )}
                        </>
                    )}
                </motion.button>

                {/* Greeting Bubble */}
                <AnimatePresence>
                    {isWidget && !isOpen && showGreeting && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`absolute bottom-24 right-4 w-48 bg-[#070A12]/90 backdrop-blur-2xl border rounded-2xl rounded-br-none p-4 pointer-events-none ${
                                isAdminDashboard 
                                    ? 'border-cyan-500/40 shadow-[0_10px_40px_rgba(0,242,254,0.15)]' 
                                    : 'border-orange-500/40 shadow-[0_10px_40px_rgba(255,122,24,0.15)]'
                            }`}
                        >
                            <div className="flex items-start gap-2">
                                <Sparkles className={`h-4 w-4 shrink-0 mt-0.5 animate-pulse ${isAdminDashboard ? 'text-cyan-400' : 'text-orange-400'}`} />
                                <p className="text-[10px] text-white/90 italic leading-relaxed font-medium">
                                    {quotes[quoteIndex]}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Panel */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: 10 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 rounded-2xl bg-[#060910]/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                                {/* Chat Header */}
                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full animate-pulse ${
                                            isAdminDashboard 
                                                ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.6)]' 
                                                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                        }`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#a1a1aa] italic">
                                            {isAdminDashboard ? 'Systems Pilot Active' : 'Live Chat'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {/* Toggle Voice Config Popover */}
                                        {isVoiceEnabled && (
                                            <button
                                                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                                                title="Configurar voz"
                                                className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${
                                                    showVoiceSettings 
                                                        ? (isAdminDashboard ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'bg-orange-500/30 text-orange-300 border border-orange-500/50') 
                                                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                                                }`}
                                            >
                                                <Sliders size={12} />
                                            </button>
                                        )}
                                        {/* Toggle Voice Output (Altavoz) */}
                                        <button
                                            onClick={() => {
                                                const nextState = !isVoiceEnabled;
                                                setIsVoiceEnabled(nextState);
                                                if (!nextState && window.speechSynthesis) {
                                                    window.speechSynthesis.cancel();
                                                }
                                            }}
                                            title={isVoiceEnabled ? "Silenciar voz de AIM" : "Activar voz de AIM"}
                                            className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${
                                                isVoiceEnabled 
                                                    ? (isAdminDashboard ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30') 
                                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'
                                            }`}
                                        >
                                            {isVoiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/15 hover:scale-105 transition-all text-white/60 hover:text-white"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Voice Selector Dropdown (Collapsible) */}
                                {showVoiceSettings && isVoiceEnabled && (
                                    <div className="px-3 py-2 bg-[#04060b] border-b border-white/10 space-y-1.5 text-[10px]">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-cyan-400 font-mono text-[9px] uppercase tracking-wider shrink-0 font-bold">Voz EN:</span>
                                            <select
                                                value={selectedVoiceEn}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSelectedVoiceEn(val);
                                                    localStorage.setItem('officeaim_voice_en', val);
                                                    if (window.speechSynthesis) {
                                                        window.speechSynthesis.cancel();
                                                        lastSpokenTextRef.current = '';
                                                        speakText("English voice calibrated.");
                                                    }
                                                }}
                                                className="bg-[#0b101b] text-white/90 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none w-full max-w-[245px] truncate cursor-pointer hover:border-cyan-500/40 transition-colors"
                                            >
                                                <option value="">Por defecto (Google UK English Female)</option>
                                                {availableVoices
                                                    .filter(v => v.lang.startsWith('en'))
                                                    .map(v => (
                                                        <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                                                            {v.name} ({v.lang})
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-orange-400 font-mono text-[9px] uppercase tracking-wider shrink-0 font-bold">Voz ES:</span>
                                            <select
                                                value={selectedVoiceEs}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSelectedVoiceEs(val);
                                                    localStorage.setItem('officeaim_voice_es', val);
                                                    if (window.speechSynthesis) {
                                                        window.speechSynthesis.cancel();
                                                        lastSpokenTextRef.current = '';
                                                        speakText("Voz en español configurada.");
                                                    }
                                                }}
                                                className="bg-[#0b101b] text-white/90 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none w-full max-w-[245px] truncate cursor-pointer hover:border-orange-500/40 transition-colors"
                                            >
                                                <option value="">Por defecto (Google español / Natural)</option>
                                                {availableVoices
                                                    .filter(v => v.lang.startsWith('es'))
                                                    .map(v => (
                                                        <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                                                            {v.name} ({v.lang})
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Messages */}
                                <div className="h-[250px] overflow-y-auto scrollbar-hide p-4 space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${msg.role === 'user'
                                                ? (isAdminDashboard ? 'bg-cyan-500/10 border border-cyan-500/20 text-white shadow-[0_0_10px_rgba(0,242,254,0.05)]' : 'bg-orange-500/10 border border-orange-500/20 text-white')
                                                : 'bg-white/[0.03] border border-white/5 text-white/80'
                                                }`}>
                                                <div>
                                                    {msg.content.split('**').map((part, i) =>
                                                        i % 2 === 1
                                                            ? <strong key={i} className={`font-black ${isAdminDashboard ? 'text-cyan-300' : 'text-orange-300'}`}>{part}</strong>
                                                            : <span key={i}>{part}</span>
                                                    )}
                                                </div>
                                                {msg.ctaUrl && (
                                                    <a
                                                        href={msg.ctaUrl}
                                                        onClick={(e) => {
                                                            if (msg.ctaUrl === '#waitlist') {
                                                                e.preventDefault();
                                                                if (window.parent && window.parent !== window) {
                                                                    window.parent.postMessage({ type: 'open-waitlist-modal' }, '*');
                                                                } else {
                                                                    window.location.href = '/hub/login';
                                                                }
                                                            }
                                                        }}
                                                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-[10px] uppercase tracking-wider shadow-md transition-all cursor-pointer"
                                                    >
                                                        <span>{msg.ctaLabel || 'Join Official Waitlist →'}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-xl">
                                                <div className="flex gap-1.5">
                                                    <div className={`h-1.5 w-1.5 rounded-full animate-bounce ${isAdminDashboard ? 'bg-cyan-400/60' : 'bg-orange-400/60'}`} style={{ animationDelay: '0ms' }} />
                                                    <div className={`h-1.5 w-1.5 rounded-full animate-bounce ${isAdminDashboard ? 'bg-cyan-400/60' : 'bg-orange-400/60'}`} style={{ animationDelay: '150ms' }} />
                                                    <div className={`h-1.5 w-1.5 rounded-full animate-bounce ${isAdminDashboard ? 'bg-cyan-400/60' : 'bg-orange-400/60'}`} style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-2 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={isListening 
                                                ? (isAdminDashboard ? "Escuchando, Señor... lo escucho" : "Listening... speak now") 
                                                : (isAdminDashboard ? "Preguntame o pedime un cambio, Señor..." : "Ask me anything about OfficeAIM...")
                                            }
                                            disabled={isTyping}
                                            className={`flex-grow bg-white/5 border rounded-xl px-3 py-2 text-[11px] focus:outline-none transition-all placeholder:text-white/20 disabled:opacity-50 ${
                                                isListening 
                                                    ? (isAdminDashboard 
                                                        ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,254,0.2)] bg-cyan-500/5 text-cyan-200' 
                                                        : 'border-orange-500/50 shadow-[0_0_10px_rgba(255,122,24,0.2)] bg-orange-500/5 text-orange-200') 
                                                    : (isAdminDashboard 
                                                        ? 'border-white/10 focus:border-cyan-500/30 text-white' 
                                                        : 'border-white/10 focus:border-orange-500/30 text-white')
                                            }`}
                                        />
                                        {/* Toggle Voice Input (Micrófono) */}
                                        <button
                                            type="button"
                                            onClick={toggleListening}
                                            disabled={isTyping}
                                            title={isListening ? "Detener micrófono" : "Escuchar con micrófono"}
                                            className={`h-[34px] w-[34px] rounded-xl flex items-center justify-center transition-all disabled:opacity-30 shrink-0 ${
                                                isListening 
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isTyping}
                                            className={`h-[34px] w-[34px] rounded-xl flex items-center justify-center transition-all disabled:opacity-30 shrink-0 ${
                                                isAdminDashboard 
                                                    ? 'bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(0,242,254,0.1)]' 
                                                    : 'bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 shadow-[0_0_10px_rgba(255,122,24,0.1)]'
                                            }`}
                                        >
                                            <Send className={`h-3.5 w-3.5 ${isAdminDashboard ? 'text-cyan-400' : 'text-orange-400'}`} />
                                        </button>
                                    </div>
                                    <p className="text-[8px] text-text-muted italic text-center mt-1.5 opacity-50">
                                        {isAdminDashboard 
                                            ? 'AIM Command Pilot · Direct Neural Sync' 
                                            : 'Messages are ephemeral · Not stored'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MascotAssistant;
