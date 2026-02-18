import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ShieldCheck, Power, Search, AlertTriangle, TrendingUp, Bot, Sparkles, RefreshCcw, BookOpen, Clock, MessageSquare, Send, ChevronRight, X, Activity, Award, HeadphonesIcon } from 'lucide-react';

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
        totalLessonsCompleted: 0
    });

    // Student detail modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProgress, setUserProgress] = useState([]);
    const [userQuizAttempts, setUserQuizAttempts] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // Support agent
    const [supportMessage, setSupportMessage] = useState('');
    const [supportLog, setSupportLog] = useState([
        { type: 'system', text: 'Support Agent initialized. Ready to assist students.', time: new Date().toISOString() }
    ]);

    useEffect(() => {
        fetchUsers();
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

            setStats({
                total: userList.length,
                active,
                canceled,
                completionRate: `${rate}%`,
                revenue: `$${active * 49}`,
                totalLessonsCompleted: completedCount
            });
        } catch (err) {
            console.error("Error fetching users:", err.message);
            setUsers([]);
            setStats({ total: 0, active: 0, canceled: 0, completionRate: '0%', revenue: '$0', totalLessonsCompleted: 0 });
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

    const handleSupportSend = () => {
        if (!supportMessage.trim()) return;
        setSupportLog(prev => [...prev,
        { type: 'admin', text: supportMessage, time: new Date().toISOString() },
        { type: 'system', text: `Message queued. Support ticket created for review.`, time: new Date().toISOString() }
        ]);
        setSupportMessage('');
    };

    const adminName = profile?.full_name?.split(' ')[0] || 'Rody';

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
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-accent-secondary font-black tracking-widest text-[10px] uppercase mb-4 block italic">ADMIN COMMAND CENTER</span>
                    <h1 className="text-5xl lg:text-7xl font-black title-gradient leading-tight italic">
                        Welcome back,<br />
                        <span className="text-white">{adminName}.</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="glass-card px-8 py-5 border-white/5 bg-white/[0.02]">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Est. Revenue</div>
                        <div className="text-2xl font-black text-white">{stats.revenue}</div>
                    </div>
                    <div className="glass-card px-8 py-5 border-white/5 bg-white/[0.02]">
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 italic">Course Velocity</div>
                        <div className="text-2xl font-black text-cyan-400">{stats.completionRate}</div>
                    </div>
                </div>
            </div>

            {/* =================== STAT CARDS =================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="glass-card p-10 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={120} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="text-accent-primary h-5 w-5" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Total Enrolled</h3>
                    </div>
                    <div className="text-5xl font-black italic">{stats.total}</div>
                </div>

                <div className="glass-card p-10 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck className="text-green-400 h-5 w-5" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Active Access</h3>
                    </div>
                    <div className="text-5xl font-black italic text-green-400">{stats.active}</div>
                </div>

                <div className="glass-card p-10 border-white/5 bg-white/[0.01] relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-accent-secondary h-5 w-5" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-text-muted">Lessons Completed</h3>
                    </div>
                    <div className="text-5xl font-black italic">{stats.totalLessonsCompleted}</div>
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

                {/* Support Agent */}
                <div className="glass-card p-12 border-emerald-500/20 bg-emerald-500/[0.01] relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 blur-[100px] rounded-full"></div>
                    <h3 className="text-xl font-black mb-6 italic uppercase tracking-tight text-white flex items-center gap-3">
                        <HeadphonesIcon className="text-emerald-400 h-5 w-5" />
                        Support Agent
                    </h3>

                    {/* Chat Log */}
                    <div className="bg-black/30 rounded-2xl border border-white/5 mb-4 max-h-48 overflow-y-auto p-4 space-y-3">
                        {supportLog.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.type === 'admin' ? 'justify-end' : ''}`}>
                                {msg.type === 'system' && (
                                    <div className="h-6 w-6 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-3 w-3 text-emerald-400" />
                                    </div>
                                )}
                                <div className={`text-xs italic max-w-[80%] p-2.5 rounded-xl ${msg.type === 'admin' ? 'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20' : 'bg-white/[0.03] text-text-muted border border-white/5'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSupportSend()}
                            placeholder="Type a support note..."
                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500/30 transition-all"
                        />
                        <button
                            onClick={handleSupportSend}
                            className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-all"
                        >
                            <Send className="h-4 w-4 text-emerald-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
