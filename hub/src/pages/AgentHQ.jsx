import { motion } from 'framer-motion';
import {
    Map as MapIcon, Mail, FileText, PenTool, Cpu, Users, Wrench, Rocket,
    DollarSign, Award, ChevronLeft, Sparkles, ExternalLink,
    Terminal, Scan, Newspaper, BarChart3, Target, MessageSquare, Gem,
    Search, TrendingUp, Brain, ShieldCheck, Bot, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const eliteAgents = [
    {
        name: "STRATEGY DIRECTOR",
        role: "The Planner",
        description: "Designs strategic calendars for social media and digital marketing campaigns.",
        icon: MapIcon,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        name: "COMMUNICATIONS LEAD",
        role: "The Voice",
        description: "Architects custom emails, direct communication, and persuasive messaging.",
        icon: Mail,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
    },
    {
        name: "INTELLIGENCE ANALYST",
        role: "The Insight",
        description: "Simplifies complex reports into executable intelligence briefings.",
        icon: BarChart3,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        name: "PUBLISHING EDITOR",
        role: "The Storyteller",
        description: "Transforms raw links and research into premium articles.",
        icon: Newspaper,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20"
    },
    {
        name: "SYSTEMS ARCHITECT",
        role: "The Tech",
        description: "Handles technical infrastructure, incident resolution, and support logic.",
        icon: Cpu,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20"
    },
    {
        name: "BEHAVIORAL PROFILER",
        role: "The Empathy",
        description: "Designs detailed profiles of your ideal customers through psychology.",
        icon: Scan,
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20"
    },
    {
        name: "SOLUTIONS ENGINEER",
        role: "The Fixer",
        description: "Identifies and analyzes customer friction points to improve product fit.",
        icon: Wrench,
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20"
    },
    {
        name: "LAUNCH COMMANDER",
        role: "The Catalyst",
        description: "Designs GTM plans, product positioning, and market entry strategies.",
        icon: Rocket,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20"
    },
    {
        name: "REVENUE OFFICER",
        role: "The Growth",
        description: "Optimizes pricing models and monetization strategies for max revenue.",
        icon: DollarSign,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    },
    {
        name: "BRAND ARCHITECT",
        role: "The Vision",
        description: "Defines unique value propositions and brand positioning strategies.",
        icon: Gem,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20"
    }
];

const tacticalAgents = [
    {
        name: "AI Project Manager",
        role: "The Orchestrator",
        description: "Manages tasks and keeps vision on track.",
        icon: Target,
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    {
        name: "Course Creator",
        role: "The Educator",
        description: "Designs practical, anxiety-reducing AI courses.",
        icon: Brain,
        color: "text-purple-400",
        bg: "bg-purple-400/10"
    },
    {
        name: "AI Prompter",
        role: "The Wizard",
        description: "Crafts optimized, high-performance prompts.",
        icon: Sparkles,
        color: "text-amber-400",
        bg: "bg-amber-400/10"
    },
    {
        name: "Marketing Pro",
        role: "The Engine",
        description: "Develops conversion-focused strategies.",
        icon: TrendingUp,
        color: "text-green-400",
        bg: "bg-green-400/10"
    },
    {
        name: "Community Builder",
        role: "The Connect",
        description: "Fosters a supportive, engaged environment.",
        icon: Users,
        color: "text-pink-400",
        bg: "bg-pink-400/10"
    },
    {
        name: "Quality Checker",
        role: "The Standard",
        description: "Ensures all content meets excellence rubric.",
        icon: ShieldCheck,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10"
    },
    {
        name: "SEO Master",
        role: "The Visibility",
        description: "Optimizes content for organic search dominance.",
        icon: Search,
        color: "text-orange-400",
        bg: "bg-orange-400/10"
    },
    {
        name: "Behavioral Psych",
        role: "The UX",
        description: "Optimizes engagement using cognitive principles.",
        icon: Bot,
        color: "text-indigo-400",
        bg: "bg-indigo-400/10"
    }
];

const AgentHQ = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 bg-[#070A12] min-h-screen text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 text-center"
            >
                <button
                    onClick={() => navigate('/hub/dashboard')}
                    className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all italic mx-auto group"
                >
                    <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 mb-6">
                    <Sparkles className="h-4 w-4 text-accent-secondary" />
                    <span className="text-xs font-black tracking-widest text-accent-secondary uppercase italic">OfficeAIM Neural Network</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight italic">
                    Agent <span className="title-gradient">Command Deck</span>
                </h1>
                <p className="text-text-muted text-xl max-w-2xl mx-auto leading-relaxed italic font-medium">
                    Deploy your specialized AI board of directors. Two tears of elite intelligence, ready for assignment.
                </p>
            </motion.div>

            {/* SECTION 1: THE EXECUTIVE BOARD (ELITE 10) */}
            <div className="mb-20">
                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                    <div className="h-10 w-10 bg-accent-secondary/20 rounded-lg flex items-center justify-center border border-accent-secondary/20">
                        <Award className="h-5 w-5 text-accent-secondary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight text-white">The Executive Board</h2>
                        <p className="text-xs text-text-muted italic uppercase tracking-widest">Strategic Direction & High-Level Ops</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {eliteAgents.map((agent, idx) => (
                        <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                            className={`glass-card p-0 group relative overflow-hidden bg-white/[0.01] border ${agent.border} hover:border-opacity-50 transition-colors cursor-pointer`}
                        >
                            {/* Background Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${agent.bg} blur-[60px] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 opacity-50`}></div>

                            <div className="p-8 relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`h-12 w-12 rounded-xl ${agent.bg} ${agent.color} flex items-center justify-center border ${agent.border} shadow-lg group-hover:scale-110 transition-transform`}>
                                        <agent.icon className="h-6 w-6" />
                                    </div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${agent.color} italic px-2 py-1 rounded-md bg-white/[0.03] border border-white/5`}>
                                        {agent.role}
                                    </div>
                                </div>

                                <h3 className="text-lg font-black mb-2 italic uppercase tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                                    {agent.name}
                                </h3>

                                <p className="text-xs text-text-muted leading-relaxed mb-8 italic min-h-[48px]">
                                    {agent.description}
                                </p>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest italic opacity-50 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        OfficeAIM V2
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/hub/lab/${agent.name.toLowerCase().replace(/\s+/g, '-')}`);
                                        }}
                                        className={`flex items-center gap-2 text-[10px] font-black ${agent.color} uppercase tracking-widest italic hover:underline decoration-current underline-offset-4`}
                                    >
                                        Activate <ExternalLink className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* SECTION 2: TACTICAL OPS (ORIGINAL 8) */}
            <div>
                <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                    <div className="h-10 w-10 bg-accent-primary/20 rounded-lg flex items-center justify-center border border-accent-primary/20">
                        <Zap className="h-5 w-5 text-accent-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic uppercase tracking-tight text-white">Tactical Operations</h2>
                        <p className="text-xs text-text-muted italic uppercase tracking-widest">Specialized Task Execution Unit</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tacticalAgents.map((agent, idx) => (
                        <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-6 group relative overflow-hidden bg-white/[0.01] border-white/5 hover:border-white/10"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-lg ${agent.bg} ${agent.color}`}>
                                    <agent.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black italic uppercase tracking-tight text-white">{agent.name}</h3>
                                    <div className={`text-[9px] font-bold uppercase tracking-widest ${agent.color} italic`}>{agent.role}</div>
                                </div>
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed mb-4 italic">
                                {agent.description}
                            </p>
                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <span className="text-[8px] font-black uppercase tracking-widest text-text-muted italic">V1.0 Stable</span>
                                <ExternalLink className="h-3 w-3 text-white/20 group-hover:text-white transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentHQ;
