import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Trophy, Clock, Play, ChevronRight, TrendingUp, Bot, Users, Loader2, LogOut, Shield, Map, Bookmark, MessageSquare, Send, Heart, Star, Sparkles, BookOpenCheck, Activity, Copy, Check, ThumbsUp, Plus, Globe, MapPin } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import InterestTest from '../components/InterestTest';

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
    const [activeTab, setActiveTab] = useState('overview');

    // Premium SaaS LMS extensions states
    const [roadmaps, setRoadmaps] = useState([]);
    const [resources, setResources] = useState([]);
    const [savedResourceIds, setSavedResourceIds] = useState(new Set());
    const [leaderboard, setLeaderboard] = useState([]);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', type: 'general' });
    const [isPosting, setIsPosting] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    // Onboarding Multilingual Setup
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingData, setOnboardingData] = useState({
        language: 'english',
        country: '',
        goal: ''
    });

    useEffect(() => {
        if (profile) {
            fetchData();

            // Trigger onboarding if language is not set and they haven't onboarded yet
            const localFallback = JSON.parse(localStorage.getItem('officeaim_profiles_fallback') || '{}');
            const hasLang = profile.language || localFallback[profile.id]?.language;
            const hasDismissed = localStorage.getItem(`officeaim_onboarded_${profile.id}`);
            
            if (!hasLang && !hasDismissed && profile.role !== 'guest') {
                setShowOnboarding(true);
            }
        } else {
            setLoadingCourses(false);
        }
    }, [profile]);

    const handleSaveOnboarding = async () => {
        if (!profile?.id) return;
        
        try {
            // Update public.profiles
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    language: onboardingData.language, 
                    country: onboardingData.country,
                    ai_proficiency: onboardingData.goal || profile.ai_proficiency
                })
                .eq('id', profile.id);

            // Always write to localFallback for absolute resilience and instant sync
            const localFallback = JSON.parse(localStorage.getItem('officeaim_profiles_fallback') || '{}');
            localFallback[profile.id] = { 
                language: onboardingData.language, 
                country: onboardingData.country 
            };
            localStorage.setItem('officeaim_profiles_fallback', JSON.stringify(localFallback));
            localStorage.setItem(`officeaim_onboarded_${profile.id}`, 'true');

            // Force refresh local profile object
            if (profile) {
                profile.language = onboardingData.language;
                profile.country = onboardingData.country;
            }

            setShowOnboarding(false);
            
            // Reload page to fully sync state and refresh Mascot Assistant greeting
            window.location.reload();
        } catch (err) {
            console.error("Error saving onboarding:", err);
            setShowOnboarding(false);
        }
    };

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

            const mappedCourses = (modulesData || []).map((m, idx) => {
                const moduleLessons = (lessonsData || []).filter(l => l.module_id === m.id);

                // DYNAMIC ACCESS LOGIC
                const isAdmin = profile?.role === 'admin';
                const isBeta = profile?.membership_status === 'beta' || profile?.membership_status === 'plus';
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

            // 7. Fetch Premium Features Data (with robust mock fallbacks)
            try {
                // Fetch paths & steps
                const { data: paths } = await supabase.from('learning_paths').select('*');
                const { data: steps } = await supabase.from('path_steps').select('*').order('order_index', { ascending: true });
                
                if (paths && paths.length > 0) {
                    setRoadmaps(paths.map(p => ({
                        ...p,
                        steps: steps?.filter(s => s.path_id === p.id) || []
                    })));
                } else {
                    // Fallback Roadmap
                    setRoadmaps([
                        {
                            id: 'ai-agency-roadmap',
                            title: 'AI Automation Agency Blueprint',
                            description: 'Go from zero to building and scaling your own AI-powered agency in 90 days.',
                            steps: [
                                { id: 's1', title: 'The Mindset Shift', description: 'Overcome AI anxiety and understand the partner loop.', required_xp: 0, order_index: 1 },
                                { id: 's2', title: 'First Webhook Trigger', description: 'Build your first Make.com workflow and listen to real data.', required_xp: 50, order_index: 2 },
                                { id: 's3', title: 'Agent Board Integration', description: 'Wire Gema and your specialist agents into the automation loop.', required_xp: 150, order_index: 3 },
                                { id: 's4', title: 'The Pitch & Delivery', description: 'Package and deploy AI products for clients.', required_xp: 300, order_index: 4 }
                            ]
                        }
                    ]);
                }

                // Fetch resources
                const { data: resData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
                if (resData && resData.length > 0) {
                    setResources(resData);
                } else {
                    // Fallback Resources
                    setResources([
                        { id: 'r1', title: 'Gema Co-Pilot Prompt Template', description: 'The exact system prompt to turn any LLM into Gema, your AI Project Manager.', category: 'Prompts', content: 'Role: You are Gema...', is_premium: false, downloads_count: 342 },
                        { id: 'r2', title: 'Make.com Real Estate PDF Pipeline', description: 'The blueprints and n8n JSON file to download, parse, and summarize real estate brochures.', category: 'n8n Workflows', content: 'https://officeaim.netlify.app/blueprint', is_premium: true, downloads_count: 120 },
                        { id: 'r3', title: '15-Criteria Quality Rubric PDF', description: 'Our proprietary checklist to grade AI output and spot hallucinations instantly.', category: 'PDF Guides', content: 'https://officeaim.netlify.app/policy', is_premium: false, downloads_count: 850 }
                    ]);
                }

                // Fetch user bookmarks
                if (profile?.id) {
                    const { data: bookmarks } = await supabase.from('user_saved_resources').select('resource_id').eq('user_id', profile.id);
                    setSavedResourceIds(new Set(bookmarks?.map(b => b.resource_id) || []));
                }

                // Fetch leaderboard
                const { data: topProfiles } = await supabase.from('profiles').select('id, full_name, email, xp, level').order('xp', { ascending: false }).limit(5);
                if (topProfiles && topProfiles.length > 0 && topProfiles.some(p => (p.xp || 0) > 0)) {
                    setLeaderboard(topProfiles);
                } else {
                    // Fallback Leaderboard
                    setLeaderboard([
                        { id: 'l1', full_name: 'Jean Paulo (Admin)', email: 'admin@officeaim.com', xp: 1250, level: 5 },
                        { id: 'l2', full_name: 'Alina Snelder', email: 'alina@realtor.nl', xp: 850, level: 3 },
                        { id: 'l3', full_name: 'Rody Figueroa', email: 'rody@officeaim.com', xp: 450, level: 2 },
                        { id: 'l4', full_name: 'Sophia Martinez', email: 'sophia@aim.com', xp: 200, level: 1 }
                    ]);
                }

                // Fetch community posts
                const { data: postsData } = await supabase.from('community_posts').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
                if (postsData && postsData.length > 0) {
                    setPosts(postsData);
                } else {
                    // Fallback Posts
                    setPosts([
                        { id: 'p1', title: 'Gema PM prompt is a lifesaver!', content: 'Seriously guys, I just injected Gema\'s system prompt into my local assistant and she resolved 3 backlog blockers in less than 5 minutes. Check out the Prompts tab for the resource!', post_type: 'prompt', likes_count: 14, created_at: new Date(Date.now() - 3600000 * 2).toISOString(), profiles: { full_name: 'Alina Snelder', email: 'alina@realtor.nl' } },
                        { id: 'p2', title: 'How to bypass Make.com CloudConvert timeout?', content: 'Hey everyone, I am building the Real Estate Reels generator (Step 3) and my CloudConvert conversion times out on large PDFs. Anyone solved this? Maybe we can use an async webhook loop?', post_type: 'question', likes_count: 8, created_at: new Date(Date.now() - 3600000 * 12).toISOString(), profiles: { full_name: 'Rody Figueroa', email: 'rody@officeaim.com' } }
                    ]);
                }
            } catch (premiumErr) {
                console.error("Premium data fetch error:", premiumErr);
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

    // Copy prompt helper with temporary state to show micro-animation
    const [copiedResourceId, setCopiedResourceId] = useState(null);
    const handleCopyPrompt = (resourceId, promptText) => {
        navigator.clipboard.writeText(promptText);
        setCopiedResourceId(resourceId);
        setTimeout(() => setCopiedResourceId(null), 2000);
    };

    // Save/Bookmark Resource Handler
    const handleSaveResource = async (resourceId) => {
        if (!profile?.id) return;
        
        const isCurrentlySaved = savedResourceIds.has(resourceId);
        const newSavedSet = new Set(savedResourceIds);
        
        try {
            if (isCurrentlySaved) {
                const { error } = await supabase
                    .from('user_saved_resources')
                    .delete()
                    .eq('user_id', profile.id)
                    .eq('resource_id', resourceId);
                
                if (error) throw error;
                newSavedSet.delete(resourceId);
            } else {
                const { error } = await supabase
                    .from('user_saved_resources')
                    .insert({
                        user_id: profile.id,
                        resource_id: resourceId
                    });
                
                if (error) throw error;
                newSavedSet.add(resourceId);
            }
            setSavedResourceIds(newSavedSet);
        } catch (err) {
            console.error("Error saving resource:", err);
            // Fallback for offline/mock state
            if (isCurrentlySaved) {
                newSavedSet.delete(resourceId);
            } else {
                newSavedSet.add(resourceId);
            }
            setSavedResourceIds(newSavedSet);
        }
    };

    // Like Post Handler
    const handleLikePost = async (postId) => {
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, likes_count: (p.likes_count || 0) + 1, user_has_liked: true };
            }
            return p;
        });
        setPosts(updatedPosts);

        try {
            const postToUpdate = posts.find(p => p.id === postId);
            if (!postToUpdate) return;
            
            const newLikesCount = (postToUpdate.likes_count || 0) + 1;
            
            await supabase
                .from('community_posts')
                .update({ likes_count: newLikesCount })
                .eq('id', postId);
        } catch (err) {
            console.error("Error liking post:", err);
        }
    };

    // Create Community Post Handler
    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!profile?.id || !newPost.title.trim() || !newPost.content.trim()) return;

        setIsPosting(true);
        const optimisticPostId = Math.random().toString();
        const newPostData = {
            id: optimisticPostId,
            title: newPost.title,
            content: newPost.content,
            post_type: newPost.type,
            likes_count: 0,
            created_at: new Date().toISOString(),
            user_id: profile.id,
            profiles: {
                full_name: profile.full_name || 'Anonymous Student',
                email: profile.email || ''
            }
        };

        setPosts([newPostData, ...posts]);
        setNewPost({ title: '', content: '', type: 'general' });

        try {
            const { data, error } = await supabase
                .from('community_posts')
                .insert({
                    user_id: profile.id,
                    title: newPostData.title,
                    content: newPostData.content,
                    post_type: newPostData.post_type
                })
                .select('*, profiles(full_name, email)')
                .single();

            if (error) throw error;
            if (data) {
                setPosts(prev => prev.map(p => p.id === optimisticPostId ? data : p));
            }
        } catch (err) {
            console.error("Error creating post:", err);
            setIsPosting(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="w-full h-full py-12 px-6 lg:px-8 bg-[#070A12] text-white">
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
                                ? `${profile?.full_name || 'Admin'} (Admin)`
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

            {/* TAB NAVIGATION */}
            <div className="max-w-4xl mx-auto flex items-center gap-6 mb-8 border-b border-white/5 pb-4 overflow-x-auto whitespace-nowrap scrollbar-thin">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'overview' ? 'text-accent-secondary border-b-2 border-accent-secondary pb-4 -mb-[18px]' : 'text-text-muted hover:text-white'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('diagnostic')}
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'diagnostic' ? 'text-accent-secondary border-b-2 border-accent-secondary pb-4 -mb-[18px]' : 'text-text-muted hover:text-white'}`}
                >
                    Diagnostic Test
                </button>
                <button
                    onClick={() => setActiveTab('roadmaps')}
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'roadmaps' ? 'text-accent-secondary border-b-2 border-accent-secondary pb-4 -mb-[18px]' : 'text-text-muted hover:text-white'}`}
                >
                    Learning Paths
                </button>
                <button
                    onClick={() => setActiveTab('resources')}
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'resources' ? 'text-accent-secondary border-b-2 border-accent-secondary pb-4 -mb-[18px]' : 'text-text-muted hover:text-white'}`}
                >
                    Curated Resources
                </button>
                <button
                    onClick={() => setActiveTab('ranking')}
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'ranking' ? 'text-accent-secondary border-b-2 border-accent-secondary pb-4 -mb-[18px]' : 'text-text-muted hover:text-white'}`}
                >
                    Leaderboard
                </button>
                <button
                    onClick={() => setActiveTab('community')}
                    className={`text-[11px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'community' ? 'text-accent-secondary border-b-2 border-accent-secondary pb-4 -mb-[18px]' : 'text-text-muted hover:text-white'}`}
                >
                    Community Lounge
                </button>
            </div>

            {/* TAB CONTENT RENDERING */}
            {activeTab === 'overview' && (
                <div className="max-w-4xl mx-auto space-y-12 pb-12">
                    <h2 className="text-2xl font-black flex items-center gap-3 italic uppercase tracking-tight">
                        <BookOpen className="text-accent-secondary h-6 w-6" />
                        Active Learning Path
                    </h2>

                    {/* Engagement Radar Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-secondary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-accent-secondary/10 transition-colors"></div>
                            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 italic">Active Project</div>
                            <div className="text-2xl font-black italic">MakelaarVideo AI</div>
                            <div className="text-[9px] text-accent-secondary font-bold mt-1 uppercase tracking-tighter">Phase V: Analytics & Optimization</div>
                        </div>
                        <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 blur-3xl -mr-12 -mt-12 group-hover:bg-accent-primary/10 transition-colors"></div>
                            <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 italic">CloudConvert Webhook</div>
                            <div className="text-2xl font-black italic">{Math.max(100, stats.progress + 60)}%</div>
                            <div className="text-[9px] text-accent-primary font-bold mt-1 uppercase tracking-tighter italic">Status: Synchronized</div>
                        </div>
                        <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-3xl -mr-12 -mt-12 group-hover:bg-cyan-400/10 transition-colors"></div>
                            <div className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-2 italic flex items-center gap-2">
                                <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                                OpenAI Strategist
                            </div>
                            <div className="text-2xl font-black italic text-cyan-400">0.4 Temp</div>
                            <div className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter">System Integrity: Nominal</div>
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

                    {/* Courses Listing */}
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
                                            e.target.src = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800';
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
            )}

            {activeTab === 'diagnostic' && (
                <div className="max-w-4xl mx-auto pb-12">
                    <InterestTest
                        onComplete={async (res) => {
                            console.log("Diagnostic complete:", res);
                            if (profile?.id && res.tier) {
                                const tierMap = {
                                    'Essential': 'FREE',
                                    'Pro': 'PRO',
                                    'Plus': 'PLUS'
                                };
                                const dbTier = tierMap[res.tier] || 'FREE';

                                try {
                                    await supabase
                                        .from('profiles')
                                        .update({ tier: dbTier })
                                        .eq('id', profile.id);
                                    console.log("Profile tier successfully updated to:", dbTier);
                                } catch (error) {
                                    console.error("Failed to update profile tier:", error);
                                }
                            }
                        }}
                    />
                </div>
            )}

            {activeTab === 'roadmaps' && (
                <div className="max-w-4xl mx-auto space-y-12 pb-12">
                    <div className="glass-card p-8 bg-gradient-to-br from-white/5 to-transparent border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <span className="text-[10px] text-accent-secondary font-black uppercase tracking-widest italic">Student Gamification Progression</span>
                                <h3 className="text-3xl font-black italic">Level {profile.level || 1} Pioneer</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-text-muted italic block">Total Experience Points</span>
                                <span className="text-3xl font-black text-white">{profile.xp || 0} XP</span>
                            </div>
                        </div>
                        {/* XP Progress Bar */}
                        <div className="space-y-2">
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
                                <div 
                                    className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full shadow-[0_0_15px_rgba(255,122,24,0.4)] animate-pulse"
                                    style={{ width: `${Math.min(100, Math.round(((profile.xp || 0) / Math.max(1, (profile.level || 1) * 500)) * 100))}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-text-muted font-bold uppercase tracking-widest italic">
                                <span>{profile.xp || 0} XP</span>
                                <span>{((profile.level || 1) * 500)} XP for Level {(profile.level || 1) + 1}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                        {roadmaps.map((path) => (
                            <div key={path.id} className="space-y-8">
                                <div className="pl-12 relative">
                                    <div className="absolute left-[26px] top-1.5 h-4 w-4 bg-accent-secondary rounded-full border-4 border-brand-bg shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                                    <h3 className="text-2xl font-black italic text-white">{path.title}</h3>
                                    <p className="text-xs text-text-muted italic mt-1">{path.description}</p>
                                </div>

                                <div className="space-y-6">
                                    {path.steps.map((step, idx) => {
                                        const isUnlocked = (profile.xp || 0) >= step.required_xp;
                                        return (
                                            <div key={step.id} className="pl-12 relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
                                                {/* Node Line Anchor */}
                                                <div className={`absolute left-7 top-4 h-6 w-2 border-l-2 border-b-2 ${isUnlocked ? 'border-accent-primary' : 'border-white/10'} rounded-bl-lg`}></div>
                                                <div className={`absolute left-[30px] top-[14px] h-2 w-2 rounded-full ${isUnlocked ? 'bg-accent-primary shadow-[0_0_8px_rgba(255,122,24,0.5)]' : 'bg-white/10'}`}></div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest italic text-accent-primary">Step {step.order_index || idx + 1}</span>
                                                        {!isUnlocked && (
                                                            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[9px] font-black tracking-widest uppercase italic text-red-400">Locked</span>
                                                        )}
                                                    </div>
                                                    <h4 className={`text-lg font-black italic ${isUnlocked ? 'text-white group-hover:text-accent-secondary transition-colors' : 'text-white/40'}`}>{step.title}</h4>
                                                    <p className="text-xs text-text-muted italic max-w-xl">{step.description}</p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest italic block mb-1">Unlocks at</span>
                                                    <span className={`text-sm font-black italic ${isUnlocked ? 'text-accent-secondary' : 'text-white/30'}`}>{step.required_xp} XP</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'resources' && (
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-black italic">LMS Core Vault</h3>
                            <p className="text-xs text-text-muted italic mt-1">Deploy prompt blueprints, n8n JSON nodes, and standard operating procedures.</p>
                        </div>
                    </div>

                    {/* Category filter */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 whitespace-nowrap scrollbar-thin">
                        {['All', 'Prompts', 'n8n Workflows', 'PDF Guides'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    activeCategory === cat 
                                        ? 'bg-accent-secondary text-white border-accent-secondary shadow-lg' 
                                        : 'bg-white/5 border-white/10 text-text-muted hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {resources
                            .filter(r => activeCategory === 'All' || r.category === activeCategory)
                            .map((res) => {
                                const isSaved = savedResourceIds.has(res.id);
                                const isPromptType = res.category === 'Prompts';
                                
                                return (
                                    <div key={res.id} className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/5 hover:border-accent-secondary/30 transition-all flex flex-col justify-between group relative overflow-hidden">
                                        {res.is_premium && (
                                            <div className="absolute top-0 right-0 px-3 py-1 bg-accent-primary text-black font-black uppercase tracking-widest text-[8px] rounded-bl-xl italic">Premium</div>
                                        )}
                                        
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase tracking-widest text-accent-secondary border border-white/5">{res.category}</span>
                                                <button 
                                                    onClick={() => handleSaveResource(res.id)} 
                                                    className={`transition-all hover:scale-115 ${isSaved ? 'text-accent-secondary' : 'text-text-muted hover:text-white'}`}
                                                >
                                                    <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                                                </button>
                                            </div>

                                            <h4 className="text-lg font-black italic text-white line-clamp-1 group-hover:text-accent-secondary transition-colors">{res.title}</h4>
                                            <p className="text-xs text-text-muted italic line-clamp-3">{res.description}</p>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[9px] text-text-muted font-black uppercase tracking-widest italic">{res.downloads_count} views</span>
                                            
                                            {isPromptType ? (
                                                <button
                                                    onClick={() => handleCopyPrompt(res.id, res.content)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-accent-secondary/20 hover:text-white rounded-lg border border-white/10 hover:border-accent-secondary/40 text-[9px] font-black uppercase tracking-widest italic transition-all"
                                                >
                                                    {copiedResourceId === res.id ? (
                                                        <>
                                                            <Check size={10} className="text-green-400" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={10} />
                                                            Copy Prompt
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <a
                                                    href={res.content}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-accent-secondary text-white rounded-lg text-[9px] font-black uppercase tracking-widest italic transition-all hover:bg-white hover:text-black shadow-lg"
                                                >
                                                    Get Asset
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {activeTab === 'ranking' && (
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    <div>
                        <h3 className="text-2xl font-black italic">Pioneer Standings</h3>
                        <p className="text-xs text-text-muted italic mt-1">See your status and tracking position compared with the active cohort members.</p>
                    </div>

                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                        <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-8 pb-4">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center">
                                <div className="h-12 w-12 rounded-full border-2 border-slate-400 bg-slate-500/10 flex items-center justify-center text-xl shadow-lg relative mb-3">🥈</div>
                                <div className="text-xs font-black italic text-slate-300 text-center line-clamp-1 max-w-[100px]">{leaderboard[1].full_name}</div>
                                <div className="text-[10px] text-text-muted font-bold italic mb-3">{leaderboard[1].xp} XP</div>
                                <div className="w-full h-24 bg-gradient-to-t from-slate-500/10 to-slate-500/30 rounded-t-2xl border-t border-slate-400/30 flex items-center justify-center">
                                    <span className="text-2xl font-black italic text-slate-300">#2</span>
                                </div>
                            </div>
                            {/* 1st Place */}
                            <div className="flex flex-col items-center">
                                <div className="h-16 w-16 rounded-full border-2 border-yellow-400 bg-yellow-500/10 flex items-center justify-center text-3xl shadow-xl shadow-yellow-500/10 relative mb-3 animate-bounce duration-[3000ms]">👑</div>
                                <div className="text-sm font-black italic text-yellow-300 text-center line-clamp-1 max-w-[120px]">{leaderboard[0].full_name}</div>
                                <div className="text-xs text-yellow-400 font-black italic mb-3">{leaderboard[0].xp} XP</div>
                                <div className="w-full h-32 bg-gradient-to-t from-yellow-500/10 to-yellow-500/30 rounded-t-2xl border-t border-yellow-400/30 flex items-center justify-center shadow-2xl">
                                    <span className="text-3xl font-black italic text-yellow-300">#1</span>
                                </div>
                            </div>
                            {/* 3rd Place */}
                            <div className="flex flex-col items-center">
                                <div className="h-10 w-10 rounded-full border-2 border-amber-600 bg-amber-700/10 flex items-center justify-center text-lg shadow-lg relative mb-3">🥉</div>
                                <div className="text-xs font-black italic text-amber-500 text-center line-clamp-1 max-w-[100px]">{leaderboard[2].full_name}</div>
                                <div className="text-[10px] text-text-muted font-bold italic mb-3">{leaderboard[2].xp} XP</div>
                                <div className="w-full h-20 bg-gradient-to-t from-amber-700/10 to-amber-700/30 rounded-t-2xl border-t border-amber-600/30 flex items-center justify-center">
                                    <span className="text-xl font-black italic text-amber-600">#3</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Full Leaderboard Table */}
                    <div className="glass-card overflow-hidden border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-text-muted italic">Rank</th>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-text-muted italic">Student</th>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-text-muted italic text-center">Level</th>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-text-muted italic text-right">Experience</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((user, index) => {
                                    const isCurrentUser = user.email === profile.email;
                                    return (
                                        <tr key={user.id} className={`border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${isCurrentUser ? 'bg-accent-secondary/5 font-bold border-l-2 border-l-accent-secondary' : ''}`}>
                                            <td className="py-4 px-6 text-sm font-black italic text-white/80">
                                                {index === 0 ? '👑 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-white italic">{user.full_name || 'Anonymous Student'}</span>
                                                    {isCurrentUser && (
                                                        <span className="px-2 py-0.5 bg-accent-secondary/20 text-accent-secondary text-[8px] font-black tracking-widest uppercase rounded border border-accent-secondary/30">You</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-black italic text-center text-accent-primary">Lvl {user.level || 1}</td>
                                            <td className="py-4 px-6 text-sm font-black italic text-right text-white">{user.xp || 0} XP</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'community' && (
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    <div>
                        <h3 className="text-2xl font-black italic">Community Lounge</h3>
                        <p className="text-xs text-text-muted italic mt-1">Connect, share prompts, troubleshoot automation pipelines, and learn alongside your cohort.</p>
                    </div>

                    {/* Create Post Form */}
                    <form onSubmit={handleCreatePost} className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border-white/5 space-y-4">
                        <div className="text-[10px] text-accent-secondary font-black uppercase tracking-widest italic flex items-center gap-2">
                            <MessageSquare size={12} /> Broadcast to Cohort
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Discussion Title"
                                required
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/10"
                            />
                            <select
                                value={newPost.type}
                                onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                                className="bg-[#0B1220] border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:border-accent-secondary outline-none transition-all cursor-pointer"
                            >
                                <option value="general">Category: General</option>
                                <option value="prompt">Category: Prompts</option>
                                <option value="workflow">Category: Workflows</option>
                                <option value="question">Category: Questions</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="What's on your mind? Share prompts, ask questions, or announce workflow deployments..."
                            required
                            rows={3}
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/10 resize-none"
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isPosting}
                                className="px-6 py-3 bg-white hover:bg-accent-secondary hover:text-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isPosting ? 'BROADCASTING...' : 'SHARE POST'}
                                <Send size={10} />
                            </button>
                        </div>
                    </form>

                    {/* Feed */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 border-white/5 hover:border-accent-secondary/10 transition-all space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-accent-primary/20 rounded-lg flex items-center justify-center text-xs font-black text-accent-primary uppercase shrink-0">
                                            {(post.profiles?.full_name || 'S').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black italic text-white">{post.profiles?.full_name || 'Anonymous Student'}</span>
                                                {post.profiles?.email?.includes('officeaim.com') && (
                                                    <span className="px-1.5 py-0.5 bg-accent-secondary/20 text-accent-secondary text-[7px] font-black uppercase tracking-widest rounded border border-accent-secondary/30">Crew</span>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-text-muted font-bold italic">{new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase tracking-widest text-accent-primary border border-white/5">{post.post_type}</span>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-lg font-black italic text-white leading-tight">{post.title}</h4>
                                    <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap italic font-medium">{post.content}</p>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <button
                                        onClick={() => handleLikePost(post.id)}
                                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic transition-all ${post.user_has_liked ? 'text-red-400' : 'text-text-muted hover:text-white'}`}
                                    >
                                        <Heart size={12} fill={post.user_has_liked ? 'currentColor' : 'none'} />
                                        <span>{post.likes_count || 0} Likes</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certificate Modal */}
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

            {/* LUXURY ONBOARDING MODAL */}
            <AnimatePresence>
                {showOnboarding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                            className="bg-[#0B1220] border border-cyan-500/20 relative overflow-hidden w-full max-w-lg rounded-3xl shadow-2xl p-8"
                        >
                            {/* Cyber Ambient glows */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-10 -mt-10 rounded-full"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 blur-3xl -ml-10 -mb-10 rounded-full"></div>
                            
                            {/* Interactive cyber grid track */}
                            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                            <div className="relative z-10 text-center mb-8">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-orange-400/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                                    <Sparkles className="h-7 w-7 text-cyan-400 animate-pulse" />
                                </div>
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 block italic">Initialization Protocol</span>
                                <h2 className="text-3xl font-black italic text-white mb-2 leading-tight">Welcome to OfficeAIM</h2>
                                <p className="text-xs text-text-muted italic max-w-sm mx-auto leading-relaxed">Let's configure your cybernetic learning environment to perfectly align Gema and your Specialist Agents with your background.</p>
                            </div>

                            <div className="space-y-5 relative z-10">
                                <div>
                                    <label className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2 italic flex items-center gap-1.5">
                                        <Globe className="h-3 w-3" /> Preferred Language (Mascot Voice)
                                    </label>
                                    <select
                                        value={onboardingData.language}
                                        onChange={(e) => setOnboardingData(prev => ({ ...prev, language: e.target.value }))}
                                        className="w-full bg-[#070A12] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
                                    >
                                        <option value="english">English 🇬🇧 (Default)</option>
                                        <option value="spanish">Español 🇪🇸</option>
                                        <option value="dutch">Nederlands 🇳🇱</option>
                                        <option value="portuguese">Português 🇧🇷</option>
                                        <option value="french">Français 🇫🇷</option>
                                        <option value="german">Deutsch 🇩🇪</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2 italic flex items-center gap-1.5">
                                        <MapPin className="h-3 w-3" /> Your Country / Location
                                    </label>
                                    <input
                                        type="text"
                                        value={onboardingData.country}
                                        onChange={(e) => setOnboardingData(prev => ({ ...prev, country: e.target.value }))}
                                        placeholder="e.g. Netherlands, Spain, Argentina"
                                        className="w-full bg-[#070A12] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-cyan-400 uppercase tracking-widest block mb-2 italic flex items-center gap-1.5">
                                        <Sparkles className="h-3 w-3" /> Professional Role / Primary Goal
                                    </label>
                                    <input
                                        type="text"
                                        value={onboardingData.goal}
                                        onChange={(e) => setOnboardingData(prev => ({ ...prev, goal: e.target.value }))}
                                        placeholder="e.g. Real Estate Agent, Marketer, Office Manager"
                                        className="w-full bg-[#070A12] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400/50 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveOnboarding}
                                    disabled={!onboardingData.country || !onboardingData.goal}
                                    className="w-full mt-6 py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-gradient-to-r hover:from-cyan-400 hover:to-orange-400 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none italic shadow-2xl"
                                >
                                    Initialize Ecosistema 🚀
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
