import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ShieldCheck, Power, Search, AlertTriangle, TrendingUp, Bot, Sparkles, RefreshCcw, BookOpen, Clock, MessageSquare, Send, ChevronRight, X, Activity, Award, HeadphonesIcon, DollarSign, Cpu, BarChart3, Wallet, Pencil, Check, ChevronDown, ChevronUp, Globe, Server, Zap, Mail, ExternalLink, Copy, CheckCircle, Inbox, Bug, ClipboardCheck } from 'lucide-react';

const AdminDashboard = ({ profile }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        canceled: 0,
        completionRate: '0%',
        revenue: '$0',
        totalLessonsCompleted: 0,
        apiCosts: '$12.50',
        netMargin: '$0',
        tierBreakdown: { free: 0, pro: 0, plus: 0 }
    });

    // Student detail modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProgress, setUserProgress] = useState([]);
    const [userQuizAttempts, setUserQuizAttempts] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // Bug-to-Prompt Inbox
    const [supportTickets, setSupportTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const [ticketFilter, setTicketFilter] = useState('open');
    const [expandedTicket, setExpandedTicket] = useState(null);

    // Cost Analysis Panel
    const [showCosts, setShowCosts] = useState(true);
    const [editingCost, setEditingCost] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [costs, setCosts] = useState({
        fixed: [
            { id: 'supabase', name: 'Supabase', plan: 'Pro', cost: 25, icon: 'server', color: 'green', url: 'https://supabase.com/dashboard/project/guemwhrdqmbneoccucht' },
            { id: 'vercel', name: 'Vercel', plan: 'Pro', cost: 20, icon: 'globe', color: 'blue', url: 'https://vercel.com/rody-figueroa-quijanos-projects/vite-react' },
            { id: 'google_ai', name: 'Google AI', plan: 'Pro', cost: 20, icon: 'sparkles', color: 'purple', url: 'https://aistudio.google.com/spend' },
            { id: 'domain', name: 'Domain', plan: 'Annual', cost: 1, icon: 'globe', color: 'cyan', url: 'https://www.porkbun.com' },
        ],
        variable: [
            { id: 'gemini_api', name: 'Gemini API', plan: 'Usage-based', cost: 5, icon: 'cpu', color: 'orange', url: 'https://aistudio.google.com/spend' },
            { id: 'n8n', name: 'n8n', plan: 'Not active', cost: 0, icon: 'zap', color: 'yellow', url: 'http://localhost:5678/home/workflows' },
            { id: 'email', name: 'Email Service', plan: 'Not active', cost: 0, icon: 'mail', color: 'pink', url: 'https://resend.com/emails' },
        ]
    });

    const totalFixed = costs.fixed.reduce((sum, c) => sum + c.cost, 0);
    const totalVariable = costs.variable.reduce((sum, c) => sum + c.cost, 0);
    const totalCosts = totalFixed + totalVariable;
    const mrrValue = parseFloat(stats.revenue.replace('$', '')) || 0;
    const netMarginValue = mrrValue - totalCosts;
    const breakeven = totalCosts > 0 ? Math.ceil(totalCosts / 49) : 0;

    const handleCostEdit = (type, id) => {
        const list = costs[type];
        const item = list.find(c => c.id === id);
        setEditingCost(`${type}-${id}`);
        setEditValue(item.cost.toString());
    };

    const handleCostSave = (type, id) => {
        const val = parseFloat(editValue) || 0;
        setCosts(prev => ({
            ...prev,
            [type]: prev[type].map(c => c.id === id ? { ...c, cost: val } : c)
        }));
        setEditingCost(null);
    };

    const getCostIcon = (icon) => {
        const iconMap = {
            server: <Server className="h-3.5 w-3.5" />,
            globe: <Globe className="h-3.5 w-3.5" />,
            sparkles: <Sparkles className="h-3.5 w-3.5" />,
            cpu: <Cpu className="h-3.5 w-3.5" />,
            zap: <Zap className="h-3.5 w-3.5" />,
            mail: <Mail className="h-3.5 w-3.5" />,
        };
        return iconMap[icon] || <DollarSign className="h-3.5 w-3.5" />;
    };

    const getColorClasses = (color) => {
        const map = {
            green: 'bg-green-500/10 text-green-400',
            blue: 'bg-blue-500/10 text-blue-400',
            purple: 'bg-purple-500/10 text-purple-400',
            cyan: 'bg-cyan-500/10 text-cyan-400',
            orange: 'bg-orange-500/10 text-orange-400',
            yellow: 'bg-yellow-500/10 text-yellow-400',
            pink: 'bg-pink-500/10 text-pink-400',
        };
        return map[color] || 'bg-white/10 text-white';
    };

    useEffect(() => {
        fetchUsers();
        fetchTickets();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchUserProgress(selectedUser.id);
        }
    }, [selectedUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log("Admin: Fetching users...");
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;

            // Fetch global progress stats
            const { data: progressData } = await supabase
                .from('student_progress')
                .select('status');

            const { count: totalLessons } = await supabase
                .from('lessons')
                .select('*', { count: 'exact', head: true });

            const userList = data || [];
            setUsers(userList);

            const active = userList.filter(u => ['active', 'beta'].includes(u.membership_status)).length;
            const canceled = userList.filter(u => u.membership_status === 'canceled').length;
            const completedCount = progressData?.filter(p => p.status === 'completed').length || 0;
            const studentCount = userList.filter(u => u.role === 'student').length;
            const totalPossible = studentCount * (totalLessons || 1);
            const rate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;

            // Tier breakdown
            const freeUsers = userList.filter(u => u.subscription_tier === 'free' || !u.subscription_tier).length;
            const proUsers = userList.filter(u => u.subscription_tier === 'pro').length;
            const plusUsers = userList.filter(u => u.subscription_tier === 'plus').length;

            // Revenue calc: Pro=$49, Plus=$99
            const mrr = (proUsers * 49) + (plusUsers * 99);
            const apiCosts = 12.50; // placeholder
            const netMargin = mrr - apiCosts;

            setStats({
                total: userList.length,
                active,
                canceled,
                completionRate: `${rate}%`,
                revenue: `$${mrr}`,
                totalLessonsCompleted: completedCount,
                apiCosts: `$${apiCosts.toFixed(2)}`,
                netMargin: `$${netMargin.toFixed(2)}`,
                tierBreakdown: { free: freeUsers, pro: proUsers, plus: plusUsers }
            });
        } catch (err) {
            console.error("Error fetching users:", err.message);
            setUsers([]);
            setStats({ total: 0, active: 0, canceled: 0, completionRate: '0%', revenue: '$0', totalLessonsCompleted: 0, apiCosts: '$0', netMargin: '$0', tierBreakdown: { free: 0, pro: 0, plus: 0 } });
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProgress = async (userId) => {
        setLoadingProgress(true);
        try {
            // Fetch progress with lesson + module info
            const { data: progressData, error: progressError } = await supabase
                .from('student_progress')
                .select(`
                    *,
                    lessons (
                        title,
                        module_id,
                        order_index,
                        modules (
                            title
                        )
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (progressError) throw progressError;
            setUserProgress(progressData || []);

            // Fetch quiz attempts
            const { data: quizData, error: quizError } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (quizError) throw quizError;
            setUserQuizAttempts(quizData || []);
        } catch (err) {
            console.error("Error fetching user progress:", err.message);
            setUserProgress([]);
            setUserQuizAttempts([]);
        } finally {
            setLoadingProgress(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'canceled' : 'active';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ membership_status: newStatus })
                .eq('id', userId);

            if (error) throw error;
            await fetchUsers();
        } catch (err) {
            alert("Error updating status: " + err.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group progress by module
    const getModuleGroupedProgress = () => {
        const modules = {};
        userProgress.forEach(p => {
            const moduleId = p.lessons?.module_id || 'unknown';
            const moduleTitle = p.lessons?.modules?.title || `Module ${moduleId}`;
            if (!modules[moduleId]) {
                modules[moduleId] = { title: moduleTitle, lessons: [], completed: 0, total: 0 };
            }
            modules[moduleId].lessons.push(p);
            modules[moduleId].total++;
            if (p.status === 'completed') modules[moduleId].completed++;
        });
        return Object.values(modules);
    };

    // Get last activity time
    const getLastActive = () => {
        if (userProgress.length === 0) return null;
        const dates = userProgress
            .map(p => p.updated_at || p.created_at)
            .filter(Boolean)
            .sort((a, b) => new Date(b) - new Date(a));
        return dates[0] || null;
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Never';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const fetchTickets = async () => {
        setTicketsLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setSupportTickets((data || []).map(t => ({
                id: t.id,
                student: t.student_name,
                issue: t.issue,
                description: t.description,
                pageUrl: t.page_url,
                generatedPrompt: t.generated_prompt || `# Role: Dev\n# Bug: ${t.issue}\n# Context: ${t.description || 'No details provided.'}\n# Page: ${t.page_url || 'Unknown'}`,
                status: t.status,
                timestamp: t.created_at,
                userId: t.user_id
            })));
        } catch (err) {
            console.error('Error fetching tickets:', err.message);
        } finally {
            setTicketsLoading(false);
        }
    };

    const handleCopyPrompt = async (id, prompt) => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleResolveTicket = async (id) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: profile?.id })
                .eq('id', id);
            if (error) throw error;
            setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
            if (expandedTicket === id) setExpandedTicket(null);
        } catch (err) {
            console.error('Error resolving ticket:', err.message);
        }
    };

    const handleReopenTicket = async (id) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: 'open', resolved_at: null, resolved_by: null })
                .eq('id', id);
            if (error) throw error;
            setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'open' } : t));
        } catch (err) {
            console.error('Error reopening ticket:', err.message);
        }
    };

    const filteredTickets = supportTickets.filter(t => {
        if (ticketFilter === 'all') return true;
        return t.status === ticketFilter;
    });

    const adminName = profile?.role === 'admin' ? 'Admin' : (profile?.full_name?.split(' ')[0] || 'Student');

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 bg-[#070A12] min-h-screen text-white relative">
            {/* =================== STUDENT DETAIL MODAL =================== */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-3xl bg-[#0A0F18] border-accent-secondary/30 relative overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 p-6 z-10">
                                <button onClick={() => setSelectedUser(null)} className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="h-4 w-4 text-text-muted" />
                                </button>
                            </div>

                            <div className="p-10">
                                {/* Header */}
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20 flex items-center justify-center font-black text-white italic text-3xl shadow-lg border border-white/5">
                                        {selectedUser.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-accent-secondary uppercase tracking-widest mb-2 italic">Student Profile</div>
                                        <h2 className="text-3xl font-black text-white italic mb-1">{selectedUser.full_name || 'New Member'}</h2>
                                        <p className="text-sm text-text-muted font-mono">{selectedUser.email}</p>
                                        {selectedUser.phone && <p className="text-sm text-text-muted font-mono mt-1">📱 {selectedUser.phone}</p>}
                                    </div>
                                </div>

                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Status</div>
                                        <div className={`text-sm font-black italic ${selectedUser.membership_status === 'active' ? 'text-green-400' : selectedUser.membership_status === 'beta' ? 'text-blue-400' : 'text-red-500'}`}>
                                            {selectedUser.membership_status?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Lessons Done</div>
                                        <div className="text-sm font-black text-accent-secondary italic">
                                            {userProgress.filter(p => p.status === 'completed').length}/{userProgress.length}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Quiz Attempts</div>
                                        <div className="text-sm font-black text-white italic">
                                            {userQuizAttempts.length}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
                                        <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Last Active</div>
                                        <div className="text-sm font-black text-white italic">
                                            {formatTimeAgo(getLastActive())}
                                        </div>
                                    </div>
                                </div>

                                {/* Module-Grouped Progress */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 italic flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-accent-primary" />
                                        Progress by Module
                                    </h3>
                                    <div className="space-y-4">
                                        {loadingProgress ? (
                                            <div className="py-8 text-center">
                                                <RefreshCcw className="h-5 w-5 animate-spin mx-auto text-text-muted mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Scanning Progress...</span>
                                            </div>
                                        ) : userProgress.length === 0 ? (
                                            <div className="p-8 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center">
                                                <p className="text-xs text-text-muted italic">No lessons started yet.</p>
                                            </div>
                                        ) : getModuleGroupedProgress().map((mod, modIdx) => (
                                            <div key={modIdx} className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                                                {/* Module Header */}
                                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${mod.completed === mod.total ? 'bg-green-500/20' : 'bg-accent-secondary/10'}`}>
                                                            {mod.completed === mod.total ? (
                                                                <Award className="h-4 w-4 text-green-400" />
                                                            ) : (
                                                                <BookOpen className="h-4 w-4 text-accent-secondary" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-black text-white italic">{mod.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary rounded-full"
                                                                style={{ width: `${mod.total > 0 ? (mod.completed / mod.total) * 100 : 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-accent-secondary italic">{mod.completed}/{mod.total}</span>
                                                    </div>
                                                </div>
                                                {/* Lessons */}
                                                <div className="divide-y divide-white/5">
                                                    {mod.lessons.map((p, idx) => (
                                                        <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-2 w-2 rounded-full ${p.status === 'completed' ? 'bg-green-400 shadow-[0_0_6px_#4ADE80]' : p.status === 'in_progress' ? 'bg-yellow-400 shadow-[0_0_6px_#FACC15]' : 'bg-white/20'}`} />
                                                                <span className="text-xs text-white/80 italic">{p.lessons?.title || `Lesson ${p.lesson_id}`}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[9px] text-text-muted uppercase tracking-widest font-bold">{p.status}</span>
                                                                {p.quiz_score > 0 && (
                                                                    <span className={`text-xs font-black italic ${p.quiz_score >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                                                                        {p.quiz_score}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Quiz Activity */}
                                {userQuizAttempts.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 italic flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-accent-secondary" />
                                            Recent Quiz Activity
                                        </h3>
                                        <div className="space-y-2">
                                            {userQuizAttempts.slice(0, 5).map((attempt, idx) => (
                                                <div key={idx} className="bg-white/[0.02] px-4 py-3 rounded-xl border border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-black ${attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {attempt.passed ? '✓' : '✗'}
                                                        </div>
                                                        <span className="text-xs text-white/80 italic">Lesson {attempt.lesson_id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-xs font-black italic ${attempt.score >= 80 ? 'text-green-400' : 'text-orange-400'}`}>{attempt.score}%</span>
                                                        <span className="text-[9px] text-text-muted">{formatTimeAgo(attempt.created_at)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-8 border-t border-white/10 flex gap-4">
                                    <button
                                        onClick={() => {
                                            alert(`Password reset link sent to ${selectedUser.email}`);
                                        }}
                                        className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic text-white"
                                    >
                                        Reset Password
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(selectedUser.id, selectedUser.membership_status)}
                                        className={`flex-1 py-4 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${selectedUser.membership_status === 'active' ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
                                    >
                                        {selectedUser.membership_status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* =================== HEADER =================== */}
            <div className="mb-12">
                <span className="text-accent-secondary font-black tracking-widest text-[10px] uppercase mb-4 block italic">ADMIN COMMAND CENTER</span>
                <h1 className="text-5xl lg:text-7xl font-black title-gradient leading-tight italic">
                    Welcome back,<br />
                    <span className="text-white">{adminName}.</span>
                </h1>
            </div>

            {/* =================== 4-CARD KPI ROW =================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Card 1: Total Enrolled */}
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Users className="text-blue-400 h-4 w-4" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Total Enrolled</h3>
                    </div>
                    <div className="text-4xl font-black italic mb-2">{stats.total}</div>
                    <div className="text-[10px] text-text-muted italic font-bold tracking-wide">
                        {stats.tierBreakdown.free} Free · {stats.tierBreakdown.pro} Pro · {stats.tierBreakdown.plus} Plus
                    </div>
                </div>

                {/* Card 2: Monthly Revenue (MRR) */}
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <DollarSign className="text-green-400 h-4 w-4" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Monthly Revenue</h3>
                    </div>
                    <div className="text-4xl font-black italic text-green-400">{stats.revenue}</div>
                    <div className="text-[10px] text-text-muted italic font-bold tracking-wide">MRR · Pro $49 + Plus $99</div>
                </div>

                {/* Card 3: LLM API Costs */}
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Cpu size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Cpu className="text-orange-400 h-4 w-4" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Infra Costs</h3>
                    </div>
                    <div className="text-4xl font-black italic text-orange-400">${totalCosts.toFixed(2)}</div>
                    <div className="text-[10px] text-text-muted italic font-bold tracking-wide">Fixed ${totalFixed} + Variable ${totalVariable}</div>
                </div>

                {/* Card 4: Net Margin */}
                <div className="glass-card p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={100} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <BarChart3 className="text-purple-400 h-4 w-4" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Net Margin</h3>
                    </div>
                    <div className={`text-4xl font-black italic ${netMarginValue >= 0 ? 'text-purple-400' : 'text-red-400'}`}>{netMarginValue >= 0 ? '+' : ''}${netMarginValue.toFixed(2)}</div>
                    <div className="text-[10px] text-text-muted italic font-bold tracking-wide">Revenue − API Costs</div>
                </div>
            </div>

            {/* =================== USER TABLE =================== */}
            <div className="glass-card border-white/5 overflow-hidden bg-white/[0.01] mb-12">
                <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3 mb-2">
                            <Shield className="text-accent-secondary h-6 w-6" />
                            Student Management
                        </h2>
                        <p className="text-xs text-text-muted italic">Click on a student to see their detailed progress and activity.</p>
                    </div>
                    <div className="flex gap-4 max-w-md w-full">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-accent-secondary/30 transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                            title="Refresh"
                        >
                            <RefreshCcw className={`h-5 w-5 text-text-muted group-hover:text-white transition-colors ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-text-muted border-b border-white/5">
                                <th className="px-10 py-6 italic">Student</th>
                                <th className="px-10 py-6 italic">Role</th>
                                <th className="px-10 py-6 italic">Status</th>
                                <th className="px-10 py-6 italic">Joined</th>
                                <th className="px-10 py-6 text-right italic">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent-secondary mx-auto mb-4"></div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted animate-pulse">Scanning Profiles...</div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-10 py-24 text-center">
                                        <div className="text-text-muted italic opacity-50">
                                            {users.length === 0 ? 'No students enrolled yet. Run the 009_profiles migration in Supabase.' : 'No profiles matched your search.'}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.map(user => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-white/[0.05] transition-all group cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20 flex items-center justify-center font-black text-white italic text-lg shadow-lg border border-white/5">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-base font-black text-white mb-1 italic">{user.full_name || 'New Member'}</div>
                                                <div className="text-[10px] text-text-muted font-bold tracking-widest truncate max-w-[200px]">{user.email || user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] italic border ${user.role === 'admin' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' : 'bg-white/5 text-text-muted border-white/10'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${user.membership_status === 'active' ? 'bg-green-500/5 border-green-500/10 text-green-400' : user.membership_status === 'beta' ? 'bg-blue-500/5 border-blue-500/10 text-blue-400' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${user.membership_status === 'active' ? 'bg-green-400 shadow-[0_0_8px_#4ADE80]' : user.membership_status === 'beta' ? 'bg-blue-400 shadow-[0_0_8px_#60A5FA]' : 'bg-red-500'}`}></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">{user.membership_status}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="text-[10px] text-text-muted italic">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Member'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleStatus(user.id, user.membership_status);
                                                }}
                                                className={`p-2.5 rounded-xl transition-all border ${user.membership_status === 'active' ? 'hover:bg-red-500/10 text-text-muted hover:text-red-400 border-transparent hover:border-red-500/20' : 'hover:bg-green-500/10 text-text-muted hover:text-green-400 border-transparent hover:border-green-500/20'}`}
                                                title={user.membership_status === 'active' ? 'Suspend' : 'Reactivate'}
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted hover:text-accent-secondary transition-all border border-transparent hover:border-accent-secondary/20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser(user);
                                                }}
                                                title="View Details"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =================== FINANCIAL COMMAND CENTER =================== */}
            <div className="glass-card border-amber-500/20 bg-amber-500/[0.01] relative overflow-hidden mb-12">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/5 blur-[120px] rounded-full"></div>
                <button
                    onClick={() => setShowCosts(!showCosts)}
                    className="w-full p-10 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Wallet className="text-amber-400 h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black italic uppercase tracking-tight text-white">Financial Command Center</h2>
                            <p className="text-[10px] text-text-muted italic font-bold tracking-wide mt-1">Real infrastructure costs · Click any amount to update</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Total Monthly</div>
                            <div className="text-2xl font-black text-amber-400">${totalCosts.toFixed(2)}</div>
                        </div>
                        {showCosts ? <ChevronUp className="h-5 w-5 text-text-muted" /> : <ChevronDown className="h-5 w-5 text-text-muted" />}
                    </div>
                </button>

                {showCosts && (
                    <div className="px-10 pb-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Fixed Costs */}
                            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Fixed Costs</span>
                                    <span className="text-sm font-black text-white italic">${totalFixed.toFixed(2)}/mo</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {costs.fixed.map(item => (
                                        <div key={item.id} className="px-5 py-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-7 w-7 rounded-lg ${getColorClasses(item.color)} flex items-center justify-center`}>
                                                    {getCostIcon(item.icon)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white italic">{item.name}</div>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-text-muted italic hover:text-accent-secondary transition-colors inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        {item.plan} <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingCost === `fixed-${item.id}` ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-text-muted">$</span>
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleCostSave('fixed', item.id)}
                                                            className="w-16 bg-white/10 border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleCostSave('fixed', item.id)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                                                            <Check className="h-3 w-3 text-green-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-black text-white italic">${item.cost}</span>
                                                        <button
                                                            onClick={() => handleCostEdit('fixed', item.id)}
                                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-md transition-all"
                                                        >
                                                            <Pencil className="h-3 w-3 text-text-muted" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Variable Costs */}
                            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Variable Costs</span>
                                    <span className="text-sm font-black text-white italic">${totalVariable.toFixed(2)}/mo</span>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {costs.variable.map(item => (
                                        <div key={item.id} className="px-5 py-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-7 w-7 rounded-lg ${getColorClasses(item.color)} flex items-center justify-center`}>
                                                    {getCostIcon(item.icon)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white italic">{item.name}</div>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[9px] text-text-muted italic hover:text-accent-secondary transition-colors inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        {item.plan} <ExternalLink className="h-2.5 w-2.5" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editingCost === `variable-${item.id}` ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-text-muted">$</span>
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleCostSave('variable', item.id)}
                                                            className="w-16 bg-white/10 border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleCostSave('variable', item.id)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                                                            <Check className="h-3 w-3 text-green-400" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-black text-white italic">${item.cost}</span>
                                                        <button
                                                            onClick={() => handleCostEdit('variable', item.id)}
                                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-md transition-all"
                                                        >
                                                            <Pencil className="h-3 w-3 text-text-muted" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-6">
                                {/* Profit/Loss Card */}
                                <div className={`rounded-2xl border p-6 ${netMarginValue >= 0 ? 'bg-green-500/[0.03] border-green-500/10' : 'bg-red-500/[0.03] border-red-500/10'}`}>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-3">Monthly P&L</div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-text-muted italic">Revenue (MRR)</span>
                                            <span className="text-sm font-black text-green-400 italic">${mrrValue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-text-muted italic">Total Costs</span>
                                            <span className="text-sm font-black text-red-400 italic">-${totalCosts.toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-white/10"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-white italic">Net Margin</span>
                                            <span className={`text-lg font-black italic ${netMarginValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {netMarginValue >= 0 ? '+' : ''}${netMarginValue.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Margin bar */}
                                    <div className="mt-4">
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${netMarginValue >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
                                                style={{ width: `${mrrValue > 0 ? Math.min(100, Math.max(5, ((mrrValue - totalCosts) / mrrValue) * 100)) : 0}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-[8px] text-text-muted">Costs</span>
                                            <span className="text-[8px] text-text-muted">{mrrValue > 0 ? Math.round(((mrrValue - totalCosts) / mrrValue) * 100) : 0}% margin</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Breakeven */}
                                <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-3">Breakeven Point</div>
                                    <div className="text-3xl font-black text-amber-400 italic mb-1">{breakeven} <span className="text-sm text-text-muted">students</span></div>
                                    <div className="text-[10px] text-text-muted italic">at $49/mo Pro plan to cover ${totalCosts.toFixed(0)}/mo costs</div>
                                </div>

                                {/* Scale Projections */}
                                <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted italic mb-3">Revenue Projections</div>
                                    <div className="space-y-2">
                                        {[{ students: 10, label: '10 paid' }, { students: 25, label: '25 paid' }, { students: 50, label: '50 paid' }, { students: 100, label: '100 paid' }].map(tier => {
                                            const rev = tier.students * 49;
                                            const estCost = totalFixed + (tier.students * 2);
                                            return (
                                                <div key={tier.students} className="flex items-center justify-between">
                                                    <span className="text-[10px] text-text-muted italic w-16">{tier.label}</span>
                                                    <div className="flex-1 mx-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-amber-500 to-green-400 rounded-full" style={{ width: `${Math.min(100, (rev / (100 * 49)) * 100)}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-green-400 italic w-20 text-right">+${(rev - estCost).toLocaleString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* =================== BOTTOM ROW: INFRA + SUPPORT =================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Infrastructure */}
                <div className="glass-card p-12 border-accent-secondary/20 relative overflow-hidden bg-white/[0.01]">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accent-secondary/5 blur-[100px] rounded-full"></div>
                    <h3 className="text-xl font-black mb-8 italic uppercase tracking-tight text-white flex items-center gap-3">
                        <Bot className="text-accent-secondary h-5 w-5" />
                        Infrastructure
                    </h3>
                    <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                            <span className="text-xs text-text-muted italic font-bold">Database Engine</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-400">SUPABASE: ONLINE</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                            <span className="text-xs text-text-muted italic font-bold">Automation Node</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">N8N: READY</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
                            <span className="text-xs text-text-muted italic font-bold">Video Engine</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">NOTEBOOKLM: ACTIVE</span>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">RUN DIAGNOSTIC SCAN</button>
                </div>

                {/* Bug-to-Prompt Inbox */}
                <div className="glass-card p-12 border-emerald-500/20 bg-emerald-500/[0.01] relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full"></div>

                    {/* Header + Filter */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
                            <Inbox className="text-emerald-400 h-5 w-5" />
                            Bug-to-Prompt Inbox
                        </h3>
                        <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl border border-white/5 p-1">
                            {['open', 'resolved', 'all'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setTicketFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${ticketFilter === f
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-text-muted hover:text-white border border-transparent'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ticket Count */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`h-2 w-2 rounded-full ${filteredTickets.length > 0 ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-white/20'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Ticket List */}
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#34D39930 transparent' }}>
                        {filteredTickets.length === 0 ? (
                            <div className="py-12 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                                <CheckCircle className="h-8 w-8 text-emerald-500/30 mx-auto mb-3" />
                                <p className="text-xs text-text-muted italic">No {ticketFilter !== 'all' ? ticketFilter : ''} tickets. All clear!</p>
                            </div>
                        ) : filteredTickets.map(ticket => (
                            <motion.div
                                key={ticket.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className={`bg-black/30 rounded-2xl border transition-all ${ticket.status === 'resolved'
                                    ? 'border-white/5 opacity-60'
                                    : 'border-emerald-500/10 hover:border-emerald-500/20'
                                    }`}
                            >
                                {/* Ticket Header — clickable */}
                                <button
                                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ticket.status === 'resolved'
                                            ? 'bg-green-500/10'
                                            : 'bg-red-500/10'
                                            }`}>
                                            {ticket.status === 'resolved'
                                                ? <CheckCircle className="h-4 w-4 text-green-400" />
                                                : <Bug className="h-4 w-4 text-red-400" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs font-black text-white italic truncate">{ticket.student}</div>
                                            <div className="text-[10px] text-text-muted italic truncate">{ticket.issue}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className="text-[9px] text-text-muted italic hidden sm:inline">
                                            {new Date(ticket.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform duration-200 ${expandedTicket === ticket.id ? 'rotate-180' : ''
                                            }`} />
                                    </div>
                                </button>

                                {/* Expanded Payload */}
                                <AnimatePresence>
                                    {expandedTicket === ticket.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5">
                                                {/* Code Block */}
                                                <pre className="bg-gray-950 border border-emerald-500/10 rounded-xl p-4 font-mono text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap overflow-x-auto mb-4">
                                                    {ticket.generatedPrompt}
                                                </pre>

                                                {/* Actions */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleCopyPrompt(ticket.id, ticket.generatedPrompt); }}
                                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${copiedId === ticket.id
                                                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                                            : 'bg-white/5 border-white/10 text-text-muted hover:text-white hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {copiedId === ticket.id
                                                            ? <><ClipboardCheck className="h-3.5 w-3.5" /> Copied!</>
                                                            : <><Copy className="h-3.5 w-3.5" /> Copy Prompt</>
                                                        }
                                                    </button>
                                                    {ticket.status === 'open' ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleResolveTicket(ticket.id); }}
                                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/15"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" /> Mark Resolved
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleReopenTicket(ticket.id); }}
                                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border bg-orange-500/5 border-orange-500/20 text-orange-400 hover:bg-orange-500/15"
                                                        >
                                                            <RefreshCcw className="h-3.5 w-3.5" /> Reopen
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
