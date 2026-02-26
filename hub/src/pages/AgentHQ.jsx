import { motion, AnimatePresence } from 'framer-motion';
import {
    Map as MapIcon, Mail, FileText, PenTool, Cpu, Users, Wrench, Rocket,
    DollarSign, Award, ChevronLeft, Sparkles, ExternalLink,
    Terminal, Scan, Newspaper, BarChart3, Target, MessageSquare, Gem,
    Search, TrendingUp, Brain, ShieldCheck, Bot, Zap, Lock, Star, Crown, X, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TIER_CONFIG = {
    'FREE': { badge: 'Free', icon: Bot, color: 'text-text-muted', bg: 'bg-white/5', border: 'border-white/10' },
    'PRO': { badge: 'Pro', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    'PLUS': { badge: 'Plus', icon: Crown, color: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/20' }
};
const plusAgents = [
    { name: "SYSTEMS ARCHITECT", role: "The Tech", nationality: "Cybernetic", tier: 'PLUS', description: "Handles infrastructure, technical support, and scalability.", icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", avatar: "https://lh3.googleusercontent.com/d/1Mhs2BA3KKibMtKp0oaTuH6EJ0H0yL-1z" },
    { name: "BEHAVIORAL PROFILER", role: "The Empathy", nationality: "German", tier: 'PLUS', description: "Studies profound customer psychology and behavioral patterns.", icon: Scan, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", avatar: "https://lh3.googleusercontent.com/d/1M6q2RP3Dsibq7ee5Mch9xJ_P23dWR-L-" },
    { name: "SOLUTIONS ENGINEER", role: "The Fixer", nationality: "Japanese", tier: 'PLUS', description: "Resolves technical conflicts, optimizes flows, and enforces QA.", icon: Wrench, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", avatar: "https://lh3.googleusercontent.com/d/1aa64exG3P-qrdcIl2pG-Q05rBROsoO5e" },
    { name: "LAUNCH COMMANDER", role: "The Catalyst", nationality: "Brazilian", tier: 'PLUS', description: "Dictates GTM strategies, launch funnels, and acquisition metrics.", icon: Rocket, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", avatar: "https://lh3.googleusercontent.com/d/1wI7ZdTKWeXUrFVziS5jjVrk2W0o3f6tk" },
    { name: "REVENUE OFFICER", role: "The Growth", nationality: "Singaporean", tier: 'PLUS', description: "Optimizes monetization, ROI, and financial models.", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", avatar: "https://lh3.googleusercontent.com/d/1GAWql7WAVlFqOpuLFOKaPFW2XroL20_w" },
    { name: "BRAND ARCHITECT", role: "The Vision", nationality: "French", tier: 'PLUS', description: "Masters brand positioning, visual identity, and emotional resonance.", icon: Gem, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", avatar: "https://lh3.googleusercontent.com/d/13WF8UslO178npxVS3ZKYl-7pBL8jlyCO" },
];

const proAgents = [
    { name: "STRATEGY DIRECTOR", role: "The Planner", nationality: "Italian", tier: 'PRO', description: "Designs strategic calendars and master growth plans.", icon: MapIcon, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", avatar: "https://lh3.googleusercontent.com/d/1M8XW4N4vhnG4D1ZEzMeMJYU2SLeqoBMY" },
    { name: "COMMUNICATIONS LEAD", role: "The Voice", nationality: "British", tier: 'PRO', description: "Master of public speaking, PR, and persuasive messaging.", icon: Mail, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", avatar: "https://lh3.googleusercontent.com/d/1mDh3YozJXiylbO3QJe8wPRvutJsDNFoc" },
    { name: "INTELLIGENCE ANALYST", role: "The Insight", nationality: "South Korean", tier: 'PRO', description: "Summarizes complex reports and analyzes market data.", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", avatar: "https://lh3.googleusercontent.com/d/155tJ6oucIdfsfOdvit5vi01xN_ua9fv1" },
    { name: "PUBLISHING EDITOR", role: "The Storyteller", nationality: "Egyptian", tier: 'PRO', description: "Handles content structure, curation, and premium writing.", icon: Newspaper, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", avatar: "https://lh3.googleusercontent.com/d/1LzT707qS52irOluEDoFiI0Lh6agHgjHL" },
    { name: "COURSE CREATOR", role: "The Educator", nationality: "Mexican", tier: 'PRO', description: "Handles instructional design and inclusive AI pedagogy.", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", avatar: "https://lh3.googleusercontent.com/d/1AJIL1a2Du47nfTy62vsPBw-3b5-Y1Gyk" },
    { name: "AI PROMPTER", role: "The Wizard", nationality: "Indian", tier: 'PRO', description: "Masters prompt engineering, LLM logic, and optimization.", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", avatar: "https://lh3.googleusercontent.com/d/1A0CWgl5f8dY58Vf2hQcIKzUnOOmiT3X4" },
    { name: "MARKETING PRO", role: "The Engine", nationality: "Spanish", tier: 'PRO', description: "Builds conversion funnels, sales psychology, and virality.", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", avatar: "https://lh3.googleusercontent.com/d/1cx9XGXA4G2sy-UZ0U9V7OmRryXkjtFod" }
];

const freeAgents = [
    { name: "AI PROJECT MANAGER", role: "The Orchestrator", nationality: "Nigerian", tier: 'FREE', description: "Orchestrates tasks, organizes workflows, and guides students.", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", avatar: "https://lh3.googleusercontent.com/d/1qVeSx1suf01TU01h_SGecwfbieBrotw6" },
    { name: "BEHAVIORAL PSYCH", role: "The UX", nationality: "Kenyan", tier: 'FREE', description: "Analyzes cognitive patterns, decision-making, and emotional architecture to build psychologically resonant products.", icon: Bot, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", avatar: "https://lh3.googleusercontent.com/d/1dwtTpaggtlN_a5zEMfrNFiV4889fgzpE" },
    { name: "COMMUNITY BUILDER", role: "The Connect", nationality: "Filipino", tier: 'FREE', description: "Fosters participation, provides warm onboarding and support.", icon: Users, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", avatar: "https://lh3.googleusercontent.com/d/1U3cGohwRtl76_0QfeiiZEkRgPRq9JorK" },
    { name: "QUALITY CHECKER", role: "The Standard", nationality: "Swedish", tier: 'FREE', description: "Reviews excellence rubrics, detects errors, and enforces QA.", icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", avatar: "https://lh3.googleusercontent.com/d/1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c" },
    { name: "SEO MASTER", role: "The Visibility", nationality: "Vietnamese", tier: 'FREE', description: "Optimizes organic keyword positioning and algorithms.", icon: Search, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", avatar: "https://lh3.googleusercontent.com/d/1mUtk1oaHnHMoPJdXERRiW_aftebtbu0B" },
    { name: "IDEA CLONER", role: "The Blueprint", nationality: "Russian", tier: 'FREE', description: "Reverse-engineers proven SaaS models into actionable, cloneable blueprints for new niches.", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", avatar: "/hub/idea_cloner_avatar.png" },
];

const AgentHQ = () => {
    const navigate = useNavigate();
    const [userTier, setUserTier] = useState('FREE');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedTier, setSelectedTier] = useState(null);
    const agentAvatar = "https://lh3.googleusercontent.com/d/1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c";

    useEffect(() => {
        const fetchUserTier = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier')
                    .eq('id', user.id)
                    .single();
                if (profile?.tier) setUserTier(profile.tier.toUpperCase());
            }
        };
        fetchUserTier();
    }, []);

    const tiers = ['FREE', 'PRO', 'PLUS'];
    const canAccess = (agentTier) => tiers.indexOf(userTier) >= tiers.indexOf(agentTier);

    const handleActivate = (agent) => {
        if (canAccess(agent.tier)) {
            navigate(`/hub/lab/${agent.name.toLowerCase().replace(/\s+/g, '-')}`);
        } else {
            setSelectedTier(agent.tier);
            setShowUpgradeModal(true);
        }
    };

    const AgentCard = ({ agent, idx, isTactical = false }) => {
        const isLocked = !canAccess(agent.tier);
        const tierCfg = TIER_CONFIG[agent.tier];

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${agent.color ? agent.color.replace('text-', 'rgba(').replace('-400', ',0.2)') : 'rgba(255,255,255,0.1)'}` }}
                onClick={() => handleActivate(agent)}
                className={`bg-gray-800 rounded-3xl overflow-hidden cursor-pointer relative group border-t-2 ${agent.border || 'border-transparent'} transition-all duration-300 shadow-xl flex flex-col`}
            >
                {/* Image Section */}
                <div className="w-full h-48 relative overflow-hidden bg-gray-900 border-b border-white/10 shrink-0">
                    {agent.avatar ? (
                        <img
                            src={agent.avatar}
                            alt={agent.name}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale opacity-40' : ''}`}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-white/5">
                            <agent.icon className={`h-16 w-16 ${agent.color} opacity-20`} />
                        </div>
                    )}

                    {/* Dark gradient to ensure text readability if we overlay anything, but we keep text below */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent"></div>

                    {/* Floating Tier Badge */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border ${isLocked ? 'bg-gray-900/80 text-gray-400 border-gray-700' : `${tierCfg.bg} ${tierCfg.color} ${tierCfg.border}`}`}>
                        {isLocked ? <Lock className="h-3 w-3" /> : <tierCfg.icon className="h-3 w-3" />}
                        {tierCfg.badge}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col items-center text-center flex-grow relative z-10 bg-gray-800">
                    <h3 className="text-xl font-black mb-1 italic uppercase tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all leading-none">
                        {agent.name}
                    </h3>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${agent.color} italic mb-3 flex items-center justify-center gap-2`}>
                        <agent.icon className="h-3 w-3" />
                        {agent.role}
                    </div>
                    {agent.nationality && (
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic mb-3">
                            ORIGIN: {agent.nationality}
                        </div>
                    )}

                    <p className="text-xs text-text-muted leading-relaxed mb-6 italic flex-grow">
                        {agent.description}
                    </p>

                    <div className="pt-4 border-t border-white/5 w-full flex items-center justify-between mt-auto">
                        {(() => {
                            if (agent.tier === 'PLUS') return (
                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3" /> Gemini 2.5 Pro • Max Compute
                                </span>
                            );
                            if (agent.tier === 'PRO') return (
                                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                    <Zap className="h-3 w-3" /> Gemini 2.5 Flash • Advanced Context
                                </span>
                            );
                            return (
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                    <Cpu className="h-3 w-3" /> Gemini 2.5 Flash • Standard Logic
                                </span>
                            );
                        })()}
                        <button
                            className={`flex items-center gap-2 text-[10px] font-black ${isLocked ? 'text-gray-500' : agent.color} uppercase tracking-widest italic hover:underline decoration-current underline-offset-4`}
                        >
                            {isLocked ? 'Unlock Tier' : 'Activate'} <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="w-full h-full py-12 px-6 lg:px-8 bg-[#070A12] text-white relative">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 mb-6 font-black tracking-widest text-accent-secondary uppercase italic text-xs">
                    <Sparkles className="h-4 w-4" />
                    OfficeAIM Neural Network • {userTier} ACCESS
                </div>
                <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight italic">
                    Agent <span className="title-gradient">Command Deck</span>
                </h1>
                <p className="text-text-muted text-xl max-w-2xl mx-auto leading-relaxed italic font-medium">
                    Deploy your specialized AI board of directors. Three tiers of elite intelligence, ready for assignment.
                </p>
            </motion.div>

            {/* SECTION 1: STANDARD AGENTS OF OFFICEAIM (FREE) */}
            <div className="mb-20">
                <div className="flex flex-col items-center gap-3 mb-10 border-b border-white/5 pb-6 text-center">
                    <div className="h-10 w-10 bg-emerald-400/20 rounded-lg flex items-center justify-center border border-emerald-400/30 mb-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">Standard Agents of OfficeAIM</h2>
                        <p className="text-[10px] text-emerald-400 italic uppercase tracking-widest font-bold">Free Tier • Foundation & Support Units</p>
                    </div>
                </div>

                {/* All Free Agents — uniform 2-col grid, same size as Gema */}
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                        {freeAgents.map((agent, idx) => <AgentCard key={agent.name} agent={agent} idx={idx} />)}
                    </div>
                </div>
            </div>

            {/* SECTION 2: STRATEGIC CORE (PRO) */}
            <div className="mb-20">
                <div className="flex flex-col items-center gap-3 mb-10 border-b border-white/5 pb-6 text-center">
                    <div className="h-10 w-10 bg-amber-400/20 rounded-lg flex items-center justify-center border border-amber-400/30 mb-2">
                        <Star className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">Strategic Core</h2>
                        <p className="text-[10px] text-amber-400 italic uppercase tracking-widest font-bold">Pro Tier • Advanced Strategy & Creation</p>
                    </div>
                </div>

                {/* All Pro Agents — uniform 2-col grid, same size as Gema */}
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                        {proAgents.map((agent, idx) => <AgentCard key={agent.name} agent={agent} idx={idx} />)}
                    </div>
                </div>
            </div>

            {/* SECTION 3: THE EXECUTIVE BOARD (PLUS) */}
            <div className="mb-20">
                <div className="flex flex-col items-center gap-3 mb-10 border-b border-white/5 pb-6 text-center">
                    <div className="h-10 w-10 bg-accent-secondary/20 rounded-lg flex items-center justify-center border border-accent-secondary/30 mb-2">
                        <Crown className="h-5 w-5 text-accent-secondary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">The Executive Board</h2>
                        <p className="text-[10px] text-accent-secondary italic uppercase tracking-widest font-bold">Plus Tier • Elite Infrastructure & Systems</p>
                    </div>
                </div>

                {/* All Plus Agents — uniform 2-col grid, same size as Gema */}
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                        {plusAgents.map((agent, idx) => <AgentCard key={agent.name} agent={agent} idx={idx} />)}
                    </div>
                </div>
            </div>



            {/* UPGRADE MODAL */}
            <AnimatePresence>
                {showUpgradeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-black/80"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card max-w-md w-full p-10 relative overflow-hidden text-center border-accent-secondary/30"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/20 blur-[60px] rounded-full -mr-16 -mt-16"></div>

                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="h-20 w-20 bg-accent-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-secondary/20 shadow-2xl">
                                <Lock className="h-10 w-10 text-accent-secondary" />
                            </div>

                            <h2 className="text-3xl font-black italic mb-4 uppercase tracking-tight">Access Restricted</h2>
                            <p className="text-text-muted italic mb-8 leading-relaxed">
                                The <span className="text-white font-bold">{selectedTier}</span> intelligence tier is required to deploy this specialist.
                                Upgrade your neural bandwidth to unlock deep strategic capabilities.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button className="w-full py-5 bg-accent-secondary text-white font-black uppercase tracking-widest text-[12px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent-secondary/20 italic">
                                    Upgrade to {selectedTier} Access
                                </button>
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all italic"
                                >
                                    Review Board of Directors
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgentHQ;
