import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { callAgent } from '../services/agentFactory';

const MascotAssistant = ({ profile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'agent', content: "Hi! 👋 I'm **AIM**, your platform guide. Ask me anything about OfficeAIM — modules, agents, how things work... I'm here to help!" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Triage State Machine
    const [triageState, setTriageState] = useState('inactive'); // 'inactive', 'q1', 'q2', 'q3'
    const [triageData, setTriageData] = useState({});

    const quotes = [
        "If you have any questions, you can use this interface.",
        "AI will not replace you. A person using AI will.",
        "The real risk with AI isn't malice, but competence.",
        "We are entering an era where magic becomes technology.",
        "Intelligence is the ability to adapt to change.",
        "The best way to predict the future is to invent it."
    ];

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
            const result = await callAgent('MASCOT', trimmed, historyForApi, profile?.tier || 'FREE');

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
                    <Sparkles className="text-orange-400 h-4 w-4" />
                    <h2 className="text-xs font-black italic uppercase tracking-widest text-white">AI Assistant</h2>
                </div>
            )}

            {/* Mascot Avatar Button */}
            <div className="relative">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${isOpen
                        ? 'w-full bg-orange-500/10 border-orange-500/30'
                        : ((isWidget && !isOpen) ? 'w-auto bg-white/[0.02] border-white/10 hover:border-orange-500/20 hover:bg-orange-500/5 shadow-2xl backdrop-blur-md rounded-2xl mt-auto ml-auto' : 'w-full bg-white/[0.02] border-white/10 hover:border-orange-500/20 hover:bg-orange-500/5')
                        }`}
                >
                    <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <img
                                src="/hub/mascot_aim.png"
                                alt="AIM Mascot"
                                className="h-20 w-20 rounded-2xl object-cover border-2 border-orange-500/50 shadow-[0_0_15px_rgba(255,122,24,0.4)] hover:shadow-[0_0_25px_rgba(255,122,24,0.8)] transition-all"
                            />
                        </motion.div>
                        <div className="absolute bottom-1 right-1 h-4 w-4 bg-emerald-400 rounded-full border-2 border-[#0A0F18] animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                    </div>
                    {(!isWidget || isOpen) && (
                        <>
                            <div className="text-left flex-grow min-w-0">
                                <div className="text-[11px] font-black italic text-white">AIM</div>
                                <div className="text-[9px] text-text-muted italic truncate">
                                    {isOpen ? 'Chat active...' : 'Ask me anything!'}
                                </div>
                            </div>
                            {!isOpen && (
                                <div className="shrink-0 h-7 w-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                    <Send className="h-3 w-3 text-orange-400" />
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
                            className="absolute bottom-24 right-4 w-48 bg-brand-card backdrop-blur-xl border border-orange-500/30 rounded-2xl rounded-br-none p-3 shadow-2xl pointer-events-none"
                        >
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-white italic leading-tight font-medium">
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
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 rounded-2xl bg-[#060910] border border-white/10 overflow-hidden">
                                {/* Chat Header */}
                                <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted italic">Live Chat</span>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="h-5 w-5 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                    >
                                        <X className="h-3 w-3 text-text-muted" />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="h-[240px] overflow-y-auto scrollbar-hide p-3 space-y-3">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${msg.role === 'user'
                                                ? 'bg-orange-500/10 border border-orange-500/20 text-white'
                                                : 'bg-white/[0.03] border border-white/5 text-white/80'
                                                }`}>
                                                {msg.content.split('**').map((part, i) =>
                                                    i % 2 === 1
                                                        ? <strong key={i} className="text-orange-300 font-black">{part}</strong>
                                                        : <span key={i}>{part}</span>
                                                )}
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

                                {/* Input */}
                                <div className="p-2 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Ask AIM..."
                                            disabled={isTyping}
                                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-orange-500/30 placeholder:text-white/20 disabled:opacity-50"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isTyping}
                                            className="h-[34px] w-[34px] rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center hover:bg-orange-500/20 transition-all disabled:opacity-30 shrink-0"
                                        >
                                            <Send className="h-3.5 w-3.5 text-orange-400" />
                                        </button>
                                    </div>
                                    <p className="text-[8px] text-text-muted italic text-center mt-1.5 opacity-50">Messages are ephemeral · Not stored</p>
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
