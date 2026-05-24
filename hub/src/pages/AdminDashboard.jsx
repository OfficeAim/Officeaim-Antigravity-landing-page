import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ShieldCheck, Power, Search, AlertTriangle, TrendingUp, Bot, Sparkles, RefreshCcw, BookOpen, Clock, MessageSquare, Send, ChevronRight, X, Activity, Award, HeadphonesIcon, DollarSign, Cpu, BarChart3, Wallet, Pencil, Check, ChevronDown, ChevronUp, Globe, Server, Zap, Mail, ExternalLink, Copy, CheckCircle, Inbox, Bug, ClipboardCheck } from 'lucide-react';
import MascotAssistant from '../components/MascotAssistant';

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

    const [activeTab, setActiveTab] = useState('dashboard');

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

            const dataList = data || [];
            const localFallback = JSON.parse(localStorage.getItem('officeaim_profiles_fallback') || '{}');
            const userList = dataList.map(u => ({
                ...u,
                language: u.language || localFallback[u.id]?.language || 'english',
                country: u.country || localFallback[u.id]?.country || ''
            }));
            setUsers(userList);
            console.log('Students:', userList.length, '| Profiles:', userList.map(u => u.full_name || u.email));

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

    const updateStudentLanguageAndCountry = async (userId, newLang, newCountry) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ language: newLang, country: newCountry })
                .eq('id', userId);

            if (error) {
                console.warn("Database update failed (could be missing columns). Applying local storage fallback.", error.message);
                const localFallback = JSON.parse(localStorage.getItem('officeaim_profiles_fallback') || '{}');
                localFallback[userId] = { language: newLang, country: newCountry };
                localStorage.setItem('officeaim_profiles_fallback', JSON.stringify(localFallback));
                
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, language: newLang, country: newCountry } : u));
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser(prev => ({ ...prev, language: newLang, country: newCountry }));
                }
                return;
            }
            
            await fetchUsers();
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(prev => ({ ...prev, language: newLang, country: newCountry }));
            }
        } catch (err) {
            console.error("Error updating profile language/country:", err);
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
        <div className="flex bg-[#070A12] h-screen w-full overflow-hidden text-white font-sans text-sm">

            {/* =================== STUDENT DETAIL MODAL =================== */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0B1220] border border-accent-secondary/30 relative overflow-hidden max-h-[90vh] overflow-y-auto w-full max-w-2xl rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 p-4 z-10">
                                <button onClick={() => setSelectedUser(null)} className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="h-3 w-3 text-text-muted" />
                                </button>
                            </div>
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20 flex items-center justify-center font-black text-white italic text-xl shadow-lg border border-white/5">
                                        {selectedUser.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-accent-secondary uppercase tracking-widest mb-1 italic">Student Profile</div>
                                        <h2 className="text-xl font-black text-white italic mb-0.5">{selectedUser.full_name || 'New Member'}</h2>
                                        <p className="text-xs text-text-muted font-mono">{selectedUser.email}</p>
                                    </div>
                                </div>
                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-4 gap-3 mb-6">
                                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Status</div>
                                        <div className={`text-xs font-black italic ${selectedUser.membership_status === 'active' ? 'text-green-400' : selectedUser.membership_status === 'beta' ? 'text-blue-400' : 'text-red-500'}`}>
                                            {selectedUser.membership_status?.toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Lessons</div>
                                        <div className="text-xs font-black text-accent-secondary italic">
                                            {userProgress.filter(p => p.status === 'completed').length}/{userProgress.length}
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Quizzes</div>
                                        <div className="text-xs font-black text-white italic">{userQuizAttempts.length}</div>
                                    </div>
                                    <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5 text-center">
                                        <div className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Last Active</div>
                                        <div className="text-xs font-black text-white italic">{formatTimeAgo(getLastActive())}</div>
                                    </div>
                                </div>
                                {/* Progress */}
                                <div className="mb-6">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 italic flex items-center gap-2">
                                        <BookOpen className="h-3 w-3 text-accent-primary" /> Progress
                                    </h3>
                                    {loadingProgress ? (
                                        <div className="py-4 text-center"><RefreshCcw className="h-4 w-4 animate-spin mx-auto text-text-muted mb-1" /></div>
                                    ) : (
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff10 transparent' }}>
                                            {getModuleGroupedProgress().map((mod, modIdx) => (
                                                <div key={modIdx} className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
                                                    <div className="p-2.5 border-b border-white/5 flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-white italic truncate max-w-[150px]">{mod.title}</span>
                                                        <span className="text-[9px] font-black text-accent-secondary italic">{mod.completed}/{mod.total}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Preferred Language & Location */}
                                <div className="mb-6 pt-4 border-t border-white/5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 italic flex items-center gap-2">
                                        <Globe className="h-3 w-3 text-accent-secondary" /> Localization (Onboarding Preview)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 bg-white/[0.01] p-4 rounded-xl border border-white/5">
                                        <div>
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block mb-1">Preferred Language</label>
                                            <select 
                                                value={selectedUser.language || 'english'} 
                                                onChange={(e) => updateStudentLanguageAndCountry(selectedUser.id, e.target.value, selectedUser.country || '')}
                                                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-accent-secondary/50"
                                            >
                                                <option value="english">English 🇬🇧</option>
                                                <option value="spanish">Spanish 🇪🇸</option>
                                                <option value="dutch">Dutch 🇳🇱</option>
                                                <option value="portuguese">Portuguese 🇧🇷</option>
                                                <option value="french">French 🇫🇷</option>
                                                <option value="german">German 🇩🇪</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-wider block mb-1">Country / Location</label>
                                            <input 
                                                type="text" 
                                                value={selectedUser.country || ''} 
                                                onChange={(e) => updateStudentLanguageAndCountry(selectedUser.id, selectedUser.language || 'english', e.target.value)}
                                                placeholder="e.g. Netherlands, Spain"
                                                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-accent-secondary/50 placeholder:text-white/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="pt-4 border-t border-white/10 flex gap-3">
                                    <button onClick={() => toggleStatus(selectedUser.id, selectedUser.membership_status)} className={`flex-1 py-2.5 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic ${selectedUser.membership_status === 'active' ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                                        {selectedUser.membership_status === 'active' ? 'Suspend' : 'Reactivate'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* =================== SIDEBAR (LEFT) =================== */}
            <div className="w-[220px] bg-[#0f1117] flex flex-col h-full border-r border-white/5 flex-shrink-0 z-10">
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center">
                            <Shield className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h1 className="text-md font-black tracking-tight text-white italic uppercase">AIM Command Center</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    <div className="mb-4">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest px-3 italic">Main</span>
                        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl font-bold text-xs transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white border border-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                            <BarChart3 className="h-4 w-4" /> Dashboard
                        </button>
                    </div>

                    <div className="mb-4">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest px-3 italic">Management</span>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl font-bold text-xs transition-all ${activeTab === 'users' ? 'bg-white/10 text-white border border-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                            <Users className="h-4 w-4" /> Users
                        </button>
                        <button onClick={() => setActiveTab('revenue')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'revenue' ? 'bg-white/10 text-white border border-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                            <DollarSign className="h-4 w-4" /> Revenue
                        </button>
                    </div>

                    <div className="mb-4">
                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest px-3 italic">Operations</span>
                        <button onClick={() => setActiveTab('support')} className={`w-full flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl font-bold text-xs transition-all ${activeTab === 'support' ? 'bg-white/10 text-white border border-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                            <div className="flex items-center gap-3"><HeadphonesIcon className="h-4 w-4" /> Support</div>
                            <div className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md font-black">{supportTickets.filter(t => t.status === 'open').length}</div>
                        </button>
                        <button onClick={() => setActiveTab('infra')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'infra' ? 'bg-white/10 text-white border border-white/5' : 'text-text-muted hover:text-white hover:bg-white/5'}`}>
                            <Server className="h-4 w-4" /> Infra Config
                        </button>
                    </div>
                </nav>

                <div className="p-5 border-t border-white/5 mt-auto bg-black/20">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ADE80] animate-pulse"></div>
                        <span className="text-[9px] uppercase tracking-widest font-black text-white/70 italic">System Operational</span>
                    </div>
                </div>
            </div>

            {/* =================== MAIN CONTENT (RIGHT) =================== */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative">

                {/* Header Area Row */}
                <div className="flex justify-between items-end flex-shrink-0">
                    <div>
                        <span className="text-accent-secondary font-black tracking-widest text-[9px] uppercase mb-0.5 block italic">Command Center</span>
                        <h2 className="text-2xl font-black title-gradient leading-tight italic">
                            Welcome, <span className="text-white">{adminName}</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchUsers} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white">
                            <RefreshCcw className={`h-3.5 w-3.5 transition-colors ${loading ? 'animate-spin text-white' : ''}`} /> Refresh Data
                        </button>
                    </div>
                </div>

                {/* TOP ROW: 4 KPI Cards (Grid) */}
                {(activeTab === 'dashboard' || activeTab === 'revenue') && (
                    <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                        {/* ENROLLED */}
                        <div className="bg-[#0B1220] border border-white/5 rounded-xl p-4 flex flex-col justify-center h-[110px] relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={60} /></div>
                            <div className="flex justify-between items-start mb-2 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Users className="text-blue-400 h-3 w-3" /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Enrolled</span>
                                </div>
                            </div>
                            <div className="text-2xl font-black italic z-10">{stats.total}</div>
                            <div className="text-[9px] text-text-muted italic font-bold tracking-wide z-10 mt-0.5">
                                {stats.tierBreakdown.free} Free · {stats.tierBreakdown.pro} Pro · {stats.tierBreakdown.plus} Plus
                            </div>
                        </div>

                        {/* MRR */}
                        <div className="bg-[#0B1220] border border-white/5 rounded-xl p-4 flex flex-col justify-center h-[110px] relative overflow-hidden group hover:border-green-500/30 transition-colors">
                            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={60} /></div>
                            <div className="flex justify-between items-start mb-2 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20"><DollarSign className="text-green-400 h-3 w-3" /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">MRR</span>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-green-400 italic z-10">{stats.revenue}</div>
                            <div className="text-[9px] text-text-muted italic font-bold tracking-wide z-10 mt-0.5">Recurring Monthly</div>
                        </div>

                        {/* INFRA COSTS */}
                        <div className="bg-[#0B1220] border border-white/5 rounded-xl p-4 flex flex-col justify-center h-[110px] relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity"><Cpu size={60} /></div>
                            <div className="flex justify-between items-start mb-2 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><Cpu className="text-orange-400 h-3 w-3" /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Infra Costs</span>
                                </div>
                            </div>
                            <div className="text-2xl font-black text-orange-400 italic z-10">${totalCosts.toFixed(2)}</div>
                            <div className="text-[9px] text-text-muted italic font-bold tracking-wide z-10 mt-0.5">Fixed ${totalFixed} + Variable ${totalVariable}</div>
                        </div>

                        {/* NET MARGIN */}
                        <div className="bg-[#0B1220] border border-white/5 rounded-xl p-4 flex flex-col justify-center h-[110px] relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                            <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={60} /></div>
                            <div className="flex justify-between items-start mb-2 z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><BarChart3 className="text-purple-400 h-3 w-3" /></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Net Margin</span>
                                </div>
                            </div>
                            <div className={`text-2xl font-black italic z-10 ${netMarginValue >= 0 ? 'text-purple-400' : 'text-red-400'}`}>{netMarginValue >= 0 ? '+' : ''}${netMarginValue.toFixed(2)}</div>
                            <div className="text-[9px] text-text-muted italic font-bold tracking-wide z-10 mt-0.5">MRR − Infra Costs</div>
                        </div>
                    </div>
                )}

                {/* MIDDLE ROW: 2 Columns */}
                <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">

                    {/* LEFT COL (60%): User List */}
                    {(activeTab === 'dashboard' || activeTab === 'users') && (
                        <div className="w-[60%] flex flex-col bg-[#0B1220] border border-white/5 rounded-xl overflow-hidden shadow-lg h-full">
                            <div className="p-3 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-white/[0.02]">
                                <h3 className="text-xs font-black uppercase tracking-tight flex items-center gap-2 italic">
                                    <Users className="h-3 w-3 text-accent-secondary" /> Students Directory
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search emails..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-black/30 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-[10px] font-mono focus:outline-none focus:border-accent-secondary/50 transition-colors w-48 text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffffff10 transparent' }}>
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-[#0B1220] z-10 shadow-sm border-b border-white/5">
                                        <tr className="text-[8px] font-black uppercase tracking-[0.15em] text-text-muted">
                                            <th className="px-4 py-2 italic font-bold">Member</th>
                                            <th className="px-4 py-2 italic font-bold">Tier</th>
                                            <th className="px-4 py-2 text-right italic font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {loading ? (
                                            <tr><td colSpan="3" className="px-4 py-8 text-center text-xs text-text-muted">Loading...</td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan="3" className="px-4 py-8 text-center text-xs text-text-muted">No students found.</td></tr>
                                        ) : filteredUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 cursor-pointer transition-colors group" onClick={() => setSelectedUser(user)}>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 flex items-center justify-center text-xs font-black border border-white/10 group-hover:border-accent-secondary/30 transition-colors italic shadow-inner">
                                                            {user.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-black text-white italic truncate max-w-[150px]">{user.full_name || 'Anonymous User'}</div>
                                                            <div className="text-[9px] text-text-muted font-mono truncate max-w-[180px]">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm italic border ${user.role === 'admin' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' : 'bg-white/5 text-text-muted border-white/10'}`}>
                                                        {user.role === 'admin' ? 'ADMIN' : (user.subscription_tier || 'FREE')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/5 px-2 py-0.5 rounded-sm">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${user.membership_status === 'active' ? 'bg-green-400' : user.membership_status === 'beta' ? 'bg-blue-400' : 'bg-red-500'}`}></div>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/80">{user.membership_status}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* RIGHT COL (40%): Financials, Infra, Bugs */}
                    {(activeTab === 'dashboard' || activeTab === 'revenue' || activeTab === 'support' || activeTab === 'infra') && (
                        <div className="w-[40%] flex flex-col gap-4 overflow-hidden h-full">

                            {/* Financial Analysis (Compact version of the Command Center) */}
                            {(activeTab === 'dashboard' || activeTab === 'revenue') && (
                                <div className="bg-[#0B1220] border border-amber-500/20 rounded-xl p-4 flex-shrink-0 relative overflow-hidden shadow-lg h-[160px] flex flex-col hover:border-amber-500/40 transition-colors">
                                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2 z-10">
                                        <h3 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-2 italic">
                                            <Wallet className="h-3 w-3 text-amber-500" /> Economics Config
                                        </h3>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 z-10" style={{ scrollbarWidth: 'none' }}>
                                        {/* Merge all costs into a single compact list to fit without scrolling natively if possible */}
                                        {[...costs.fixed, ...costs.variable].map(item => (
                                            <div key={item.id} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-4 w-4 rounded flex items-center justify-center ${getColorClasses(item.color)} text-[8px]`}>
                                                        {getCostIcon(item.icon)}
                                                    </div>
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/80 hover:text-white transition-colors truncate max-w-[120px]">
                                                        {item.name}
                                                    </a>
                                                </div>
                                                <span className="text-[10px] text-text-muted italic">${item.cost}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Infra Snapshot */}
                            {(activeTab === 'dashboard' || activeTab === 'infra') && (
                                <div className="bg-[#0B1220] border border-white/5 rounded-xl p-4 flex-shrink-0 shadow-lg relative overflow-hidden">
                                    <h3 className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-2 italic mb-3">
                                        <Activity className="h-3 w-3 text-blue-400" /> Engine Diagnostics
                                    </h3>
                                    <div className="space-y-2 relative z-10 w-full">
                                        <div className="flex justify-between items-center text-xs bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                            <span className="text-text-muted font-bold text-[10px]">Supabase Relational</span>
                                            <span className="text-[9px] font-black text-green-400">ONLINE</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                            <span className="text-text-muted font-bold text-[10px]">n8n Automation</span>
                                            <span className="text-[9px] font-black text-blue-400">READY</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                                            <span className="text-text-muted font-bold text-[10px]">Gemini Worker</span>
                                            <span className="text-[9px] font-black text-purple-400">ACTIVE</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Support Triage / Inbox Tracker */}
                            {(activeTab === 'dashboard' || activeTab === 'support') && (
                                <div className="bg-[#0B1220] border border-emerald-500/20 rounded-xl p-4 flex-1 shadow-lg relative overflow-hidden flex flex-col hover:border-emerald-500/40 transition-colors group">
                                    <div className="absolute right-0 bottom-0 pointer-events-none transition-transform group-hover:scale-110"><Inbox size={100} className="text-emerald-500/5 translate-x-1/4 translate-y-1/4" /></div>

                                    <h3 className="text-xs font-black uppercase tracking-tight text-white flex items-center justify-between italic mb-2 z-10">
                                        <div className="flex items-center gap-2">
                                            <Bug className="h-3 w-3 text-emerald-400" /> Triage Queue
                                        </div>
                                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">{supportTickets.filter(t => t.status === 'open').length} OPEN</span>
                                    </h3>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 z-10" style={{ scrollbarWidth: 'thin', scrollbarColor: '#34D39930 transparent' }}>
                                        {supportTickets.filter(t => t.status === 'open').length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full opacity-50">
                                                <CheckCircle className="h-6 w-6 text-emerald-400 mb-1" />
                                                <span className="text-[9px] uppercase font-black tracking-widest text-text-muted">Zero pending bugs</span>
                                            </div>
                                        ) : (
                                            supportTickets.filter(t => t.status === 'open').slice(0, 4).map(ticket => (
                                                <div key={ticket.id} className="bg-black/30 border border-emerald-500/10 rounded-lg p-2 flex items-center justify-between hover:bg-emerald-500/5 cursor-pointer">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[10px] font-black text-white italic truncate pr-2">{ticket.student}</div>
                                                        <div className="text-[9px] text-text-muted italic truncate pr-2">{ticket.issue}</div>
                                                    </div>
                                                    <div className="text-[8px] text-text-muted ml-1 shrink-0">
                                                        {formatTimeAgo(ticket.timestamp)}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {/* Mascot Assistant as Admin Coach */}
            <MascotAssistant profile={profile} isAdminDashboard={true} />
        </div>
    );
};

export default AdminDashboard;
