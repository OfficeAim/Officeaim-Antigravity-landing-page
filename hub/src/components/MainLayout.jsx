import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Trophy, Bot, Layout, Award, Settings,
    LogOut, ChevronRight, ChevronLeft, Activity, Shield,
    MessageSquare, CheckCircle2, ListTodo, PenTool, Bug, X, Send, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import MascotAssistant from './MascotAssistant';

const MainLayout = ({ profile }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Panel States
    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);

    // Stats for placeholder progress
    const [progress, setProgress] = useState(45);

    // Mock Data for New Features
    const courseModules = [
        { id: 1, title: "Module 1: Foundations", completed: true },
        { id: 2, title: "Module 2: Agent Architecture", completed: false },
        { id: 3, title: "Module 3: Advanced Workflows", completed: false },
    ];

    // Project Memory State
    const [recentProjects, setRecentProjects] = useState([]);

    // Project Context State
    const [activePrd, setActivePrd] = useState(null);

    useEffect(() => {
        if (!profile?.id) return;
        const fetchRecentActivity = async () => {
            // Fetch Chats
            const { data: chats } = await supabase
                .from('saved_chats')
                .select('id, project_name, agent_role, updated_at')
                .eq('user_id', profile.id)
                .order('updated_at', { ascending: false })
                .limit(5);

            // Better yet, just get saved chats, but map them correctly. 
            // The canvas requested: "Fix Recent Memory Links: Ensure MainLayout.jsx items correctly load chat history vs PRD based on item type."
            // Wait, the current logic only fetches `saved_chats`. Let's fetch the docs for the active project.

            const { data: activeProjs } = await supabase
                .from('student_projects')
                .select('id')
                .eq('user_id', profile.id);

            let docs = [];
            if (activeProjs && activeProjs.length > 0) {
                const projectIds = activeProjs.map(p => p.id);
                const { data: projectDocs } = await supabase
                    .from('project_documents')
                    .select('id, type, created_at, project_id')
                    .in('project_id', projectIds)
                    .order('created_at', { ascending: false })
                    .limit(5);
                docs = projectDocs || [];
            }

            let combined = [];

            if (chats) {
                combined = [...combined, ...chats.map(p => ({
                    id: p.id,
                    title: p.project_name || 'Untitled Project',
                    subtitle: p.agent_role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    rawAgentId: p.agent_role,
                    type: 'chat',
                    timestamp: new Date(p.updated_at).getTime()
                }))];
            }

            if (docs) {
                combined = [...combined, ...docs.map(d => ({
                    id: d.id,
                    title: d.type === 'prd' ? 'Product Requirements Document' : 'Project Document',
                    subtitle: d.type.toUpperCase(),
                    type: 'document',
                    timestamp: new Date(d.created_at).getTime()
                }))];
            }

            // Sort chronologically (newest first) and limit to 5
            combined.sort((a, b) => b.timestamp - a.timestamp);
            setRecentProjects(combined.slice(0, 5));

            // Fetch Active Project for PRD Context
            const { data: projData } = await supabase
                .from('student_projects')
                .select('id, name, current_phase')
                .eq('user_id', profile.id)
                .eq('is_completed', false)
                .order('created_at', { ascending: false })
                .limit(1);

            if (projData && projData.length > 0 && projData[0].current_phase >= 3) {
                if (projData[0].name === 'MakelaarVideo AI') {
                    setActivePrd({
                        title: projData[0].name,
                        goal: "Auto-Reels for Snelder Zijlstra (Twente).",
                        flow: "Webhook -> CloudConvert -> OpenAI (Researcher/Strategist) -> Gmail -> Sheets.",
                        keyId: "Pand_Naam (Col C)."
                    });
                }
            }
        };

        fetchRecentActivity();

        // Optional: Listen for changes in saved_chats
        const channel = supabase.channel('saved_chats_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_chats', filter: `user_id=eq.${profile.id}` }, () => {
                fetchRecentActivity();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [profile?.id]);

    const [notes, setNotes] = useState("");
    const [tasks, setTasks] = useState([
        { id: 1, text: "Finish Module 1", done: false },
        { id: 2, text: "Deploy Quality Checker", done: false }
    ]);

    // Report Bug state
    const [showBugReport, setShowBugReport] = useState(false);
    const [bugIssue, setBugIssue] = useState('');
    const [bugDescription, setBugDescription] = useState('');
    const [bugSubmitting, setBugSubmitting] = useState(false);
    const [bugSubmitted, setBugSubmitted] = useState(false);

    const handleBugSubmit = async () => {
        if (!bugIssue.trim() || !profile?.id) return;
        setBugSubmitting(true);
        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: profile.id,
                    student_name: profile.full_name || profile.email || 'Student',
                    issue: bugIssue.trim(),
                    description: bugDescription.trim() || null,
                    page_url: location.pathname,
                    status: 'open'
                });
            if (error) throw error;
            setBugSubmitted(true);
            setTimeout(() => {
                setShowBugReport(false);
                setBugIssue('');
                setBugDescription('');
                setBugSubmitted(false);
            }, 2000);
        } catch (err) {
            console.error('Error submitting bug report:', err.message);
            alert('Failed to submit. Please try again.');
        } finally {
            setBugSubmitting(false);
        }
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/hub/login');
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-[#070A12] text-white font-plus-jakarta relative">

            {/* LEFT PANEL TOGGLE BUTTON (Floating) */}
            <button
                onClick={() => setIsLeftOpen(!isLeftOpen)}
                className={`absolute top-1/2 -translate-y-1/2 z-50 p-1.5 rounded-r-xl bg-[#0B1220] border-y border-r border-white/10 hover:bg-white/10 transition-all ${isLeftOpen ? 'left-[280px]' : 'left-0'}`}
            >
                {isLeftOpen ? <ChevronLeft className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-white" />}
            </button>

            {/* LEFT PANEL - NAVIGATION */}
            <motion.div
                initial={false}
                animate={{ width: isLeftOpen ? 280 : 0, opacity: isLeftOpen ? 1 : 0 }}
                className="h-full border-r border-white/5 bg-[#0B1220] flex flex-col shrink-0 relative z-40 shadow-2xl overflow-hidden"
            >
                <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-hide min-w-[280px]">
                    {/* Logo Area */}
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                        <div className="h-10 w-10 bg-accent-secondary/20 rounded-xl flex items-center justify-center border border-accent-secondary/30 relative overflow-hidden group cursor-pointer shrink-0">
                            <div className="absolute inset-0 bg-accent-secondary/20 blur-md group-hover:bg-accent-secondary/40 transition-colors"></div>
                            <Bot className="text-accent-secondary relative z-10 h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter title-gradient leading-none">OfficeAIM</h1>
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted italic block mt-1 opacity-70">Neural Campus</span>
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <nav className="space-y-2 mb-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic block mb-3 ml-2 opacity-50">Global</span>

                        <button
                            onClick={() => navigate('/hub/dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-black italic ${location.pathname.includes('/dashboard') ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <Layout className="h-4 w-4" /> Dashboard
                        </button>

                        <button
                            onClick={() => navigate('/hub/planner')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-black italic ${location.pathname.includes('/planner') ? 'bg-emerald-500/10 text-emerald-400 shadow-inner border border-emerald-500/20' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <Layout className="h-4 w-4" /> Project Planner
                        </button>

                        <button
                            onClick={() => navigate('/hub/agents')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-black italic ${location.pathname.includes('/agents') || location.pathname.includes('/lab/') ? 'bg-accent-primary/10 text-accent-primary shadow-inner border border-accent-primary/20' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <Bot className="h-4 w-4" /> Corporate Board
                        </button>

                        <button
                            onClick={() => navigate('/hub/projects')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-black italic ${location.pathname.includes('/projects') ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <Award className="h-4 w-4" /> Neural Vault
                        </button>
                    </nav>

                    {/* Dynamic Course Curriculum */}
                    <div className="mb-8">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic block mb-3 ml-2 opacity-50">Curriculum</span>
                        <div className="space-y-1 pl-2 border-l border-white/10 ml-4 py-1">
                            {courseModules.map((mod) => (
                                <button
                                    key={mod.id}
                                    onClick={() => navigate(`/hub/module/${mod.id}`)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-xs font-black italic ${location.pathname.includes(`/module/${mod.id}`)
                                        ? 'text-white bg-white/5'
                                        : mod.completed
                                            ? 'text-emerald-400 hover:bg-emerald-400/10'
                                            : 'text-text-muted hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {mod.completed ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <BookOpen className="h-3.5 w-3.5 shrink-0" />}
                                    <span className="truncate">{mod.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Student Lounge Link */}
                    <div className="mb-auto">
                        <div
                            onClick={() => navigate('/hub/lounge')}
                            className={`glass-card p-4 rounded-2xl border-indigo-500/20 relative overflow-hidden group cursor-pointer transition-colors ${location.pathname.includes('/lounge') ? 'bg-indigo-500/20' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                        >
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/20 blur-xl rounded-full"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <MessageSquare className="h-4 w-4 text-indigo-400" />
                                <h3 className="text-sm font-black italic text-white uppercase tracking-widest">Student Lounge</h3>
                            </div>
                            <p className="text-[10px] text-indigo-200/60 leading-relaxed italic mb-3">Connect with 250+ action-takers in our private ecosystem.</p>
                            <button className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white transition-colors flex items-center gap-1 group-hover:gap-2">
                                Enter System <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Performance Hub (Bottom) */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted italic opacity-50">Total Progress</span>
                            <span className="text-accent-secondary font-black text-sm italic">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                            />
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-widest italic bg-white/5 p-3 rounded-xl mb-4">
                            <span>Status: Found. Member</span>
                            <span className="text-emerald-400">ACTIVE</span>
                        </div>

                        {/* User Card */}
                        <div className="p-3 glass-card bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors relative z-20">
                            <div className="flex items-center gap-3 shrink-0 truncate">
                                <div className="h-8 w-8 rounded-full bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-accent-primary text-[10px] font-black">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="truncate">
                                    <div className="text-xs font-black italic truncate max-w-[100px]">{profile?.full_name || 'Student'}</div>
                                    <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest italic">{profile?.role || 'Member'}</div>
                                </div>
                            </div>
                            <button onClick={handleSignOut} className="text-text-muted hover:text-red-400 transition-colors p-2 shrink-0">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CENTER PANEL - MAIN WORKSPACE */}
            <div className="flex-grow h-full overflow-y-auto scrollbar-hide bg-[#070A12] relative z-0 transition-all duration-300">
                <main className="min-h-full">
                    <Outlet context={{ isLeftOpen, isRightOpen }} />
                </main>

                {/* Floating Report Bug Button (non-admin only) */}
                {profile?.role !== 'admin' && (
                    <button
                        onClick={() => setShowBugReport(true)}
                        className="fixed bottom-6 right-[300px] z-40 h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center hover:bg-orange-500/20 hover:scale-105 transition-all group shadow-lg shadow-orange-500/10"
                        title="Report a Bug"
                    >
                        <Bug className="h-5 w-5 text-orange-400 group-hover:text-orange-300" />
                    </button>
                )}

                {/* Bug Report Modal */}
                <AnimatePresence>
                    {showBugReport && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowBugReport(false)}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="w-full max-w-md bg-[#0A0F18] border border-orange-500/20 rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                            <Bug className="h-4 w-4 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Report a Bug</h3>
                                            <p className="text-[9px] text-text-muted italic">Our team will review it ASAP</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowBugReport(false)} className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                        <X className="h-4 w-4 text-text-muted" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-4">
                                    {bugSubmitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="py-8 text-center"
                                        >
                                            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                            <p className="text-sm font-black italic text-white">Bug Report Sent!</p>
                                            <p className="text-[10px] text-text-muted italic mt-1">Thank you. We're on it.</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-2 block">What's the issue? *</label>
                                                <input
                                                    type="text"
                                                    value={bugIssue}
                                                    onChange={(e) => setBugIssue(e.target.value)}
                                                    placeholder="e.g. Quiz won't submit, page won't load..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-white/20"
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-2 block">Details (optional)</label>
                                                <textarea
                                                    value={bugDescription}
                                                    onChange={(e) => setBugDescription(e.target.value)}
                                                    placeholder="What were you doing when it happened? Any error messages?"
                                                    rows={3}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/30 transition-all resize-none placeholder:text-white/20"
                                                />
                                            </div>
                                            <div className="text-[9px] text-text-muted italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                📍 Page: <span className="text-white/60 font-mono">{location.pathname}</span>
                                            </div>
                                            <button
                                                onClick={handleBugSubmit}
                                                disabled={!bugIssue.trim() || bugSubmitting}
                                                className="w-full py-3.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {bugSubmitting ? (
                                                    <><div className="h-3.5 w-3.5 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" /> Sending...</>
                                                ) : (
                                                    <><Send className="h-3.5 w-3.5" /> Submit Report</>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT PANEL TOGGLE BUTTON (Floating) */}
            <button
                onClick={() => setIsRightOpen(!isRightOpen)}
                className={`absolute top-1/2 -translate-y-1/2 z-50 p-1.5 rounded-l-xl bg-[#0A0F18] border-y border-l border-white/10 hover:bg-white/10 transition-all ${isRightOpen ? 'right-[280px]' : 'right-0'}`}
            >
                {isRightOpen ? <ChevronRight className="h-4 w-4 text-text-muted" /> : <ChevronLeft className="h-4 w-4 text-white" />}
            </button>

            {/* RIGHT PANEL - TACTICAL HUD */}
            <motion.div
                initial={false}
                animate={{ width: isRightOpen ? 280 : 0, opacity: isRightOpen ? 1 : 0 }}
                className="h-full border-l border-white/5 bg-[#0A0F18] flex flex-col shrink-0 z-40 overflow-hidden shadow-2xl"
            >
                <div className="p-6 flex flex-col h-full overflow-y-auto scrollbar-hide min-w-[280px]">

                    {/* Tactical Scratchpad */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <PenTool className="text-amber-400 h-4 w-4" />
                            <h2 className="text-xs font-black italic uppercase tracking-widest text-white">Scratchpad</h2>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Jot down active thoughts, prompts, or notes..."
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-[11px] italic font-medium placeholder:text-white/20 outline-none focus:border-amber-400/50 focus:bg-white/[0.04] transition-all resize-none min-h-[120px]"
                        />
                    </div>

                    {/* Active Checklist */}
                    <div className="mb-8 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ListTodo className="text-emerald-400 h-4 w-4" />
                            <h2 className="text-xs font-black italic uppercase tracking-widest text-white">Active Focus</h2>
                        </div>
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-full text-left flex items-start gap-3 p-2.5 rounded-xl border transition-all ${task.done ? 'bg-emerald-400/5 border-emerald-400/20 opacity-60' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                                >
                                    <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full border flex items-center justify-center ${task.done ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-white/20'}`}>
                                        {task.done && <CheckCircle2 className="h-3 w-3" />}
                                    </div>
                                    <span className={`text-[11px] italic font-bold leading-tight ${task.done ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {task.text}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Project Memory (Pushed to bottom) */}
                    <div className="mt-auto border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="text-accent-secondary h-4 w-4" />
                            <h2 className="text-xs font-black italic uppercase tracking-widest text-white">Recent Memory</h2>
                        </div>
                        <div className="space-y-3">
                            {/* PRD Context Injection (Tactical Unit Palette) */}
                            {activePrd && (
                                <div
                                    onClick={() => navigate('/hub/planner', { state: { openPrd: true } })}
                                    className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)] mb-4 cursor-pointer group hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[11px] font-black italic text-emerald-400 uppercase tracking-widest group-hover:text-emerald-300 transition-colors">Active Project</h3>
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-3 group-hover:text-emerald-50 transition-colors">{activePrd.title}</h4>
                                    <div className="space-y-2 font-mono text-[10px] leading-relaxed relative z-10">
                                        <div className="bg-black/20 p-2 rounded border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                                            <span className="text-emerald-400/70 font-bold block mb-0.5">1. GOAL</span>
                                            <span className="text-emerald-100/90">{activePrd.goal}</span>
                                        </div>
                                        <div className="bg-black/20 p-2 rounded border border-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
                                            <span className="text-cyan-400/70 font-bold block mb-0.5">2. FLOW</span>
                                            <span className="text-cyan-100/90">{activePrd.flow}</span>
                                        </div>
                                        <div className="bg-black/20 p-2 rounded border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                                            <span className="text-emerald-400/70 font-bold block mb-0.5">3. KEY ID</span>
                                            <span className="text-emerald-100/90">{activePrd.keyId}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {recentProjects.map((project, idx) => (
                                <div
                                    key={project.id || idx}
                                    onClick={() => {
                                        if (project.type === 'chat') {
                                            navigate(`/hub/lab/${project.rawAgentId || 'quality-checker'}?sessionId=${project.id}`);
                                        } else if (project.type === 'document') {
                                            navigate('/hub/planner', { state: { openPrd: true } });
                                        }
                                    }}
                                    className={`p-3 rounded-xl bg-white/[0.02] border border-white/5 group cursor-pointer transition-all ${project.type === 'chat' ? 'hover:border-accent-secondary/30' : 'hover:border-blue-500/30'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest italic px-2 py-0.5 rounded ${project.type === 'chat' ? 'text-accent-secondary bg-accent-secondary/10' : 'text-blue-400 bg-blue-500/10'}`}>
                                            {project.type === 'chat' ? 'Chat Session' : 'Document'}
                                        </span>
                                        <span className="text-[9px] text-text-muted">{new Date(project.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className={`text-[11px] font-black italic transition-colors line-clamp-1 ${project.type === 'chat' ? 'text-white group-hover:text-accent-secondary' : 'text-white group-hover:text-blue-400'}`}>
                                        {project.title}
                                    </h3>
                                    <p className="text-[9px] text-text-muted mt-1 truncate">{project.subtitle}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mascot Assistant (Only on Dashboard) */}
                    {location.pathname.endsWith('/dashboard') && (
                        <MascotAssistant profile={profile} />
                    )}

                    {/* Admin Quick Action */}
                    {profile?.role === 'admin' && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <button
                                onClick={() => navigate('/hub/admin')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all italic"
                            >
                                <Shield className="h-4 w-4" /> Admin Controls
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MainLayout;
