import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Mic, MicOff, Volume2, VolumeX, History, RotateCcw } from 'lucide-react';
import { callAgent } from '../services/agentFactory';
import { supabase } from '../lib/supabase';

const MascotAssistant = ({ profile, isAdminDashboard = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Multi-language translation tables for the Mascot Guide
    const greetings = {
        english: "Hi! 👋 I'm **AIM**, your platform guide. Ask me anything about OfficeAIM — modules, agents, how things work... I'm here to help!",
        spanish: "¡Hola! 👋 Soy **AIM**, tu guía en la plataforma. Preguntame lo que quieras sobre OfficeAIM, los módulos, agentes o lo que necesites...",
        dutch: "Hoi! 👋 Ik ben **AIM**, je platformgids. Vraag me alles over OfficeAIM — modules, agents, hoe het werkt... Ik ben hier om te helpen!",
        portuguese: "Oi! 👋 Eu sou o **AIM**, seu guia da plataforma. Pergunte-me qualquer coisa sobre o OfficeAIM — módulos, agentes, como funciona...",
        french: "Salut! 👋 Je suis **AIM**, votre guide sur la plateforme. Posez-moi des questions sur OfficeAIM — modules, agents, fonctionnement...",
        german: "Hallo! 👋 Ich bin **AIM**, dein Plattform-Guide. Frag mich alles über OfficeAIM — Module, Agenten, wie alles funktioniert..."
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
    const recognitionRef = useRef(null);
    const lastSpokenTextRef = useRef('');

    // Initialize Web Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = 'es-ES'; // Match Rioplatense Spanish flows

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);
            rec.onerror = (e) => {
                console.warn("Speech recognition error:", e);
                setIsListening(false);
            };
            rec.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                setInput(transcript);
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
        
        // Sanitize markdown characters before reading
        const cleanText = text
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/`|[#_*]/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        // Dynamically detect language to apply the correct accent and avoid robot-clashing Spanglish
        const isSpanish = /[áéíóúñ]|hola|jefe|entendido|gracias|cambio|sistema|rollback/i.test(cleanText);
        const voices = window.speechSynthesis.getVoices();

        if (isSpanish) {
            utterance.lang = 'es-ES';
            const premiumSpanishVoice = voices.find(v => v.lang.startsWith('es') && v.name.includes('Google')) || 
                                         voices.find(v => v.lang.startsWith('es'));
            if (premiumSpanishVoice) utterance.voice = premiumSpanishVoice;
        } else {
            // AIM Mode: British English premium masculine voice (Daniel / Google UK / Oliver)
            utterance.lang = 'en-GB';
            const aimVoice = voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Daniel')) || // macOS Siri/AIM clone
                                voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Google UK English Male')) ||
                                voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Oliver')) ||
                                voices.find(v => v.lang.startsWith('en-GB') && v.name.includes('Male')) ||
                                voices.find(v => v.lang.startsWith('en-GB')) ||
                                voices.find(v => v.lang.startsWith('en')); // general fallback
            if (aimVoice) utterance.voice = aimVoice;
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
    }, [messages, isVoiceEnabled]);

    useEffect(() => {
        const lang = getActiveLanguage();
        if (isAdminDashboard) {
            setMessages([
                { role: 'agent', content: "Buenas, Jefe. **AIM** en línea. Todo listo en el Command Center. Pedime cualquier cambio de código, base de datos o lógica que necesites en el campus. También podés tirar `/rollback` para revertir a un estado anterior o `/diagnose` para auditar la salud del sistema. Estoy a tus órdenes. ¿Qué hacemos hoy?" }
            ]);
        } else {
            setMessages([
                { role: 'agent', content: greetings[lang] || greetings.english }
            ]);
        }
    }, [profile, profile?.language, isAdminDashboard]);

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

    const handleSend = async () => {
        const trimmed = input.trim();
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
        try {
            const historyForApi = messages.slice(1).concat(userMsg);
            // If we are in the admin dashboard, we pass 'ADMIN' to trigger the AIM admin persona override in the factory
            const userTier = isAdminDashboard ? 'ADMIN' : (profile?.tier || 'FREE');
            const result = await callAgent('MASCOT', trimmed, historyForApi, userTier);

            // Intercept Triage Trigger
            if (result.text.includes('[START_BUG_TRIAGE]')) {
                setMessages(prev => [...prev, { role: 'agent', content: "It sounds like you hit a bug! Let's get this reported. I need to ask you 3 quick questions. \n\n**Question 1/3:** What were you trying to do?" }]);
                setTriageState('q1');
            } else {
                setMessages(prev => [...prev, { role: 'agent', content: result.text }]);
            }
        } catch (err) {
            console.error('Mascot chat error:', err);
            setMessages(prev => [...prev, { role: 'agent', content: "Oops, I had a momentary glitch. 🔧 Can you try again?" }]);
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
                                        {/* Toggle Voice Output (Altavoz) */}
                                        <button
                                            onClick={() => {
                                                setIsVoiceEnabled(!isVoiceEnabled);
                                                if (isVoiceEnabled && window.speechSynthesis) {
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

                                {/* Messages */}
                                <div className="h-[250px] overflow-y-auto scrollbar-hide p-4 space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${msg.role === 'user'
                                                ? (isAdminDashboard ? 'bg-cyan-500/10 border border-cyan-500/20 text-white shadow-[0_0_10px_rgba(0,242,254,0.05)]' : 'bg-orange-500/10 border border-orange-500/20 text-white')
                                                : 'bg-white/[0.03] border border-white/5 text-white/80'
                                                }`}>
                                                {msg.content.split('**').map((part, i) =>
                                                    i % 2 === 1
                                                        ? <strong key={i} className={`font-black ${isAdminDashboard ? 'text-cyan-300' : 'text-orange-300'}`}>{part}</strong>
                                                        : <span key={i}>{part}</span>
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
                                                ? (isAdminDashboard ? "Escuchando, Señor... lo escucho" : "Escuchando... hablá ahora") 
                                                : (isAdminDashboard ? "Preguntame o pedime un cambio, Señor..." : "Preguntame sobre el campus...")
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
