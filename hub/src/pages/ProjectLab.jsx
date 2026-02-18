import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
    ChevronLeft, Send, Sparkles, Bot, Save, Play,
    Map as MapIcon, Mail, FileText, PenTool, Cpu,
    Users, Wrench, Rocket, DollarSign, Gem,
    Target, Brain, Search, TrendingUp, ShieldCheck
} from 'lucide-react';

// Map textual IDs to Icons and Colors (Shared with AgentHQ)
const AGENT_CONFIG = {
    'strategy-director': { name: "Strategy Director", icon: MapIcon, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    'communications-lead': { name: "Communications Lead", icon: Mail, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    'intelligence-analyst': { name: "Intelligence Analyst", icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    'publishing-editor': { name: "Publishing Editor", icon: PenTool, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    'systems-architect': { name: "Systems Architect", icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    'behavioral-profiler': { name: "Behavioral Profiler", icon: Users, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    'solutions-engineer': { name: "Solutions Engineer", icon: Wrench, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    'launch-commander': { name: "Launch Commander", icon: Rocket, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    'revenue-officer': { name: "Revenue Officer", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    'brand-architect': { name: "Brand Architect", icon: Gem, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    // Defaults for others
    'default': { name: "AI Agent", icon: Bot, color: "text-white", bg: "bg-white/10", border: "border-white/20" }
};

const ProjectLab = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [user, setUser] = useState(null);

    // Get Agent Config
    const agent = AGENT_CONFIG[agentId] || AGENT_CONFIG['default'];

    useEffect(() => {
        // Get user for saving
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    const handleExecute = async () => {
        if (!input.trim() || !user) return;
        setIsProcessing(true);

        try {
            // 1. Save the "Draft" Project to Supabase
            const { data, error } = await supabase
                .from('student_projects')
                .insert({
                    user_id: user.id,
                    agent_role: agent.name,
                    project_title: projectTitle || `New ${agent.name} Project`,
                    user_input: input,
                    status: 'processing'
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Call n8n Webhook for Real AI Processing
            const N8N_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

            if (!N8N_URL) {
                alert("n8n Webhook URL not configured in .env!");
                setIsProcessing(false);
                return;
            }

            try {
                const response = await fetch(N8N_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId: data.id,
                        userId: user.id,
                        agentRole: agent.name,
                        projectTitle: projectTitle || `New ${agent.name} Project`,
                        userInput: input
                    })
                });

                if (!response.ok) throw new Error('Failed to connect to n8n Agent');

                const responseData = await response.json();
                const aiOutput = responseData.output || responseData.message || "Agent processed the request but returned no text.";

                // 3. Update Project with Real AI Output
                await supabase
                    .from('student_projects')
                    .update({
                        agent_output: aiOutput,
                        status: 'completed'
                    })
                    .eq('id', data.id);

                setResult(aiOutput);

            } catch (n8nError) {
                console.error("n8n Connection Error:", n8nError);
                // Fallback simulation (so demo doesn't break if n8n is offline)
                const fallbackOutput = `[CONNECTION ERROR: n8n Offline]\n\nHowever, I recorded your input.\n\nSimulated Analysis based on: "${input.slice(0, 50)}..."\n1. Concept Validated.\n2. Proceed with caution.\n(Please start your n8n server to get real AI responses!)`;

                await supabase
                    .from('student_projects')
                    .update({
                        agent_output: fallbackOutput,
                        status: 'error'
                    })
                    .eq('id', data.id);

                setResult(fallbackOutput);
            }

            setIsProcessing(false);

        } catch (err) {
            console.error("Project Error:", err);
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8 bg-[#070A12] min-h-screen text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/hub/agents')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all italic group"
                >
                    <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Exit Lab
                </button>
                <div className={`p-2 rounded-lg ${agent.bg} ${agent.border} border`}>
                    <agent.icon className={`h-6 w-6 ${agent.color}`} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                {/* LEFT: Agent Persona & Stats */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`glass-card p-8 border ${agent.border} relative overflow-hidden`}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${agent.bg} blur-[60px] rounded-full -mr-10 -mt-10`}></div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tight mb-2">{agent.name}</h1>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${agent.color} mb-6 italic`}>Active Session</p>
                        <p className="text-sm text-text-muted leading-relaxed italic">
                            "I am ready to analyze your inputs. Please provide the raw data or innovative concept you wish to develop. I will structure it into an actionable plan."
                        </p>
                    </motion.div>

                    <div className="glass-card p-6 border-white/5 bg-white/[0.01]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 italic">Capabilities</h3>
                        <ul className="space-y-3">
                            {['Deep Analysis', 'Strategic Planning', 'Risk Assessment'].map(skill => (
                                <li key={skill} className="flex items-center gap-3 text-xs font-bold italic text-white/70">
                                    <div className={`h-1.5 w-1.5 rounded-full ${agent.bg.replace('/10', '')}`}></div>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RIGHT: Workspace */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Input Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-1 flex-grow flex flex-col border-white/10"
                    >
                        <div className="bg-white/[0.02] p-4 border-b border-white/5 flex items-center justify-between">
                            <input
                                type="text"
                                placeholder="Name your project..."
                                value={projectTitle}
                                onChange={(e) => setProjectTitle(e.target.value)}
                                className="bg-transparent text-sm font-bold italic text-white placeholder:text-white/20 outline-none w-full"
                            />
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${input.length > 10 ? 'bg-green-500' : 'bg-white/20'}`}></span>
                                Input Status
                            </div>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Describe your idea to the ${agent.name}...\nExample: "I want to launch a SaaS for dog walkers in Chicago using AI to optimize routes..."`}
                            className="w-full h-64 bg-transparent p-6 text-white/90 placeholder:text-white/20 outline-none resize-none font-medium leading-relaxed"
                        ></textarea>
                        <div className="p-4 border-t border-white/5 flex justify-end">
                            <button
                                onClick={handleExecute}
                                disabled={isProcessing || !input.trim()}
                                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs italic transition-all shadow-lg ${isProcessing ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:bg-accent-secondary hover:text-white active:scale-95'}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 fill-current" /> Initialize Agent
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Output Area */}
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass-card p-8 border ${agent.border} bg-[#0A0F18]`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Sparkles className={`h-5 w-5 ${agent.color}`} />
                                <h3 className="text-sm font-black uppercase tracking-widest italic text-white">Agent Output</h3>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none text-white/80 font-medium italic whitespace-pre-line">
                                {result}
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button className="px-6 py-3 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all italic flex items-center gap-2">
                                    <Save className="h-3 w-3" /> Save to Vault
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectLab;
