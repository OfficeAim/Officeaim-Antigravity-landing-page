import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, ChevronLeft,
    Terminal, Zap, Target, Brain, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { callProjectManagerAgent } from '../services/aiProjectManager';

const AgentTestConsole = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Systems Online. AI Project Manager 'Gema' initialized. Ready to coordinate the OfficeAIM roadmap.",
            agent: 'System'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await callProjectManagerAgent(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Error: Failed to connect to the neural network. Please check your API key and connection.",
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070A12] text-white font-plus-jakarta flex flex-col">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#070A12]/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/hub/agents')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black italic uppercase tracking-tight">Agent <span className="text-cyan-400">Test Console</span></h1>
                                <div className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">V2.0 ALPHA</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">Direct Neural Link: Project Manager Gema</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Gemini 2.0 Flash</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center border shadow-lg ${msg.role === 'user'
                                        ? 'bg-accent-secondary/20 border-accent-secondary/20 text-accent-secondary'
                                        : msg.isError
                                            ? 'bg-red-500/20 border-red-500/20 text-red-500'
                                            : 'bg-cyan-400/20 border-cyan-400/20 text-cyan-400'
                                    }`}>
                                    {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                </div>

                                <div className={`max-w-[80%] glass-card p-6 ${msg.role === 'user' ? 'bg-white/[0.03]' : 'bg-white/[0.01]'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-accent-secondary' : 'text-cyan-400'
                                            }`}>
                                            {msg.role === 'user' ? 'Founder' : 'Project Manager Gema'}
                                        </span>
                                        <span className="text-[8px] text-white/20 font-bold uppercase">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-medium">
                                        {msg.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-4"
                        >
                            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-cyan-400/20 border border-cyan-400/20 text-cyan-400 flex items-center justify-center animate-pulse">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="glass-card p-6 bg-white/[0.01] flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/50 animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/50 animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400/50 animate-bounce"></div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/50 italic">Processing Neural Data...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="p-6 bg-[#070A12]/80 backdrop-blur-xl border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSend} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Send message to Gema..."
                                className="w-full bg-[#0D111A] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/20 font-medium italic"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-3 p-2 bg-cyan-400 text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                            <Zap className="h-3 w-3" /> Sequential Delegation Mode
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                            <Target className="h-3 w-3" /> Market Validation Focus
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/20 italic">
                            <Sparkles className="h-3 w-3" /> Gemini 2.0 Engine
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AgentTestConsole;
