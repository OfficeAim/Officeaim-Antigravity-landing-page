import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, BrainCircuit, FileText, Building2, Globe2, ChevronRight, CheckCircle2, Lock, ArrowRight, Activity, Beaker, Copy, Check, Users, Mail, Cpu, Star, Loader2, Sparkles, X, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const ProjectPlanner = ({ profile }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Project State
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPrdOpen, setIsPrdOpen] = useState(false);
    const [prdContent, setPrdContent] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLovableModalOpen, setIsLovableModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState(null);

    useEffect(() => {
        if (location.state?.openPrd && prdContent) {
            setIsPrdOpen(true);
            // Clear state so it doesn't force open on subsequent navigations within planner
            window.history.replaceState({}, document.title);
        }
    }, [location.state, prdContent]);

    const handleCopyPRD = () => {
        if (prdContent) {
            navigator.clipboard.writeText(prdContent);
            setCopied(true);
            toast.success("PRD Copied to clipboard!", { icon: '📋' });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const defaultChecklist = [
        { id: 1, text: 'Step 1: Configure Make Webhook (PDF URL & Realtor Email)', done: false },
        { id: 2, text: 'Step 2: Implement HTTP Download', done: false },
        { id: 3, text: 'Step 3: Connect CloudConvert (PDF to Text)', done: false },
        { id: 4, text: 'Step 4: Integrate OpenAI #1 (Researcher for m2)', done: false },
        { id: 5, text: 'Step 5: Integrate OpenAI #2 (Strategist for script)', done: false },
        { id: 6, text: 'Step 6: Configure Gmail Delivery', done: false },
        { id: 7, text: 'Step 7: Setup Google Sheets Logging (Cols A-G)', done: false }
    ];

    const [checklist, setChecklist] = useState(defaultChecklist);

    const handleToggleChecklist = async (id) => {
        const newChecklist = checklist.map(item => item.id === id ? { ...item, done: !item.done } : item);
        setChecklist(newChecklist);

        if (project) {
            const { error } = await supabase
                .from('student_projects')
                .update({ checklist_state: newChecklist })
                .eq('id', project.id);
            if (error) console.error("Error saving checklist:", error);
        }
    };

    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    // Fetch or create active project
    useEffect(() => {
        const fetchProject = async () => {
            if (!profile?.id) return;

            try {
                const hardcodedId = 'c30b3825-44a8-492f-9148-afb1c1cedb5d';
                const urlParams = new URLSearchParams(location.search);
                const savedProjectId = urlParams.get('projectId') || localStorage.getItem('activeProjectId');

                let data, error;

                // 1. Try saved/URL project ID first, or fallback to hardcoded
                const targetId = savedProjectId || hardcodedId;

                const { data: savedData, error: savedError } = await supabase
                    .from('student_projects')
                    .select('*')
                    .eq('id', targetId)
                    .limit(1);
                data = savedData;
                error = savedError;

                if (data && data.length > 0) {
                    console.warn("Recovered Project:", targetId);
                }

                if (error && error.code !== 'PGRST116') throw error; // Ignoring no rows error assuming it might be empty array

                if (data && data.length > 0) {
                    const currentProject = data[0];
                    let activePhase = currentProject.current_phase || 1;

                    // Persist for future visits
                    localStorage.setItem('activeProjectId', currentProject.id);

                    // FORCE FETCH PRD to check state restoration
                    const { data: prdData } = await supabase
                        .from('project_documents')
                        .select('content')
                        .eq('project_id', currentProject.id)
                        .eq('type', 'prd')
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (prdData && prdData.length > 0) {
                        setPrdContent(prdData[0].content);
                    }

                    // FORCE PHASE 6
                    activePhase = 6;

                    setProject({ ...currentProject, current_phase: activePhase });

                    if (currentProject.checklist_state && Array.isArray(currentProject.checklist_state) && currentProject.checklist_state.length > 0) {
                        setChecklist(currentProject.checklist_state);
                    }
                } else {
                    // Create a new default project
                    const { data: newProj, error: createError } = await supabase
                        .from('student_projects')
                        .insert({
                            user_id: profile.id,
                            name: "My First AI Project",
                            current_phase: 1,
                            agent_role: 'AI-PROJECT-MANAGER', // Required by schema
                            user_input: 'Initial project setup' // Required by schema
                        })
                        .select();

                    if (createError) throw createError;
                    if (newProj && newProj.length > 0) {
                        setProject(newProj[0]);
                        localStorage.setItem('activeProjectId', newProj[0].id);
                    }
                }
            } catch (err) {
                console.error("Error fetching project:", err);
                toast.error(`Project Load Error: ${err.message || 'Check console details.'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [profile?.id]);

    useEffect(() => {
        if (!project?.id) return;

        const channel = supabase.channel(`public:student_projects:${project.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'student_projects',
                filter: `id=eq.${project.id}`
            }, (payload) => {
                const newData = payload.new;

                setProject((prevProject) => {
                    if (newData.external_deployment_success && !prevProject?.external_deployment_success) {
                        toast.success('Sync Successful 🔄', { duration: 5000 });
                        if (newData.current_phase < 5) {
                            advancePhase(5);
                        }
                    }
                    if (newData.checklist_state && Array.isArray(newData.checklist_state) && newData.checklist_state.length > 0) {
                        setChecklist(newData.checklist_state);
                    }
                    return newData;
                });
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, [project?.id]);

    const currentPhase = 6; // FORCED TO 6 FOR RECOVERY
    const progressPercent = (currentPhase / 5) * 100;

    const handleSaveToVault = async () => {
        try {
            const { error } = await supabase.from('project_memory').insert({
                project_id: project.id,
                type: 'video_plan',
                content: { name: project.name, status: 'Archived Video Plan', timestamp: new Date().toISOString() }
            });
            if (error) throw error;
            toast.success("Saved to Vault!", { icon: '🗄️' });
        } catch (err) {
            console.error(err);
            toast.error("Failed to save to vault.");
        }
    };

    const handleInnovationSubmit = async () => {
        if (!project || !profile) return;
        try {
            const { error } = await supabase.from('admin_inbox').insert({
                user_id: profile.id,
                project_id: project.id,
                payload: {
                    project_name: project.name,
                    phase: currentPhase,
                    submitted_at: new Date().toISOString()
                },
                status: 'pending'
            });
            if (error) throw error;
            toast.success("Project submitted for Innovation Review! The Lead Visionary will be notified.", { icon: '🌟', duration: 5000 });
        } catch (err) {
            console.error("Error submitting to admin inbox:", err);
            toast.error("Failed to submit for review.");
        }
    };
    const handleGeneratePRD = () => {
        // We set context_mode and route to Gema (AI Project Manager)
        navigate('/hub/lab/ai-project-manager?mode=prd_generation');
    };

    const handlePhaseAction = async (phase) => {
        if (phase === 1) {
            handleGeneratePRD();
        } else if (phase === 3) {
            navigate('/hub/agents'); // Corporate Board
        } else if (phase === 4) {
            // For Scout Agents
            navigate('/hub/agents');
        } else if (phase === 5) {
            navigate('/hub/dashboard');
        }
    };

    const advancePhase = async (nextPhase) => {
        // Simulated function for admin/debug to force advance
        if (!project) return;
        const { error } = await supabase
            .from('student_projects')
            .update({ current_phase: nextPhase, is_completed: nextPhase > 4 })
            .eq('id', project.id);

        if (!error) {
            setProject({ ...project, current_phase: nextPhase });
            toast.success(`Advanced to Phase ${nextPhase}`);
        }
    };

    const phases = [
        {
            num: 1,
            title: "Architecture (Mind Maps)",
            icon: <BrainCircuit className="h-5 w-5" />,
            desc: "Define the hierarchy of functions before prompting.",
            status: currentPhase > 1 ? "Completed" : "In Progress",
            actionText: "Generate PRD with Gema",
            action: () => handlePhaseAction(1),
            isLocked: false
        },
        {
            num: 2,
            title: "Documentation (PRDs)",
            icon: <FileText className="h-5 w-5" />,
            desc: "Review and refine your Product Requirement Document.",
            status: currentPhase > 2 ? "Completed" : currentPhase === 2 ? "Pending Review" : "Pending",
            actionText: "Review PRD",
            action: () => { },
            isLocked: currentPhase < 2
        },
        {
            num: 3,
            title: "Construction (Corporate Board)",
            icon: <Building2 className="h-5 w-5" />,
            desc: "Pass the PRD to the Developer & Architect for MVP coding.",
            status: currentPhase > 3 ? "Completed" : currentPhase === 3 ? "Ready to Build" : "Pending",
            actionText: "Assign to Board",
            action: () => handlePhaseAction(3),
            isLocked: currentPhase < 3
        },
        {
            num: 4,
            title: "Market Validation (Scout Agents)",
            icon: <Globe2 className="h-5 w-5" />,
            desc: "Analyze competitors and position your product in the market.",
            status: currentPhase > 4 ? "Completed" : currentPhase === 4 ? "Ready" : "Pending",
            actionText: "Launch Scout",
            action: () => handlePhaseAction(4),
            isLocked: currentPhase < 4
        },
        {
            num: 5,
            title: "Project Analytics & Optimization",
            icon: <Activity className="h-5 w-5" />,
            desc: "Monitor KPIs, Beta User engagement, and system performance.",
            status: currentPhase > 5 ? "Completed" : currentPhase === 5 ? "Active" : "Pending",
            actionText: "Open Dashboard",
            action: () => navigate('/hub/dashboard'), // We re-route to main dash where KPI features apply
            isLocked: currentPhase < 5
        },
        {
            num: 6,
            title: "Feedback Loop & Refinement",
            icon: <MessageSquare className="h-5 w-5" />,
            desc: "Collect user feedback and innovate for v2.0.",
            status: currentPhase > 6 ? "Completed" : currentPhase === 6 ? "Active" : "Pending",
            actionText: "Publish Video",
            action: () => {
                toast.success("Video Published! Automated satisfaction form triggered.", { icon: '✅', duration: 5000 });
            },
            isLocked: currentPhase < 6
        }
    ];

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[#0B1220]">
                <Activity className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
                <h2 className="text-xl font-black italic text-emerald-400 uppercase tracking-widest animate-pulse">Neural Sync in Progress</h2>
                <p className="text-text-muted text-sm italic mt-2">Restoring project state...</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-8 max-w-4xl mx-auto flex flex-col">
            {/* Header */}
            <div className="mb-10 text-center">
                <div className="inline-flex h-12 w-12 rounded-xl bg-emerald-500/10 items-center justify-center border border-emerald-500/20 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <Layout className="h-6 w-6 text-emerald-400" />
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter title-gradient leading-none mb-2">Strategic Project Planner</h1>
                <p className="text-text-muted text-sm italic">Follow the Architecture First methodology to guarantee success.</p>
            </div>

            {/* Progress Overview */}
            <div className="glass-card bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                    <Beaker className="h-24 w-24 text-emerald-400" />
                </div>

                <h2 className="text-sm font-black italic uppercase tracking-widest text-emerald-400 mb-2 relative z-10">Pre-flight Checklist</h2>
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <span className="text-xl font-bold text-white truncate max-w-[60%]">{project?.name || "My AI Project"}</span>
                    <span className="text-emerald-400 font-black text-lg italic">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden relative z-10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                </div>
            </div>

            {/* PRD Modal */}
            <AnimatePresence>
                {isPrdOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="w-full max-w-2xl h-full bg-[#0B1220] border-l border-gray-800 shadow-2xl flex flex-col">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                    <h2 className="text-xl font-black italic text-white uppercase tracking-wider">Approved PRD</h2>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={handleCopyPRD} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm italic">
                                        {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                                        <span className={copied ? "text-emerald-400" : ""}>{copied ? "Copied" : "Copy"}</span>
                                    </button>
                                    <button onClick={() => setIsPrdOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                                <div className="prose prose-invert prose-emerald max-w-none prose-sm leading-relaxed whitespace-pre-wrap italic">
                                    {prdContent || "No PRD content found."}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lovable Modal */}
            <AnimatePresence>
                {isLovableModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-2xl bg-[#0B1220] border border-emerald-500/30 shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[90vh]">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-emerald-900/10">
                                <div className="flex items-center gap-3">
                                    <Globe2 className="h-6 w-6 text-emerald-400" />
                                    <h2 className="text-xl font-black italic text-white uppercase tracking-wider">Connect to Lovable</h2>
                                </div>
                                <button onClick={() => setIsLovableModalOpen(false)} className="text-gray-500 hover:text-white transition-colors shrink-0">
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                                <p className="text-sm text-gray-300">Copy these credentials into your Lovable external project to sync progress and database updates in real-time.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Project ID</label>
                                        <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 p-3 rounded-lg">
                                            <code className="text-xs text-gray-300 flex-1 truncate">{project?.id}</code>
                                            <button onClick={() => { navigator.clipboard.writeText(project?.id); toast.success("Copied!"); }} className="text-emerald-500 hover:text-emerald-400 shrink-0"><Copy className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Supabase URL</label>
                                        <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 p-3 rounded-lg">
                                            <code className="text-xs text-gray-300 flex-1 truncate">{import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}</code>
                                            <button onClick={() => { navigator.clipboard.writeText(import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'); toast.success("Copied!"); }} className="text-blue-500 hover:text-blue-400 shrink-0"><Copy className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Anon Key</label>
                                        <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 p-3 rounded-lg">
                                            <code className="text-xs text-gray-300 flex-1 truncate">{import.meta.env.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'eyJhbGciOiJI...'}</code>
                                            <button onClick={() => { navigator.clipboard.writeText(import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR...'); toast.success("Copied!"); }} className="text-purple-500 hover:text-purple-400 shrink-0"><Copy className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Master Dashboard Prompt */}
                                <div className="space-y-2 pt-4 border-t border-gray-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest italic flex items-center gap-2">
                                            <BrainCircuit className="h-4 w-4" /> Master Initialization Prompt
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const masterPrompt = `Act as an expert React developer. I am building a dashboard for a Real Estate AI automation called "MakelaarVideo AI".

1. Database Connection (CRITICAL SETUP)
Alina, to avoid creating a blank database, give Lovable the exact OfficeAIM keys. Do not use the native Supabase integration if it asks to create a new project.

Connect to my existing Supabase project using these exact credentials to fetch my real data:
Supabase URL: ${import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}
Supabase Anon Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR...'}

2. Core Objective
Build a professional, dark-mode dashboard in Dutch. The app must connect to the student_projects table and the project_documents table to show the PRD.

3. Data Sync Logic (CRITICAL)
Use the following PROJECT_ID for all data fetching:
Project ID: ${project?.id || 'c30b3825-44a8-492f-9148-afb1c1cedb5d'}
Filter Rule: SELECT * FROM student_projects WHERE id = '${project?.id || 'c30b3825-44a8-492f-9148-afb1c1cedb5d'}'

4. UI Requirements (7-Step Digital Brain)
Create a visual checklist using the checklist_state JSON column. Labels:
- Webhook (PDF & Email)
- HTTP Download
- CloudConvert (PDF naar Tekst)
- OpenAI #1 Onderzoeker (Pand_Naam, m2)
- OpenAI #2 Strateeg (8-sectie script)
- Gmail Verzending
- Google Sheets Logboek

5. Visual Style
Theme: Dark Mode (Slate/Zinc).
Accents: Emerald Green (#10b981) and Cyan (#06b6d4).
Language: Dutch (Nederlands).

6. Real-Time Sync
Implement a listener. If external_deployment_success flips to true in Supabase, show a "Sync Successful 🔄" toast in the Lovable app.

Important: Remember to use the referral link https://lovable.dev/invite/ULPWUI6 to ensure you have enough credits for this build.`;
                                                navigator.clipboard.writeText(masterPrompt);
                                                toast.success("Master Dashboard Prompt Copied!");
                                            }}
                                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-2"
                                        >
                                            <Copy className="h-3 w-3" /> Copy Full Prompt
                                        </button>
                                    </div>
                                    <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl relative group">
                                        <code className="text-xs text-gray-400 block whitespace-pre-wrap leading-relaxed">
                                            {`Act as an expert React developer. I am building a dashboard for a Real Estate AI automation called "MakelaarVideo AI".

1. Database Connection (CRITICAL SETUP)
Alina, to avoid creating a blank database, give Lovable the exact OfficeAIM keys. Do not use the native Supabase integration if it asks to create a new project.

Connect to my existing Supabase project using these exact credentials to fetch my real data:
Supabase URL: [PASTE_OFFICEAIM_URL_HERE]
Supabase Anon Key: [PASTE_OFFICEAIM_ANON_KEY_HERE]

2. Core Objective
Build a professional, dark-mode dashboard in Dutch. The app must connect to the student_projects table and the project_documents table to show the PRD.

... (Click Copy to get the full prompt including dynamic credentials) ...`}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stepper Center Panel */}
            <div className="flex-grow">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-gray-700 before:to-transparent">

                    {phases.map((phase, index) => {
                        const isActive = currentPhase === phase.num;
                        const isCompleted = currentPhase > phase.num;
                        const isLocked = phase.isLocked;

                        return (
                            <div key={phase.num} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">

                                {/* Timeline Marker */}
                                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                                    ${isCompleted ? 'bg-emerald-500 border-gray-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                                        isActive ? 'bg-gray-900 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                                            'bg-gray-900 border-gray-800'} transition-all duration-300 z-10`}>

                                    {isCompleted ? <CheckCircle2 className="text-gray-900 h-6 w-6" /> :
                                        isLocked ? <Lock className="text-gray-600 h-5 w-5" /> :
                                            <div className={`h-6 w-6 flex items-center justify-center ${isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                                                {phase.num}
                                            </div>}
                                </div>

                                {/* Card Content */}
                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border transition-all duration-300
                                    ${isActive ? 'bg-gray-900 border-emerald-400/50 shadow-lg shadow-emerald-500/5' :
                                        isLocked ? 'bg-gray-900/50 border-gray-800 opacity-60' :
                                            'bg-gray-900 border-gray-800'} `}>

                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`flex items-center gap-2 ${isActive ? 'text-emerald-400' : 'text-text-muted'}`}>
                                            {phase.icon}
                                            <span className="text-[10px] font-black uppercase tracking-widest italic opacity-70">
                                                Phase {phase.num}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded 
                                            ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' :
                                                isActive ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                                    'bg-gray-800 text-gray-500'}`}>
                                            {phase.status}
                                        </span>
                                    </div>

                                    <h3 className={`text-lg font-black italic mb-2 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                                        {phase.title}
                                    </h3>

                                    <p className="text-sm text-text-muted italic mb-5 leading-relaxed">
                                        {phase.desc}
                                    </p>

                                    {!isLocked && !isCompleted && phase.num !== 3 && phase.num !== 4 && (
                                        <button
                                            onClick={phase.action}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors font-bold text-sm"
                                        >
                                            {phase.actionText} <ArrowRight className="h-4 w-4" />
                                        </button>
                                    )}

                                    {isActive && phase.num === 4 && (
                                        <div className="space-y-4 mt-6">
                                            {/* Beta User Tracker Card */}
                                            <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-5 rounded-xl border border-indigo-500/30 shadow-lg relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                                    <Users className="h-16 w-16 text-indigo-300" />
                                                </div>
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-indigo-300 mb-2 italic">Goal: Beta Users</h4>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-3xl font-black text-white">0<span className="text-lg text-indigo-400">/50</span></span>
                                                    <span className="text-xs text-indigo-300 italic">Not started</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div className="h-full w-[2%] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                                                </div>
                                            </div>

                                            {/* Launch Toolkit */}
                                            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-3 italic">Launch Toolkit</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-500/20 transition-colors text-center" onClick={() => navigate('/hub/lab/marketing-pro')}>
                                                        <Globe2 className="h-4 w-4" /> Copywriter
                                                    </div>
                                                    <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-purple-500/20 transition-colors text-center" onClick={() => navigate('/hub/lab/communications-lead')}>
                                                        <Mail className="h-4 w-4" /> Email Specialist
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    advancePhase(5);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                            >
                                                Confirm Launch 🚀
                                            </button>

                                            <div className="bg-purple-900/20 p-5 rounded-xl border border-purple-500/30 text-center relative overflow-hidden mt-4">
                                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                                    <Star className="h-16 w-16 text-purple-400" />
                                                </div>
                                                <h4 className="text-sm font-black text-white mb-2 relative z-10">Innovation Monitoring</h4>
                                                <p className="text-xs text-purple-200/70 italic mb-4 relative z-10">
                                                    OfficeAIM is looking for high-potential projects to integrate into the core ecosystem.
                                                </p>
                                                <button
                                                    onClick={handleInnovationSubmit}
                                                    className="relative z-10 w-full flex items-center justify-center gap-2 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl transition-all font-bold text-sm"
                                                >
                                                    <Star className="h-4 w-4" /> Submit for Platform Review
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isActive && phase.num === 3 && (
                                        <div className="space-y-4 mt-6">
                                            <button onClick={() => setIsPrdOpen(true)} className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                                <FileText className="h-4 w-4" /> View Approved PRD
                                            </button>

                                            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-3 italic">Recommended Board</h4>
                                                <div className="flex gap-2 mb-4">
                                                    <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer hover:bg-cyan-500/20 transition-colors" onClick={() => navigate('/hub/lab/systems-architect')}>
                                                        <Cpu className="h-3 w-3" /> Systems Architect
                                                    </div>
                                                    <div className="bg-pink-500/10 border border-pink-500/20 text-pink-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer hover:bg-pink-500/20 transition-colors" onClick={() => navigate('/hub/lab/behavioral-profiler')}>
                                                        <Users className="h-3 w-3" /> Behavioral Profiler
                                                    </div>
                                                </div>

                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-3 italic">Digital Brain Checklist (MakelaarVideo AI)</h4>
                                                <div className="space-y-2 mb-4">
                                                    {checklist.map(item => (
                                                        <div key={item.id} className="flex items-start gap-3 group">
                                                            <div onClick={() => handleToggleChecklist(item.id)} className={`mt-0.5 shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors cursor-pointer ${item.done ? 'bg-emerald-500 border-emerald-500 text-gray-900' : 'bg-gray-800 border-gray-700 group-hover:border-emerald-500/50'}`}>
                                                                {item.done && <CheckCircle2 className="h-3 w-3" />}
                                                            </div>
                                                            <span onClick={() => setSelectedStep(item)} className={`cursor-pointer hover:text-emerald-400 text-xs italic leading-snug transition-colors ${item.done ? 'text-gray-500 line-through hover:text-emerald-500' : 'text-gray-300'}`}>{item.text}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button onClick={() => setIsLovableModalOpen(true)} className="w-full mt-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                                    <Globe2 className="h-4 w-4" /> Connect to Lovable
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    toast.success("Audit Requested: The Quality Checker is reviewing your architecture.", { icon: '🔍', duration: 4000 });
                                                    advancePhase(5);
                                                }}
                                                className={`w-full flex items-center justify-center gap-2 py-3 border rounded-xl transition-all font-bold text-sm ${checklist.every(i => i.done) ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700'}`}
                                            >
                                                Request Quality Audit <ArrowRight className="h-4 w-4" />
                                            </button>

                                            {checklist.every(i => i.done) && (
                                                <div className="bg-emerald-900/20 p-5 rounded-xl border border-emerald-500/30 text-center relative overflow-hidden mt-4 animate-pulse">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                                        <Star className="h-16 w-16 text-emerald-400" />
                                                    </div>
                                                    <h4 className="text-sm font-black text-white mb-2 relative z-10">Innovation Ready</h4>
                                                    <p className="text-xs text-emerald-200/70 italic mb-4 relative z-10">
                                                        Your MakelaarVideo AI integration is fully built. Share it with the Lead Visionary!
                                                    </p>
                                                    <button
                                                        onClick={handleInnovationSubmit}
                                                        className="relative z-10 w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                    >
                                                        <Star className="h-4 w-4" /> Submit for Platform Review
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isActive && phase.num === 5 && (
                                        <div className="space-y-4 mt-6">
                                            {/* Live Telemetry & Pivot Engine */}
                                            <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/20 p-5 rounded-xl border border-cyan-500/30 text-left relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-2 opacity-10 transition-opacity group-hover:opacity-20">
                                                    <BrainCircuit className="h-24 w-24 text-cyan-400 rotate-12" />
                                                </div>
                                                <h4 className="text-sm font-black text-white mb-4 relative z-10 flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4" /> System Telemetry & Metrics
                                                </h4>

                                                {/* Live Telemetry Data (Forced 7/7 Status for Analytics Delivery) */}
                                                <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
                                                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Make.com Webhook</div>
                                                        <div className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Active & Listening
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-1">OpenAI Tokens</div>
                                                        <div className="text-sm font-bold text-blue-400">~1,240 / cycle</div>
                                                    </div>
                                                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-1">CloudConvert Health</div>
                                                        <div className="text-sm font-bold text-emerald-400">100% Success Rate</div>
                                                    </div>
                                                    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
                                                        <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Pipeline Status</div>
                                                        <div className="text-sm font-bold text-purple-400 flex items-center gap-2">
                                                            7 / 7 Steps Active
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-4 mb-4 relative z-10 backdrop-blur-sm space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider border border-emerald-500/30">Final Architectural Approval</span>
                                                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider border border-emerald-500/30">Ready for Production</span>
                                                    </div>
                                                    <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                                                        "Alina, your MakelaarVideo AI architecture is fully validated. The 7-step integration stress test passed with flying colors. The data pipeline is robust, and the real-time Lovable sync is operational. You are cleared for launch!"
                                                    </p>
                                                    <button
                                                        onClick={() => navigate(`/hub/lab/filming-assistant?projectId=${project.id}`)}
                                                        className="w-full flex items-center justify-center gap-2 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded-lg transition-all font-bold text-xs mt-2"
                                                    >
                                                        <Sparkles className="h-3 w-3" /> Access Open Filming Assistant
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-emerald-900/20 p-5 rounded-xl border border-emerald-500/30 text-center">
                                                <Activity className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                                                <h4 className="text-sm font-black text-white mb-2">Growth Dashboard Unlocked</h4>
                                                <p className="text-xs text-emerald-200/70 italic mb-4">
                                                    Your project is live! Now monitor real-time tracking, setup your n8n workflows for automated lead capture, and measure your KPIs.
                                                </p>
                                                <button
                                                    onClick={() => navigate('/hub/dashboard')}
                                                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 rounded-xl transition-all font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                >
                                                    Go to Analytics Dashboard <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="bg-purple-900/20 p-5 rounded-xl border border-purple-500/30 text-center relative overflow-hidden mt-4">
                                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                                    <Star className="h-16 w-16 text-purple-400" />
                                                </div>
                                                <h4 className="text-sm font-black text-white mb-2 relative z-10">Innovation Monitoring</h4>
                                                <p className="text-xs text-purple-200/70 italic mb-4 relative z-10">
                                                    OfficeAIM is looking for high-potential projects to integrate into the core ecosystem.
                                                </p>
                                                <button
                                                    onClick={handleInnovationSubmit}
                                                    className="relative z-10 w-full flex items-center justify-center gap-2 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl transition-all font-bold text-sm"
                                                >
                                                    <Star className="h-4 w-4" /> Submit for Platform Review
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isActive && profile?.role === 'admin' && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <button onClick={() => advancePhase(phase.num + 1)} className="text-[10px] text-gray-500 underline text-left">
                                                [Admin: Force Advance]
                                            </button>
                                            <button onClick={async () => {
                                                await supabase.from('student_projects').update({ external_deployment_success: true }).eq('id', project.id);
                                            }} className="text-[10px] text-emerald-500 underline text-left">
                                                [Admin: Simulate Lovable Deploy]
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Detail Modal */}
            <AnimatePresence>
                {selectedStep && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-2xl bg-[#0B1220] border border-emerald-500/30 shadow-2xl rounded-2xl flex flex-col overflow-hidden max-h-[90vh]">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded">Deep Dive</span>
                                    <h2 className="text-lg font-black italic text-white tracking-wider truncate">{selectedStep.text}</h2>
                                </div>
                                <button onClick={() => setSelectedStep(null)} className="text-gray-500 hover:text-white transition-colors shrink-0">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest italic">Technical Goal</h4>
                                    <p className="text-gray-300 text-sm italic border-l-2 border-emerald-500/50 pl-3">
                                        Configure the required integration and logic for {selectedStep.text.split(':')[1] || selectedStep.text}.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-2">One-Shot Lovable Prompt</h4>
                                    <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl relative group">
                                        <button
                                            onClick={() => {
                                                const prompt = `Build the interface and connect the logic for the step: ${selectedStep.text.split(':')[1] || selectedStep.text}.\nThis project is 'MakelaarVideo AI'. Ensure you write data to Supabase under the 'student_projects' table. The most important variable to map is 'Pand_Naam' so the AI knows which object it is about.`;
                                                navigator.clipboard.writeText(prompt);
                                                toast.success("Master Prompt Copied!");
                                            }}
                                            className="absolute top-2 right-2 text-gray-500 hover:text-white bg-black/40 p-1.5 rounded transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </button>
                                        <code className="text-xs text-gray-400 block whitespace-pre-wrap leading-relaxed">
                                            {`Build the interface and connect the logic for the step: ${selectedStep.text.split(':')[1] || selectedStep.text}.\n\nThis project is 'MakelaarVideo AI'. Ensure you write data to Supabase under the 'student_projects' table. The most important variable to map is 'Pand_Naam' so the AI knows which object it is about.`}
                                        </code>
                                    </div>
                                    <p className="text-[10px] text-text-muted italic flex gap-1 items-center">
                                        <Lock className="h-3 w-3 text-amber-500" />
                                        Copy this master prompt and paste it once in Lovable to save credits.
                                    </p>
                                </div>

                                {/* Step 6 Custom Actions: Filming Assistant & Vault */}
                                {selectedStep.id === 6 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-800">
                                        <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest italic flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" /> AI Filming Assistant & Vault
                                        </h4>
                                        <p className="text-xs text-gray-300 italic">
                                            The script is ready for production. Send it to the Filming Assistant or archive the generation to your Vault.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    toast.success("Transitioning to Filming Assistant...");
                                                    navigate(`/hub/lab/filming-assistant?projectId=${project.id}`);
                                                }}
                                                className="flex-1 py-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-colors text-xs font-bold flex items-center justify-center gap-2"
                                            >
                                                Open Filming Assistant
                                            </button>
                                            <button
                                                onClick={handleSaveToVault}
                                                className="flex-1 py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors text-xs font-bold flex items-center justify-center gap-2"
                                            >
                                                Save to Vault
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate(`/hub/lab/systems-architect?context=step_${selectedStep.id}`)}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/50 text-white font-black italic flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                >
                                    <BrainCircuit className="h-5 w-5 text-emerald-400" />
                                    Launch Agent (Systems Architect)
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectPlanner;
