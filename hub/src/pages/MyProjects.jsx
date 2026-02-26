import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ChevronLeft, Clock, MessageSquare, ExternalLink, Bot, Trash2, Loader2, Calendar,
    Map as MapIcon, Mail, FileText, PenTool, Cpu, Users, Wrench, Rocket,
    DollarSign, Gem, Target, Brain, Search, TrendingUp, ShieldCheck, Zap
} from 'lucide-react';

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
    'ai-project-manager': { name: "AI Project Manager", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    'course-creator': { name: "Course Creator", icon: Brain, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    'ai-prompter': { name: "AI Prompter", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    'marketing-pro': { name: "Marketing Pro", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    'community-builder': { name: "Community Builder", icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    'quality-checker': { name: "Quality Checker", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    'seo-master': { name: "SEO Master", icon: Search, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    'behavioral-psych': { name: "Behavioral Psychologist", icon: Brain, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    'default': { name: "AI Agent", icon: Bot, color: "text-white", bg: "bg-white/10", border: "border-white/20" }
};

const MyProjects = () => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) fetchSavedChats(user.id);
        });
    }, []);

    const fetchSavedChats = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('saved_chats')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setChats(data || []);
        } catch (err) {
            console.error("Fetch saved chats error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('saved_chats')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setChats(prev => prev.filter(c => c.id !== id));
            toast.success('Project Purged from Vault');
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Failed to delete project");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 bg-[#070A12] min-h-screen text-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <button
                    onClick={() => navigate('/hub/dashboard')}
                    className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all italic group"
                >
                    <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <h1 className="text-4xl lg:text-6xl font-black italic mb-4">
                    My <span className="title-gradient">AI Projects</span>
                </h1>
                <p className="text-text-muted text-sm italic font-medium max-w-2xl">
                    Access your stored neural sessions and continue developing your innovations with the OfficeAIM board of directors.
                </p>
            </motion.div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-2 border-accent-secondary border-t-transparent rounded-full mb-4"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted animate-pulse italic">Retrieving Vault Data...</p>
                </div>
            ) : chats.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-white/10">
                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="h-8 w-8 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold italic mb-2 text-white/80">Vault is Empty</h3>
                    <p className="text-xs text-text-muted italic mb-8">You haven't saved any neural sessions yet.</p>
                    <button
                        onClick={() => navigate('/hub/agents')}
                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent-secondary hover:text-white transition-all italic"
                    >
                        Deploy First Agent
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chats.map((chat, idx) => {
                        const config = AGENT_CONFIG[chat.agent_role] || AGENT_CONFIG['default'];
                        const lastMsg = chat.chat_history[chat.chat_history.length - 1];

                        return (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/hub/lab/${chat.agent_role}?sessionId=${chat.id}`)}
                                className={`glass-card p-6 border ${config.border} bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 ${config.bg} blur-[40px] rounded-full -mr-8 -mt-8 opacity-40 group-hover:scale-150 transition-transform`}></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`p-3 rounded-lg ${config.bg} ${config.color} border ${config.border} shadow-lg`}>
                                        <config.icon className="h-5 w-5" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, chat.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group/del"
                                        title="Delete Project"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="text-right mb-4">
                                    <div className={`text-[8px] font-black uppercase tracking-widest ${config.color} italic mb-1`}>{config.name}</div>
                                    <div className="text-[10px] font-bold text-text-muted italic flex items-center gap-1 justify-end">
                                        <Clock className="h-3 w-3" />
                                        {new Date(chat.updated_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <h3 className="text-lg font-black italic text-white mb-3 line-clamp-1 group-hover:text-accent-secondary transition-colors">
                                    {chat.project_name}
                                </h3>

                                <div className="bg-black/20 rounded-xl p-3 mb-6 min-h-[60px] relative">
                                    <p className="text-[10px] text-white/50 italic line-clamp-2 leading-relaxed">
                                        {lastMsg?.content || "No message history found."}
                                    </p>
                                    <div className="absolute bottom-1 right-2 text-[8px] font-black uppercase tracking-widest text-white/10 group-hover:text-white/30 italic">Preview</div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5 uppercase tracking-widest font-black italic text-[9px]">
                                    <span className="text-text-muted">{chat.chat_history.length} Messages</span>
                                    <span className="text-white group-hover:translate-x-1 transition-transform flex items-center gap-1">Restore Link <ExternalLink className="h-3 w-3" /></span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyProjects;
