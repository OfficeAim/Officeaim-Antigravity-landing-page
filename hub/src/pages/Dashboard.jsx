import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Trophy, Clock, Play, ChevronRight, TrendingUp, Bot, Users, Loader2, LogOut, Shield } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Dashboard = ({ profile }) => {
    const navigate = useNavigate();

    // FAILSAFE: If profile is missing, don't crash. Show loading or empty state.
    if (!profile) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#070A12] text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-secondary mx-auto mb-4"></div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest italic">Loading Student Profile...</p>
                </div>
            </div>
        );
    }

    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({ progress: 0, totalLessons: 0 });
    const [projects, setProjects] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [selectedCert, setSelectedCert] = useState(null);
    const [loadingCourses, setLoadingCourses] = useState(true);

    useEffect(() => {
        if (profile) {
            fetchData();
        } else {
            setLoadingCourses(false);
        }
    }, [profile]);

    const fetchData = async () => {
        try {
            setLoadingCourses(true);

            // 1. Fetch all modules
            const { data: modulesData } = await supabase
                .from('modules')
                .select('*')
                .order('order_index', { ascending: true });

            // 2. Fetch all lessons to count total
            const { data: lessonsData } = await supabase
                .from('lessons')
                .select('id, module_id');

            // 3. Fetch user progress
            let progressData = [];
            if (profile?.id) {
                const { data } = await supabase
                    .from('student_progress')
                    .select('*')
                    .eq('user_id', profile.id);
                progressData = data || [];
            }

            // 4. Calculate stats and map modules
            const completedLessons = progressData?.filter(p => p.status === 'completed').length || 0;
            setStats({
                progress: completedLessons,
                totalLessons: lessonsData?.length || 0
            });

            const mappedCourses = modulesData.map(m => {
                const moduleLessons = (lessonsData || []).filter(l => l.module_id === m.id);

                // DYNAMIC ACCESS LOGIC
                const isAdmin = profile?.role === 'admin';
                const isBeta = profile?.membership_status === 'beta';
                const isFreeModule = m.order_index <= 2;

                const isUnlocked = isAdmin || isBeta || isFreeModule;

                return {
                    id: m.id,
                    title: m.title,
                    badge: isFreeModule ? 'Free • Introductory' : 'Premium • Pilot',
                    progress: isUnlocked ? Math.min(100, Math.round((completedLessons / Math.max(1, moduleLessons.length)) * 100)) : 0,
                    lessons: moduleLessons.length,
                    status: isUnlocked ? 'In Progress' : 'Locked',
                    image: m.thumbnail_url || `/hub/images/module${m.id}_hero.png`
                };
            });

            setCourses(mappedCourses);

            // 5. Fetch projects from Neural Vault
            if (profile?.id) {
                const { data: projectsData } = await supabase
                    .from('saved_chats')
                    .select('*')
                    .eq('user_id', profile.id)
                    .order('updated_at', { ascending: false })
                    .limit(2);

                if (projectsData) setProjects(projectsData);
            }

            // 6. Fetch certificates
            if (profile?.id) {
                const { data: certsData } = await supabase
                    .from('student_certificates')
                    .select('*')
                    .eq('user_id', profile.id);

                if (certsData) setCertificates(certsData);
            }

        } catch (err) {
            console.error("Dashboard data fetch error (falling back to mock data):", err);
            // FAILSAFE MOCK DATA
            setCourses([
                { id: 1, title: 'AI Foundations', badge: 'Free • Introductory', progress: 65, lessons: 12, status: 'In Progress', image: '/hub/images/module1_hero.png' },
                { id: 2, title: 'Automation Masterclass', badge: 'Premium • Pilot', progress: 0, lessons: 8, status: 'Locked', image: '/hub/images/module2_hero.png' }
            ]);
            setStats({ progress: 45, totalLessons: 20 });
        } finally {
            setLoadingCourses(false);
        }
    };

    return (
        <div className="w-full h-full py-12 px-6 lg:px-8 bg-[#070A12] text-white">
            {/* DEBUG BANNER REMOVED FOR SAFETY */}

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <span className="text-accent-secondary font-black tracking-widest text-[10px] uppercase mb-4 block italic">
                        {profile?.role === 'admin' ? 'ADMIN COMMAND CENTER' : 'CAMPUS DASHBOARD'}
                    </span>
                    <h1 className="text-5xl lg:text-7xl font-black title-gradient leading-tight italic">
                        Welcome back,<br />
                        <span className="text-white">
                            {profile?.role === 'admin'
                                ? `Admin`
                                : `${(profile?.full_name || profile?.email?.split('@')[0] || 'Operador').split(' ')[0]}.`
                            }
                        </span>
                    </h1>
                </div>
                <div className="hidden lg:block text-right space-y-3">
                    <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 italic">Your Completion Velocity</div>
                    <div className="text-3xl font-black text-white">{stats.progress}% <span className="text-green-400 text-sm">↑ Active</span></div>
                    <div className="flex items-center gap-3 justify-end mt-4">
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => navigate('/hub/admin')}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-xl hover:bg-accent-secondary/20 hover:border-accent-secondary/50 transition-all text-accent-secondary"
                            >
                                <Shield size={14} /> Admin
                            </button>
                        )}
                        <button
                            onClick={async () => { await supabase.auth.signOut(); navigate('/hub/login'); }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all text-text-muted hover:text-red-400"
                        >
                            <LogOut size={14} /> Sign Out
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-12 pb-12">
                <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase tracking-tight">
                    <BookOpen className="text-accent-secondary h-6 w-6" />
                    Active Learning Path
                </h2>

                {/* Engagement Radar Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-secondary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-accent-secondary/10 transition-colors"></div>
                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 italic">Global Progress</div>
                        <div className="text-2xl font-black italic">{stats.progress}%</div>
                        <div className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter">Velocity: Active</div>
                    </div>
                    <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-accent-primary/10 transition-colors"></div>
                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 italic">AI Proficiency</div>
                        <div className="text-2xl font-black italic">{profile?.ai_proficiency || 'Pioneer'}</div>
                        <div className="text-[9px] text-accent-primary font-bold mt-1 uppercase tracking-tighter italic">Rank: Founding Member</div>
                    </div>
                    <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/5 blur-3xl -mr-12 -mt-12 group-hover:bg-green-400/10 transition-colors"></div>
                        <div className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-2 italic flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            Automation Link
                        </div>
                        <div className="text-2xl font-black italic text-green-400">ESTABLISHED</div>
                        <div className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter">Sync: 100%</div>
                    </div>
                </div>

                {/* Trial Agent Spotlight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-1 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-3xl overflow-hidden mb-12"
                >
                    <div className="bg-[#0B1220]/90 backdrop-blur-xl p-8 rounded-[22px] flex flex-col md:flex-row items-center gap-8 border border-white/5">
                        <div className="h-20 w-20 rounded-2xl border border-accent-primary/20 shrink-0 relative overflow-hidden bg-accent-primary/10">
                            <img
                                src="https://lh3.googleusercontent.com/d/1qVeSx1suf01TU01h_SGecwfbieBrotw6"
                                alt="Gema — AI Project Manager"
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center text-3xl">📋</div>';
                                }}
                            />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <span className="text-[10px] font-black text-accent-primary uppercase tracking-widest mb-1 block italic">Neural Link Ready</span>
                            <h3 className="text-2xl font-black italic mb-2">Connect with Gema: Your AI Project Manager</h3>
                            <p className="text-xs text-text-muted italic max-w-xl">Direct access to the central orchestrator of your OfficeAIM workflow. Gema manages all other agents and keeps your project roadmap on track.</p>
                        </div>
                        <button
                            onClick={() => navigate('/hub/lab/ai-project-manager')}
                            className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-accent-primary hover:text-white transition-all italic shrink-0 shadow-2xl"
                        >
                            Launch AI Manager
                        </button>
                    </div>
                </motion.div>

                <div className="space-y-8">
                    {loadingCourses ? (
                        <div className="glass-card p-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-accent-secondary mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted italic">Syncing Curriculums...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="glass-card p-12 text-center border-dashed border-white/10">
                            <p className="text-sm text-text-muted italic">No active courses found. Contact admin for enrollment.</p>
                        </div>
                    ) : courses.map((course, idx) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`glass-card p-8 flex flex-col md:flex-row gap-8 group cursor-pointer border-white/5 hover:border-accent-secondary/30 transition-all ${course.status === 'Locked' ? 'opacity-50 grayscale' : ''}`}
                            onClick={() => course.status !== 'Locked' && navigate(`/hub/module/${course.id}`)}
                        >
                            <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/10 shadow-2xl bg-[#0B1220]">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'; // AI-themed fallback
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                                {/* Module Label Overlay */}
                                <div className="absolute top-4 left-4 z-20">
                                    <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-white/90">
                                            Module {course.order_index || idx + 1}
                                        </span>
                                    </div>
                                </div>

                                {course.status === 'Locked' && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-md z-30">
                                        <div className="text-center">
                                            <Clock className="text-white h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 italic">Upgrade for Early Access</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow flex flex-col justify-between py-2">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-accent-secondary/20 text-accent-secondary rounded-lg text-[10px] font-black tracking-widest uppercase italic border border-accent-secondary/30">{course.badge}</span>
                                    </div>
                                    <h3 className="text-3xl font-black mb-6 leading-tight group-hover:text-accent-secondary transition-colors italic">{course.title}</h3>

                                    {course.status !== 'Locked' && (
                                        <div className="space-y-5 max-w-sm">
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${course.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary shadow-[0_0_15px_rgba(255,122,24,0.3)]"
                                                ></motion.div>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-text-muted font-black uppercase tracking-widest italic">
                                                <span>{course.progress}% Completed</span>
                                                <span>{course.lessons} Lessons</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={`mt-8 inline-flex items-center gap-2 font-black text-sm uppercase italic tracking-widest ${course.status === 'Locked' ? 'text-text-muted' : 'text-white group-hover:text-accent-secondary transition-all'}`}>
                                    {course.status === 'Locked' ? 'Unlock Premium Access' : 'Continue Sprint'}
                                    {course.status !== 'Locked' && <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                                    {course.status === 'Locked' && <Trophy className="h-3 w-3 ml-2 text-accent-secondary" />}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* GROWTH ANALYTICS (PHASE 5+) */}
                {projects.some(p => p.current_phase >= 5) && (
                    <div className="pt-8 border-t border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase tracking-tight text-emerald-400">
                                <Activity className="h-6 w-6" />
                                Growth Analytics
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <div className="glass-card p-6 border-emerald-500/20 bg-emerald-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-12 -mt-12"></div>
                                <div className="text-[10px] text-emerald-400/70 font-black uppercase tracking-widest mb-2 italic">Video Generation Time</div>
                                <div className="text-3xl font-black italic text-white flex items-baseline gap-2">
                                    &lt;10 <span className="text-sm text-emerald-400 tracking-widest">min</span>
                                </div>
                                <div className="text-[9px] text-emerald-500/50 font-bold mt-1 uppercase tracking-tighter">Prev: 2h</div>
                            </div>
                            <div className="glass-card p-6 border-blue-500/20 bg-blue-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12"></div>
                                <div className="text-[10px] text-blue-400/70 font-black uppercase tracking-widest mb-2 italic">Weekly Reels</div>
                                <div className="text-3xl font-black italic text-white">
                                    3<span className="text-sm text-blue-400">+</span>
                                </div>
                                <div className="text-[9px] text-blue-500/50 font-bold mt-1 uppercase tracking-tighter">Active Target</div>
                            </div>
                            <div className="glass-card p-6 border-purple-500/20 bg-purple-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl -mr-12 -mt-12"></div>
                                <div className="text-[10px] text-purple-400/70 font-black uppercase tracking-widest mb-2 italic">Audience Reach</div>
                                <div className="text-3xl font-black italic text-white">
                                    +25<span className="text-sm text-purple-400">%</span>
                                </div>
                                <div className="text-[9px] text-purple-500/50 font-bold mt-1 uppercase tracking-tighter">MoM Growth Target</div>
                            </div>
                            <div className="glass-card p-6 border-amber-500/20 bg-amber-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl -mr-12 -mt-12"></div>
                                <div className="text-[10px] text-amber-400/70 font-black uppercase tracking-widest mb-2 italic flex items-center gap-2">
                                    Automation Link
                                </div>
                                <div className="text-2xl font-black italic text-amber-400">ACTIVE</div>
                                <div className="text-[9px] text-amber-500/50 font-bold mt-1 uppercase tracking-tighter">Make.com Sync</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROJECT INCUBATOR SECTION */}
                <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase tracking-tight">
                            <Bot className="text-accent-primary h-6 w-6" />
                            My Neural Vault
                        </h2>
                        <button onClick={() => navigate('/hub/projects')} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all italic">
                            View Full Gallery →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {projects.length === 0 ? (
                            <div className="col-span-2 glass-card p-8 border-dashed border-white/10 text-center">
                                <p className="text-sm text-text-muted italic mb-4">No saved neural sessions yet. Visit Agent HQ to consult your board.</p>
                                <button onClick={() => navigate('/hub/agents')} className="px-6 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic">Launch Agent HQ</button>
                            </div>
                        ) : projects.slice(0, 2).map((project, idx) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card p-6 border-white/5 hover:border-accent-secondary/30 transition-all cursor-pointer group"
                                onClick={() => navigate(`/hub/lab/${project.agent_role}?sessionId=${project.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-2 py-1 bg-white/5 rounded text-[9px] font-black uppercase tracking-widest text-text-muted italic border border-white/5">
                                        {project.agent_role?.replace(/-/g, ' ').toUpperCase()}
                                    </div>
                                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                </div>
                                <h3 className="text-lg font-black italic text-white mb-2 line-clamp-1 group-hover:text-accent-secondary transition-colors">{project.project_name}</h3>
                                <p className="text-[10px] text-text-muted line-clamp-2 italic mb-6">
                                    {project.chat_history[project.chat_history.length - 1]?.content || "Continuing analysis..."}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest italic">{new Date(project.created_at).toLocaleDateString()}</span>
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest italic group-hover:translate-x-1 transition-transform">Restore Session →</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Agent HQ Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/hub/agents')}
                    className="glass-card p-10 border-accent-primary/20 bg-accent-primary/[0.03] cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-primary/5 blur-[60px] rounded-full -mr-16 -mb-16"></div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Bot className="text-accent-primary h-6 w-6" />
                            <h3 className="text-xl font-black italic uppercase tracking-tight">Agent HQ</h3>
                        </div>
                        <ChevronRight className="h-5 w-5 text-accent-primary group-hover:translate-x-2 transition-transform" />
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed mb-8 italic font-medium">Access your 8-agent expert team for dynamic course strategy, SEO, and behavioral insights.</p>
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-10 w-10 rounded-full border-2 border-brand-bg bg-accent-primary/20 flex items-center justify-center text-[10px] font-black shadow-lg">AI</div>
                            ))}
                            <div className="h-10 w-10 rounded-full border-2 border-brand-bg bg-white/5 flex items-center justify-center text-[10px] font-black text-text-muted">8+</div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-primary italic">Enter Lab →</span>
                    </div>
                </motion.div>
            </div>

            {/* Certificate Modal (kept outside the main content flow as it's an overlay) */}
            <AnimatePresence>
                {selectedCert && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedCert(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-4xl bg-[#0A101C] border-accent-secondary/30 relative overflow-hidden p-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-6 right-6 z-10">
                                <button onClick={() => setSelectedCert(null)} className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all">✕</button>
                            </div>

                            <div className="p-12 text-center">
                                <div className="mb-8">
                                    <Trophy className="h-20 w-20 text-accent-secondary mx-auto mb-6" />
                                    <h2 className="text-4xl lg:text-5xl font-black italic mb-2">Pioneer Credential</h2>
                                    <p className="text-text-muted uppercase tracking-[0.3em] text-[10px] font-black italic">Verification ID: #{selectedCert.id.toString().padStart(6, '0')}</p>
                                </div>

                                <div className="aspect-[1.414/1] w-full max-w-2xl mx-auto mb-10 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-8 relative">
                                    {selectedCert.certificate_url ? (
                                        <img src={selectedCert.certificate_url} alt="Official Certificate" className="w-full h-full object-contain shadow-2xl" />
                                    ) : (
                                        <div className="text-center">
                                            <div className="animate-pulse mb-4">
                                                <Loader2 className="h-12 w-12 text-accent-secondary mx-auto mb-4 animate-spin" />
                                                <p className="text-sm font-bold italic text-white">Generating High-Resolution Asset...</p>
                                            </div>
                                            <p className="text-xs text-text-muted italic max-w-xs mx-auto">Your certificate is being rendered. This usually takes 30-60 seconds after module completion.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        disabled={!selectedCert.certificate_url}
                                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs italic rounded-xl hover:bg-accent-secondary hover:text-white transition-all disabled:opacity-50"
                                        onClick={() => window.open(selectedCert.certificate_url, '_blank')}
                                    >
                                        Download PDF
                                    </button>
                                    <button
                                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs italic rounded-xl hover:bg-white/10 transition-all"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.origin + `/verify/${selectedCert.id}`);
                                            alert("Verification link copied to clipboard!");
                                        }}
                                    >
                                        Copy Verification Link
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Dashboard;
