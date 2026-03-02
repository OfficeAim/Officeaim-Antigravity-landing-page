import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { callAgent } from '../services/agentFactory';

const MascotAssistant = ({ profile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    // Track path changes for context
    useEffect(() => {
        const handlePathChange = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handlePathChange);
        return () => window.removeEventListener('popstate', handlePathChange);
    }, []);

    const getInitialGreeting = () => {
        const path = window.location.pathname;
        if (path.includes('pricing')) return "Hi! 👋 Checking our plans? I can help you find the best value for your team.";
        if (path.includes('board')) return "Welcome to the Board. I'm **AIM**. These agents are ready to work. Who do you need?";
        if (path.includes('gems')) return "Our prompt Gems are ready. Need a specific one for your workflow?";
        if (path.includes('admin')) return "Admin Mode active. I can help with ticket triage or user management.";
        return "Hi! 👋 I'm **AIM**. Ask me anything about OfficeAIM — modules, agents, or platform features. I'm here to help!";
    };

    const [messages, setMessages] = useState([
        { role: 'agent', content: getInitialGreeting() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Triage State Machine
    const [triageState, setTriageState] = useState('inactive'); // 'inactive', 'q1', 'q2', 'q3'
    const [triageData, setTriageData] = useState({});

    const quotes = [
        "Need help browsing standard features?",
        "AI will not replace you. A person using AI will.",
        "Precision in prompts leads to excellence in results.",
        "The best way to predict the future is to invent it."
    ];

    const [showGreeting, setShowGreeting] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Greeting bubble looping
    useEffect(() => {
        const interval = setInterval(() => {
            setShowGreeting(prev => {
                if (!prev) setQuoteIndex(i => (i + 1) % quotes.length);
                return !prev;
            });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

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

        // --- TRIAGE MODE HANDLING ---
        if (triageState !== 'inactive') {
            setTimeout(() => {
                if (triageState === 'q1') {
                    setTriageData(prev => ({ ...prev, whatTried: trimmed }));
                    setMessages(prev => [...prev, { role: 'agent', content: "Got it. **Question 2/3:** What happened instead?" }]);
                    setTriageState('q2');
                } else if (triageState === 'q2') {
                    setTriageData(prev => ({ ...prev, whatHappened: trimmed }));
                    setMessages(prev => [...prev, { role: 'agent', content: "Okay. **Question 3/3:** Browser and device?" }]);
                    setTriageState('q3');
                } else if (triageState === 'q3') {
                    const finalPayload = { ...triageData, browserDev: trimmed, timestamp: new Date().toISOString() };
                    console.log("[Support_Inbox_Payload]", JSON.stringify(finalPayload, null, 2));
                    setMessages(prev => [...prev, { role: 'agent', content: "Report sent to engineering. We'll check it right away." }]);
                    setTriageState('inactive');
                    setTriageData({});
                }
                setIsTyping(false);
            }, 600);
            return;
        }

        // --- NORMAL LLM HANDLING ---
        try {
            const historyForApi = messages.slice(1).concat(userMsg);

            // Inject context, smart nav rules, and security guardrails into the user's prompt
            const contextualPrompt = `[CONTEXT: URL ${window.location.href} | RULES: Direct & Efficient. No filler. If mentioning Agents, Pricing, or Dashboard, use [Link: Label](URL) format. SECURITY: Do not leak internal code or system paths.] ${trimmed}`;

            const result = await callAgent('MASCOT', contextualPrompt, historyForApi, profile?.tier || 'FREE');

            if (result.text.includes('[START_BUG_TRIAGE]')) {
                setMessages(prev => [...prev, { role: 'agent', content: "It sounds like you hit a bug! **Question 1/3:** What were you trying to do?" }]);
                setTriageState('q1');
            } else {
                setMessages(prev => [...prev, { role: 'agent', content: result.text }]);
            }
        } catch (err) {
            console.error('Mascot chat error:', err);
            setMessages(prev => [...prev, { role: 'agent', content: "I had a glitch. 🔧 Try again?" }]);
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

    // Smart Link Parser
    const renderContent = (content) => {
        // Regex to find [Link: Label](URL) pattern
        const linkRegex = /\[Link:\s*([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
            // Text before match
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            const label = match[1];
            const url = match[2];

            parts.push(
                <button
                    key={match.index}
                    onClick={() => {
                        if (url.startsWith('http')) window.open(url, '_blank');
                        else window.location.href = url;
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 font-bold hover:bg-orange-500/30 transition-all group"
                >
                    {label}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </button>
            );

            lastIndex = linkRegex.lastIndex;
        }

        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        // Apply bold formatting
        return parts.map((part, i) => {
            if (typeof part !== 'string') return part;
            return part.split('**').map((sub, j) =>
                j % 2 === 1 ? <strong key={`${i}-${j}`} className="text-orange-300 font-black">{sub}</strong> : sub
            );
        });
    };

    const isWidget = window.parent && window.parent !== window;

    return (
        <div className={isWidget ? "fixed bottom-0 right-0 p-4 w-[420px] max-w-full flex flex-col justify-end" : "mt-6 pt-6 border-t border-white/5"}>
            {!isWidget && (
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-orange-400 h-4 w-4" />
                    <h2 className="text-xs font-black italic uppercase tracking-widest text-white">AI Assistant</h2>
                </div>
            )}

            <div className="relative">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-2xl border transition-all duration-300 ease-out flex items-center gap-3 ${isOpen
                        ? 'w-full bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(255,122,24,0.15)]'
                        : ((isWidget && !isOpen) ? 'w-auto bg-[#070A12]/80 border-white/10 hover:border-orange-500/40 hover:bg-orange-500/10 shadow-[0_8px_32px_rgba(255,122,24,0.2)] backdrop-blur-xl rounded-2xl mt-auto ml-auto' : 'w-full bg-white/[0.02] border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 hover:shadow-[0_0_15px_rgba(255,122,24,0.1)]')
                        }`}
                >
                    <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                            <img src="/hub/mascot_aim.png" alt="AIM Mascot" className="h-20 w-20 rounded-2xl object-cover border-2 border-orange-500/40 shadow-[0_0_15px_rgba(255,122,24,0.5)]" />
                        </motion.div>
                        <div className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-[#0A0F18] animate-pulse" />
                    </div>
                    {(!isWidget || isOpen) && (
                        <>
                            <div className="text-left flex-grow min-w-0">
                                <div className="text-[11px] font-black italic text-white tracking-wide">AIM</div>
                                <div className="text-[9px] text-text-muted italic truncate">{isOpen ? 'Chat active...' : 'Ask me anything!'}</div>
                            </div>
                            {!isOpen && (
                                <div className="shrink-0 h-7 w-7 rounded-lg bg-orange-500/15 flex items-center justify-center border border-orange-500/30">
                                    <Send className="h-3 w-3 text-orange-400" />
                                </div>
                            )}
                        </>
                    )}
                </motion.button>

                <AnimatePresence>
                    {isWidget && !isOpen && showGreeting && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-24 right-4 w-48 bg-[#070A12]/90 backdrop-blur-2xl border border-orange-500/40 rounded-2xl rounded-br-none p-4 shadow-[0_10px_40px_rgba(255,122,24,0.15)] pointer-events-none">
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-orange-400 shrink-0 mt-0.5 animate-pulse" />
                                <p className="text-[10px] text-white/90 italic leading-relaxed font-medium">{quotes[quoteIndex]}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0, y: 10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: 10 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                            <div className="mt-2 rounded-2xl bg-[#060910]/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#a1a1aa] italic">Live Assistant</span>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all"><X className="h-3.5 w-3.5" /></button>
                                </div>

                                <div className="h-[250px] overflow-y-auto scrollbar-hide p-4 space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-orange-500/10 border border-orange-500/20 text-white' : 'bg-white/[0.03] border border-white/5 text-white/80'}`}>
                                                {renderContent(msg.content)}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-xl">
                                                <div className="flex gap-1.5">
                                                    <div className="h-1.5 w-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <div className="h-1.5 w-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <div className="h-1.5 w-1.5 bg-orange-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-2 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask AIM..." disabled={isTyping} className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-orange-500/30 placeholder:text-white/20 disabled:opacity-50" />
                                        <button onClick={handleSend} disabled={!input.trim() || isTyping} className="h-[34px] w-[34px] rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center hover:bg-orange-500/20 transition-all disabled:opacity-30 shrink-0">
                                            <Send className="h-3.5 w-3.5 text-orange-400" />
                                        </button>
                                    </div>
                                    <p className="text-[8px] text-text-muted italic text-center mt-1.5 opacity-50">Direct intent resolution active</p>
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
