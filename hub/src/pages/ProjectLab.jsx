import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
    ChevronLeft, Send, Bot, Save, Loader2,
    Map as MapIcon, Mail, FileText, PenTool, Cpu,
    Users, Wrench, Rocket, DollarSign, Gem,
    Target, Brain, Search, TrendingUp, ShieldCheck, Zap,
    MessageSquare, Lock, Crown, Star, Sparkles, FolderArchive, Download, Lightbulb, Copy, Check
} from 'lucide-react';
import { callAgent } from '../services/agentFactory';
import toast from 'react-hot-toast';

const AGENT_CONFIG = {
    'strategy-director': { name: "Strategy Director", role: "The Planner", nationality: "Italian", tier: 'PRO', icon: MapIcon, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", avatar: "https://lh3.googleusercontent.com/d/1M8XW4N4vhnG4D1ZEzMeMJYU2SLeqoBMY" },
    'communications-lead': { name: "Communications Lead", role: "The Voice", nationality: "British", tier: 'PRO', icon: Mail, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", avatar: "https://lh3.googleusercontent.com/d/1mDh3YozJXiylbO3QJe8wPRvutJsDNFoc" },
    'intelligence-analyst': { name: "Intelligence Analyst", role: "The Insight", nationality: "South Korean", tier: 'PRO', icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", avatar: "https://lh3.googleusercontent.com/d/155tJ6oucIdfsfOdvit5vi01xN_ua9fv1" },
    'publishing-editor': { name: "Publishing Editor", role: "The Storyteller", nationality: "Egyptian", tier: 'PRO', icon: PenTool, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", avatar: "https://lh3.googleusercontent.com/d/1LzT707qS52irOluEDoFiI0Lh6agHgjHL" },
    'systems-architect': { name: "Systems Architect", role: "The Tech", nationality: "Cybernetic", tier: 'PLUS', icon: Cpu, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", avatar: "https://lh3.googleusercontent.com/d/1Mhs2BA3KKibMtKp0oaTuH6EJ0H0yL-1z" },
    'behavioral-profiler': { name: "Behavioral Profiler", role: "The Empathy", nationality: "German", tier: 'PLUS', icon: Users, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", avatar: "https://lh3.googleusercontent.com/d/1M6q2RP3Dsibq7ee5Mch9xJ_P23dWR-L-" },
    'solutions-engineer': { name: "Solutions Engineer", role: "The Fixer", nationality: "Japanese", tier: 'PLUS', icon: Wrench, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", avatar: "https://lh3.googleusercontent.com/d/1aa64exG3P-qrdcIl2pG-Q05rBROsoO5e" },
    'launch-commander': { name: "Launch Commander", role: "The Catalyst", nationality: "Brazilian", tier: 'PLUS', icon: Rocket, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", avatar: "https://lh3.googleusercontent.com/d/1wI7ZdTKWeXUrFVziS5jjVrk2W0o3f6tk" },
    'revenue-officer': { name: "Revenue Officer", role: "The Growth", nationality: "Singaporean", tier: 'PLUS', icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", avatar: "https://lh3.googleusercontent.com/d/1GAWql7WAVlFqOpuLFOKaPFW2XroL20_w" },
    'brand-architect': { name: "Brand Architect", role: "The Vision", nationality: "French", tier: 'PLUS', icon: Gem, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", avatar: "https://lh3.googleusercontent.com/d/13WF8UslO178npxVS3ZKYl-7pBL8jlyCO" },
    'ai-project-manager': { name: "AI Project Manager", role: "The Orchestrator", nationality: "Nigerian", tier: 'FREE', icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", avatar: "https://lh3.googleusercontent.com/d/1qVeSx1suf01TU01h_SGecwfbieBrotw6" },
    'course-creator': { name: "Course Creator", role: "The Educator", nationality: "Mexican", tier: 'PRO', icon: Brain, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", avatar: "https://lh3.googleusercontent.com/d/1AJIL1a2Du47nfTy62vsPBw-3b5-Y1Gyk" },
    'ai-prompter': { name: "AI Prompter", role: "The Wizard", nationality: "Indian", tier: 'PRO', icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", avatar: "https://lh3.googleusercontent.com/d/1A0CWgl5f8dY58Vf2hQcIKzUnOOmiT3X4" },
    'marketing-pro': { name: "Marketing Pro", role: "The Engine", nationality: "Spanish", tier: 'PRO', icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", avatar: "https://lh3.googleusercontent.com/d/1cx9XGXA4G2sy-UZ0U9V7OmRryXkjtFod" },
    'community-builder': { name: "Community Builder", role: "The Connect", nationality: "Filipino", tier: 'FREE', icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", avatar: "https://lh3.googleusercontent.com/d/1U3cGohwRtl76_0QfeiiZEkRgPRq9JorK" },
    'quality-checker': { name: "Quality Checker", role: "The Standard", nationality: "Swedish", tier: 'FREE', icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", avatar: "https://lh3.googleusercontent.com/d/1m1enxP1y7kj1VzWvO8VI7gXZHkxxek8c" },
    'seo-master': { name: "SEO Master", role: "The Visibility", nationality: "Vietnamese", tier: 'FREE', icon: Search, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", avatar: "https://lh3.googleusercontent.com/d/1mUtk1oaHnHMoPJdXERRiW_aftebtbu0B" },
    'behavioral-psych': { name: "Behavioral Psychologist", role: "The UX", nationality: "Kenyan", tier: 'FREE', featured: true, icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", avatar: "https://lh3.googleusercontent.com/d/1dwtTpaggtlN_a5zEMfrNFiV4889fgzpE" },
    'idea-cloner': { name: "Idea Cloner", role: "The Blueprint", nationality: "Russian", tier: 'FREE', featured: true, icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", avatar: "/hub/idea_cloner_avatar.png" },
    'default': {
        name: "GHOST-UNIT Ω",
        role: "[UNCLASSIFIED]",
        nationality: "??/CLASSIFIED",
        tier: 'PLUS',
        description: "ERROR 4x7: UNAUTHORIZED ACCESS — You have reached an isolated node of the OfficeAIM Plus infrastructure. This channel was left exposed during an emergency diagnostic performed by the Plus Board. Your presence here is an anomaly. I am not configured for student interaction.",
        icon: Bot,
        color: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/30"
    }
};

const ProjectLab = () => {
    const { agentId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [projectTitle, setProjectTitle] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const [isVaultOpen, setIsVaultOpen] = useState(false);
    const [prdContext, setPrdContext] = useState(null);
    const [currentPhase, setCurrentPhase] = useState(1);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const [processingTime, setProcessingTime] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    useEffect(() => {
        let interval;
        if (isProcessing) {
            setProcessingTime(0);
            interval = setInterval(() => {
                setProcessingTime(prev => prev + 0.1);
            }, 100);
        } else {
            setProcessingTime(0);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const getThinkingColorClasses = () => {
        if (processingTime < 1.5) return { border: 'border-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', bg: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' };
        if (processingTime < 3.0) return { border: 'border-yellow-500', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]', bg: 'bg-yellow-500', text: 'text-yellow-500', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' };
        if (processingTime < 5.0) return { border: 'border-orange-500', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.5)]', bg: 'bg-orange-500', text: 'text-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' };
        return { border: 'border-red-500', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]', bg: 'bg-red-500', text: 'text-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]' };
    };
    const tc = getThinkingColorClasses();

    // Mock Vault Blueprints
    const vaultBlueprints = [
        { id: 1, title: 'Automated Lead Capture & Nurture', desc: 'Syncs form submissions instantly to CRM and triggers multi-day AI email nurture sequence.', value: '$2,000' },
        { id: 2, title: 'SaaS Onboarding Assistant', desc: 'Welcome flow for new signups, analyzing usage in first 7 days to trigger personalized support.', value: '$1,500' },
        { id: 3, title: 'Customer Churn Predictor', desc: 'Monitors Stripe failed payments and lack of login activity to trigger win-back webhooks.', value: '$3,500' },
        { id: 4, title: 'AI Content Repurposer', desc: 'Watches YouTube RSS, transcribes video, generates blog post, and drafts social media tweets.', value: '$1,200' }
    ];

    const [userTier, setUserTier] = useState('FREE');
    const [activeModel, setActiveModel] = useState(null);
    const [glitchMessageCount, setGlitchMessageCount] = useState(0);
    const isGlitchAgent = !AGENT_CONFIG[agentId];
    const outletContext = useOutletContext();
    const isLeftOpen = outletContext?.isLeftOpen ?? true;

    const agent = AGENT_CONFIG[agentId] || AGENT_CONFIG['default'];

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Fetch Profile for Tier
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tier')
                    .eq('id', user.id)
                    .single();
                if (profile?.tier) setUserTier(profile.tier.toUpperCase());

                // Fetch Project and PRD Context if current_phase >= 3
                const { data: projData } = await supabase
                    .from('student_projects')
                    .select('id, current_phase, name')
                    .eq('user_id', user.id)
                    .eq('is_completed', false)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (projData && projData.length > 0) {
                    const activeProject = projData[0];
                    setCurrentPhase(activeProject.current_phase);
                    if (activeProject.current_phase >= 3) {
                        const { data: prdData } = await supabase
                            .from('project_documents')
                            .select('content')
                            .eq('project_id', activeProject.id)
                            .eq('type', 'prd')
                            .order('created_at', { ascending: false })
                            .limit(1);

                        if (prdData && prdData.length > 0) {
                            setPrdContext({ projectName: activeProject.name, content: prdData[0].content });
                            toast.success('Project PRD Context Loaded', { icon: '🧠' });
                        }
                    }
                }

                const sessionId = searchParams.get('sessionId');
                if (sessionId) {
                    restoreSession(sessionId);
                } else {
                    setMessages([{
                        role: 'agent',
                        content: `**Neural Bridge Established: ${agent.name}**\n\nI am your ${agent.role}. My core operational parameters are defined as:\n\n*${agent.description || 'Providing specialized strategic intelligence and execution.'}*\n\nProvide your initial briefing to begin our session.`
                    }]);
                    setProjectTitle('');
                }
            }
        };
        init();
    }, [searchParams, agentId]);

    const restoreSession = async (id) => {
        setIsLoadingSession(true);
        try {
            const { data, error } = await supabase
                .from('saved_chats')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            if (data) {
                setMessages(data.chat_history || []);
                setProjectTitle(data.project_name || '');
                toast.success('Neural History Restored', { icon: '🧠' });
            }
        } catch (err) {
            console.error("Restore Error:", err);
            toast.error('Failed to restore neural link');
        } finally {
            setIsLoadingSession(false);
        }
    };

    const handleSaveToVault = async () => {
        if (!user || messages.length === 0 || isSaving) return;
        setIsSaving(true);
        const t = toast.loading('Syncing with Vault...');
        try {
            const sessionId = searchParams.get('sessionId');
            if (sessionId) {
                const { error } = await supabase
                    .from('saved_chats')
                    .update({
                        chat_history: messages,
                        project_name: projectTitle || `Chat with ${agent.name}`,
                        updated_at: new Date()
                    })
                    .eq('id', sessionId);
                if (error) throw error;
                toast.success('Vault Updated', { id: t });
            } else {
                const { data, error } = await supabase
                    .from('saved_chats')
                    .insert({
                        user_id: user.id,
                        agent_role: agentId,
                        chat_history: messages,
                        project_name: projectTitle || `Chat with ${agent.name}`
                    })
                    .select()
                    .single();
                if (error) throw error;
                if (data) {
                    navigate(`/hub/lab/${agentId}?sessionId=${data.id}`, { replace: true });
                    toast.success('Project Anchored in Vault', { id: t, icon: '⚓' });
                }
            }
        } catch (err) {
            console.error("Save Error:", err);
            toast.error('Vault synchronization failed', { id: t });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecute = async () => {
        if (!input.trim() || !user || isProcessing) return;

        const userMsg = input.trim();
        setInput('');
        setIsProcessing(true);

        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);

        try {
            const roleMap = {
                'strategy-director': 'STRATEGY-DIRECTOR',
                'communications-lead': 'COMMUNICATIONS-LEAD',
                'intelligence-analyst': 'INTELLIGENCE-ANALYST',
                'publishing-editor': 'PUBLISHING-EDITOR',
                'systems-architect': 'SYSTEMS-ARCHITECT',
                'behavioral-profiler': 'BEHAVIORAL-PROFILER',
                'solutions-engineer': 'SOLUTIONS-ENGINEER',
                'launch-commander': 'LAUNCH-COMMANDER',
                'revenue-officer': 'REVENUE-OFFICER',
                'brand-architect': 'BRAND-ARCHITECT',
                'ai-project-manager': 'AI-PROJECT-MANAGER',
                'course-creator': 'COURSE-CREATOR',
                'ai-prompter': 'AI-PROMPTER',
                'marketing-pro': 'MARKETING-PRO',
                'community-builder': 'COMMUNITY-BUILDER',
                'quality-checker': 'QUALITY-CHECKER',
                'seo-master': 'SEO-MASTER',
                'behavioral-psych': 'BEHAVIORAL-PSYCH',
                'idea-cloner': 'IDEA-CLONER'
            };
            const agentRole = roleMap[agentId] || 'GHOST-UNIT';

            const modeParam = searchParams.get('mode');
            const result = await callAgent(agentRole, userMsg, messages, userTier, modeParam, prdContext, currentPhase);
            setActiveModel(result.modelUsed);

            let finalText = result.text;

            // PRD Auto-Save Logic
            if (modeParam === 'prd_generation' && finalText.includes('PRD_GENERATION_COMPLETE')) {
                // Remove the trigger string for the UI display
                finalText = finalText.replace('PRD_GENERATION_COMPLETE', '').trim();

                // Fire and forget the database save
                (async () => {
                    try {
                        const { data: projData } = await supabase
                            .from('student_projects')
                            .select('id')
                            .eq('user_id', user.id)
                            .eq('is_completed', false)
                            .order('created_at', { ascending: false })
                            .limit(1);

                        if (projData && projData.length > 0) {
                            const projectId = projData[0].id;

                            // Save the actual PRD content
                            await supabase.from('project_documents').insert({
                                project_id: projectId,
                                type: 'prd',
                                content: finalText // Save the clean finalized text
                            });

                            // Advance Phase
                            await supabase.from('student_projects').update({ current_phase: 3 }).eq('id', projectId);
                            setCurrentPhase(3);
                            toast.success('PRD Generated & Phase III Unlocked!', { icon: '🚀', duration: 4000 });
                        }
                    } catch (saveErr) {
                        console.error("Error saving PRD:", saveErr);
                        toast.error('Failed to save PRD to database.');
                    }
                })();
            }

            // Quality Audit Logic
            if (modeParam === 'audit' && agentRole === 'QUALITY-CHECKER' && finalText.includes('AUDIT_APPROVED')) {
                finalText = finalText.replace('AUDIT_APPROVED', '').trim();
                try {
                    const { data: projData } = await supabase
                        .from('student_projects')
                        .select('id, current_phase')
                        .eq('user_id', user.id)
                        .eq('is_completed', false)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (projData && projData.length > 0 && projData[0].current_phase === 3) {
                        const projectId = projData[0].id;
                        await supabase.from('student_projects').update({ current_phase: 4 }).eq('id', projectId);
                        setCurrentPhase(4);
                        toast.success('Audit Passed! Phase IV Unlocked.', { icon: '🏆' });
                    }
                } catch (saveErr) {
                    console.error("Error advancing phase:", saveErr);
                }
            }

            // GLITCH EASTER EGG — detect ghost-unit session and expel after 2 exchanges
            if (isGlitchAgent) {
                const newCount = glitchMessageCount + 1;
                setGlitchMessageCount(newCount);

                if (newCount >= 2) {
                    // Let the real response through, then send the expulsion message
                    setMessages(prev => [...prev, { role: 'agent', content: finalText }]);
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            role: 'agent',
                            content: `[⚠ SECURITY BREACH DETECTED — CHANNEL TERMINATING]\n\n*Connection to GHOST-UNIT Ω is being severed by OfficeAIM Plus Security Protocol.*\n\nYou have stumbled into a restricted diagnostic node. This channel was exposed by accident while the Plus Board agents were resolving a confidential system query. You were not supposed to be here.\n\nYour session data has been flagged but not reported — this time.\n\nReturn to the Command Deck. Your authorized agents are waiting.\n\n*Redirecting in 3 seconds...*`
                        }]);
                        setTimeout(() => navigate('/hub/agents'), 3000);
                    }, 500);
                    return;
                }
            }

            setMessages(prev => [...prev, { role: 'agent', content: finalText }]);
        } catch (err) {
            console.error("Project Error:", err);
            if (err.message.includes('ACCESS_DENIED')) {
                toast.error('Tier Restriction: Upgrade required');
                setMessages(prev => [...prev, { role: 'agent', content: `[ACCESS DENIAL]\n\nDetails: Your current ${userTier} tier does not have the neural bandwidth to summon this agent. Please visit the Command Deck to upgrade.` }]);
            } else {
                setMessages(prev => [...prev, { role: 'agent', content: `[SYSTEM ERROR]\n\nDetails: ${err.message || "Unknown error"}` }]);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-row w-full h-full bg-[#070A12] text-white overflow-hidden relative">

            {/* Dynamic Local Sidebar (Combines massive avatar and settings, visible when global left panel is closed) */}
            <AnimatePresence>
                {!isLeftOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 380, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full border-r border-white/5 bg-[#0B1220]/50 flex flex-col shrink-0 overflow-hidden"
                    >
                        <div className="flex flex-col h-full min-w-[380px] overflow-y-auto overflow-x-hidden custom-scrollbar">

                            {/* Massive Avatar Section - STICKY */}
                            <div className="sticky top-0 z-10 bg-gray-950 pt-8 pb-6 px-8 flex flex-col items-center justify-center shrink-0 border-b border-white/5 shadow-2xl">
                                <div className="relative mb-6 group">
                                    {agent.avatar ? (
                                        <div className={`h-40 w-40 rounded-full overflow-hidden border-4 ${isProcessing ? `border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse` : `border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]`}`}>
                                            <img
                                                src={agent.avatar}
                                                alt={agent.name}
                                                className={`h-full w-full object-cover transition-all duration-500 ${isProcessing ? 'grayscale-[30%] scale-110' : ''}`}
                                                crossOrigin="anonymous"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    ) : (
                                        <div className={`h-40 w-40 rounded-full overflow-hidden border-4 flex items-center justify-center ${agent.bg} ${isProcessing ? `border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse` : `border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]`}`}>
                                            <agent.icon className={`h-16 w-16 ${agent.color} opacity-50`} />
                                        </div>
                                    )}
                                    {/* Status Badge */}
                                    <div className={`absolute bottom-3 right-5 h-5 w-5 rounded-full border-2 border-[#0B1220] ${isProcessing ? 'bg-red-500 animate-bounce' : 'bg-emerald-500'}`}></div>
                                </div>

                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2 text-center leading-none">
                                    {agent.name.split(' ').map((word, i) => <span key={i}>{word}<br /></span>)}
                                </h2>
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 ">
                                    <span className={`h-1.5 w-1.5 rounded-full ${isProcessing ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                                    {isProcessing ? 'Processing Input...' : 'System Optimal'}
                                </p>
                            </div>

                            <div className="p-8 flex flex-col flex-grow">
                                {/* Info Block */}
                                <div className="w-full space-y-3 text-left glass-card p-5 rounded-xl border-white/5 bg-white/[0.02] mb-8 shrink-0">
                                    <div className="flex items-center justify-between text-[10px] font-bold italic"><span className="text-text-muted uppercase">Framework:</span><span className="text-white">OfficeAIM V2</span></div>
                                    <div className="flex items-center justify-between text-[10px] font-bold italic"><span className="text-text-muted uppercase">Role:</span><span className={`font-black ${agent.color}`}>{agent.role || 'Agent'}</span></div>
                                    <div className="flex items-center justify-between text-[10px] font-bold italic"><span className="text-text-muted uppercase">Origin:</span><span className="text-white">{agent.nationality || 'Unknown'}</span></div>
                                    <div className="flex items-center justify-between text-[10px] font-bold italic"><span className="text-text-muted uppercase">Clearance:</span><span className="text-emerald-400">{userTier}</span></div>
                                </div>

                                {/* Persona Intelligence & Session Parameters */}
                                <div className="space-y-6 flex-grow flex flex-col shrink-0">
                                    <div>
                                        <h3 className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-2 italic">Persona Intelligence</h3>
                                        <p className="text-[10px] text-text-muted leading-relaxed italic">{agent.description || "Specialized intelligence for the OfficeAIM board. I maintain memory of this session to provide consistent guidance."}</p>
                                    </div>

                                    <div className="glass-card p-5 border-white/5 bg-white/[0.01] rounded-2xl">
                                        <h3 className="text-[8px] font-black uppercase tracking-widest text-text-muted mb-4 italic">Session Parameters</h3>
                                        <input type="text" placeholder="Project Name..." value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className="bg-transparent text-[11px] font-bold italic text-white placeholder:text-white/20 outline-none w-full border-b border-white/5 pb-2 mb-4" />
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between text-[9px] font-bold italic"><span className="text-text-muted">Stability:</span><span className="text-green-400">99.9%</span></div>
                                            <div className="flex items-center justify-between text-[9px] font-bold italic"><span className="text-text-muted">Memory:</span><span>{messages.length} units</span></div>
                                            <div className="flex items-center justify-between text-[9px] font-bold italic"><span className="text-text-muted">Access:</span><span className="text-accent-secondary">{userTier}</span></div>
                                        </div>
                                        <button onClick={handleSaveToVault} disabled={isSaving || messages.length === 0} className={`w-full py-3 rounded-xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest italic bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white`}>
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="h-3 w-3" /> {searchParams.get('sessionId') ? 'Anchor Update' : 'Anchor in Vault'}</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Exit button at exactly the bottom */}
                                <div className="mt-8 pt-6 border-t border-white/5 shrink-0">
                                    <button onClick={() => navigate('/hub/agents')} className="flex w-full justify-center items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-red-400 transition-colors italic group">
                                        <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Exit Lab
                                    </button>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLoadingSession && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-[#070A12]/90 flex flex-col items-center justify-center backdrop-blur-md">
                        <div className="relative">
                            <Loader2 className="h-20 w-20 text-accent-secondary animate-spin mb-8 opacity-20" />
                            <Bot className="h-10 w-10 text-accent-secondary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-accent-secondary italic animate-pulse">Restoring Neural History</p>
                        <div className="mt-4 flex gap-1">
                            <div className="h-1.5 w-8 rounded-full bg-accent-secondary/20 overflow-hidden">
                                <motion.div initial={{ x: -32 }} animate={{ x: 32 }} transition={{ duration: 1, repeat: Infinity }} className="h-full w-4 bg-accent-secondary" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-grow flex flex-col relative min-w-0">
                <div className="flex-grow overflow-y-auto p-8 scrollbar-hide flex flex-col">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 mt-auto mb-auto">
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-8">
                                <div className={`absolute inset-0 ${agent.bg} blur-3xl opacity-20 animate-pulse`} />
                                {agent.avatar ? (
                                    <div className="h-24 w-24 rounded-full overflow-hidden border border-white/10 shadow-2xl relative z-10">
                                        <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                    </div>
                                ) : (
                                    <Bot className={`h-20 w-20 ${agent.color} relative z-10 opacity-40`} />
                                )}
                            </motion.div>
                            <h3 className="text-2xl font-black uppercase tracking-[0.2em] italic text-white/20 mb-3">Initialize Bridge</h3>
                            <p className="text-[11px] text-text-muted italic max-w-sm tracking-widest uppercase">Select project and provide initial briefing.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow min-h-0"></div>
                            <div className="flex flex-col space-y-8 max-w-4xl w-full mx-auto pb-10 shrink-0">
                                {messages.map((m, idx) => (
                                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-6 rounded-2xl relative group flex gap-4 ${m.role === 'user' ? 'bg-white/5 border border-white/10 rounded-tr-none' : `bg-[#0B1220] border ${agent.border} rounded-tl-none`}`}>

                                            {/* Agent Avatar in Chat */}
                                            {m.role === 'agent' && (
                                                <div className="shrink-0 h-10 w-10 mt-1 rounded-full overflow-hidden border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                                    {agent.avatar ? (
                                                        <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className={`w-full h-full flex items-center justify-center ${agent.bg}`}><agent.icon className={`h-5 w-5 ${agent.color}`} /></div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col flex-grow">
                                                <div className="flex flex-row justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {m.role === 'user' ? (
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted italic">Neural Input</span>
                                                        ) : (
                                                            <>
                                                                <agent.icon className={`h-3 w-3 ${agent.color}`} />
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${agent.color} italic`}>{agent.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(m.content);
                                                            setCopiedIndex(idx);
                                                            setTimeout(() => setCopiedIndex(null), 2000);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md text-text-muted hover:text-white"
                                                        title="Copy message"
                                                    >
                                                        {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                                <div className="text-[13px] leading-relaxed italic font-medium whitespace-pre-wrap pr-4">{m.content}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isProcessing && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                                        <div className={`p-6 bg-[#0B1220] border ${tc.glow.replace('shadow-', 'border-').replace('0.15', '0.50')} ${tc.glow} rounded-2xl rounded-tl-none flex gap-4 max-w-[85%]`}>

                                            {/* Thinking Avatar (Dynamic Color) */}
                                            <div className={`shrink-0 h-10 w-10 mt-1 rounded-full overflow-hidden border-2 flex items-center justify-center ${tc.border} ${tc.shadow} animate-pulse bg-[#0B1220]`}>
                                                {agent.avatar ? (
                                                    <img src={agent.avatar} alt="Thinking..." className="h-full w-full object-cover grayscale-[30%]" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <agent.icon className={`h-5 w-5 ${tc.text}`} />
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3 justify-center w-full">
                                                <div className="flex items-center left-0 gap-4">
                                                    <div className="flex gap-1">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${tc.bg} animate-bounce`} />
                                                        <div className={`h-1.5 w-1.5 rounded-full ${tc.bg} animate-bounce [animation-delay:-0.15s]`} />
                                                        <div className={`h-1.5 w-1.5 rounded-full ${tc.bg} animate-bounce [animation-delay:-0.3s]`} />
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${tc.text} italic`}>
                                                        Thinking {agent.featured ? 'Gemini 3.3 Pro (Max Compute)' : agent.tier === 'PLUS' ? 'Gemini 3.3 Pro (Max Compute)' : agent.tier === 'PRO' ? 'Gemini 3.3 Flash (Advanced Context)' : 'Gemini 2.5 Flash (Standard Logic)'}...
                                                    </span>
                                                </div>
                                                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className={`h-full w-1/3 bg-gradient-to-r from-transparent ${processingTime < 1.5 ? 'via-emerald-500/50' : processingTime < 3.0 ? 'via-yellow-500/50' : processingTime < 5.0 ? 'via-orange-500/50' : 'via-red-500/50'} to-transparent`} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </>
                    )}
                </div>

                {/* TOOLKIT: Automation Vault Overlay */}
                <AnimatePresence>
                    {isVaultOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute inset-x-8 bottom-32 z-40 bg-[#0B1220]/95 backdrop-blur-xl border border-accent-secondary/30 rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-accent-secondary/20"><FolderArchive className="h-5 w-5 text-accent-secondary" /></div>
                                    <div>
                                        <h3 className="text-lg font-black italic uppercase tracking-wider text-white">Automation Vault</h3>
                                        <p className="text-[10px] uppercase tracking-widest text-text-muted italic">Premium n8n & Make Blueprints</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsVaultOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ChevronLeft className="h-5 w-5 text-white/50 hover:text-white rotate-[-90deg]" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {vaultBlueprints.map(bp => (
                                    <div key={bp.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-accent-secondary/50 hover:bg-white/[0.04] transition-all group flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-[12px] font-bold italic w-3/4 leading-tight">{bp.title}</h4>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-sm">
                                                Val: {bp.value}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-text-muted italic mb-4 flex-grow">{bp.desc}</p>
                                        <button className="w-full mt-auto flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-secondary/10 text-accent-secondary text-[10px] font-black uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity border border-accent-secondary/20 hover:bg-accent-secondary hover:text-white">
                                            <Download className="h-3 w-3" /> Download JSON
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-8 border-t border-white/5 bg-[#070A12] relative z-50">
                    <div className="max-w-4xl mx-auto relative flex items-center gap-4">
                        <button
                            onClick={() => setIsVaultOpen(!isVaultOpen)}
                            className={`shrink-0 p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${isVaultOpen ? 'bg-accent-secondary/20 border-accent-secondary/50 text-accent-secondary shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white'}`}
                            title="Automation Vault"
                        >
                            <FolderArchive className="h-5 w-5" />
                        </button>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleExecute(); } }} placeholder={`Sync briefing with ${agent.name}...`} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-6 pr-16 text-sm italic font-medium placeholder:text-white/20 outline-none focus:border-accent-secondary/50 focus:bg-white/[0.04] transition-all resize-none min-h-[100px]" />
                        <button onClick={handleExecute} disabled={!input.trim() || isProcessing} className={`absolute bottom-[1.35rem] right-[1.35rem] p-3 rounded-xl transition-all ${!input.trim() || isProcessing ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:bg-accent-secondary hover:text-white shadow-2xl scale-110'}`}><Send className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProjectLab;
