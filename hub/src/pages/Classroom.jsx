import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, PlayCircle, FileText, CheckCircle2, ChevronRight, Copy, Check, Lock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Classroom = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [curriculum, setCurriculum] = useState([]);
    const [lessonData, setLessonData] = useState(null);
    const [enrollment, setEnrollment] = useState(null);

    useEffect(() => {
        fetchData();
    }, [lessonId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Fetch Curriculum
            const { data: lessons, error: lError } = await supabase
                .from('lessons')
                .select('*')
                .order('order_index', { ascending: true });

            if (lessons) {
                // Group by module
                const grouped = lessons.reduce((acc, current) => {
                    const modNum = current.module_number;
                    if (!acc[modNum]) acc[modNum] = { module: `Module ${modNum}`, lessons: [] };
                    acc[modNum].lessons.push(current);
                    return acc;
                }, {});
                setCurriculum(Object.values(grouped));
            }

            // 2. Fetch Active Lesson
            const activeId = lessonId || '1-1';
            const { data: lesson, error: sError } = await supabase
                .from('lessons')
                .select('*')
                .eq('id', activeId)
                .single();

            if (lesson) setLessonData(lesson);

            // 3. Fetch Enrollment/Progress
            const { data: enroll } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', user.id)
                .single();
            setEnrollment(enroll);

        } catch (err) {
            console.error("Error fetching classroom data:", err);
        } finally {
            setLoading(false);
        }
    };

    const copyPrompt = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#05070A]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-secondary shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#05070A] overflow-hidden text-white font-plus-jakarta">
            {/* Sidebar */}
            <aside className="w-80 bg-[#0B1220] border-r border-white/5 flex flex-col hidden lg:flex">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/hub/dashboard')}
                        className="text-text-muted hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic"
                    >
                        <ChevronLeft className="h-3 w-3" />
                        BACK TO HUB
                    </button>
                    <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-secondary w-[40%] rounded-full shadow-[0_0_10px_#22D3EE]"></div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {curriculum.map((mod, mIdx) => (
                        <div key={mIdx}>
                            <div className="px-8 py-5 bg-white/[0.02] text-[10px] uppercase tracking-widest font-black text-text-muted italic">
                                {mod.module}
                            </div>
                            <div className="py-2">
                                {mod.lessons.map((lesson) => {
                                    const isActive = lessonData?.id === lesson.id;
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => navigate(`/hub/classroom/${lesson.id}`)}
                                            className={`w-full px-8 py-5 flex items-center gap-4 transition-all border-l-2 ${isActive
                                                ? 'bg-accent-secondary/5 border-accent-secondary text-white'
                                                : 'border-transparent text-text-muted hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex-shrink-0">
                                                <div className={`h-4 w-4 rounded-full border ${isActive ? 'border-accent-secondary bg-accent-secondary shadow-[0_0_8px_#22D3EE]' : 'border-current opacity-20'}`} />
                                            </div>
                                            <div className="flex-grow text-left">
                                                <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-text-muted'}`}>{lesson.title}</div>
                                                <div className="text-[10px] opacity-40 mt-1 uppercase italic tracking-widest font-black">Lesson {lesson.module_number}.{lesson.lesson_number}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={lessonData?.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-4xl mx-auto py-16 px-8"
                    >
                        <div className="mb-10 flex items-center gap-4">
                            <span className="px-3 py-1 bg-accent-secondary/10 text-accent-secondary rounded-lg text-[10px] font-black tracking-widest uppercase italic border border-accent-secondary/20">Module {lessonData?.module_number}.{lessonData?.lesson_number}</span>
                            <span className="h-px flex-grow bg-white/5"></span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-black mb-16 leading-tight italic">
                            {lessonData?.title.split(':')[0]}
                            {lessonData?.title.includes(':') && (
                                <><br /><span className="title-gradient">{lessonData.title.split(':')[1]}</span></>
                            )}
                        </h1>

                        <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 relative group mb-16">
                            {lessonData?.video_url && lessonData.video_url.includes('youtube') ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={lessonData.video_url.replace('watch?v=', 'embed/')}
                                    title="Lesson Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            ) : (
                                <>
                                    <img src={lessonData?.image_url || "/images/example_1.webp"} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Lesson Thumbnail" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="bg-accent-secondary p-8 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.5)] cursor-pointer"
                                        >
                                            <PlayCircle className="h-10 w-10 text-white" />
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none space-y-16">
                            <section className="space-y-8">
                                <p className="text-2xl text-white font-medium leading-relaxed italic border-l-4 border-accent-secondary pl-8 py-4 bg-accent-secondary/[0.03] rounded-r-3xl">
                                    "{lessonData?.content}"
                                </p>
                            </section>

                            <motion.div
                                className="p-12 border border-accent-secondary/20 bg-accent-secondary/[0.05] rounded-[3rem] space-y-10 relative overflow-hidden"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-accent-secondary/5 blur-[100px] rounded-full -mr-24 -mt-24"></div>

                                <div className="flex items-center gap-5">
                                    <div className="bg-accent-secondary p-4 rounded-2xl text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-3xl font-black italic tracking-tight text-white uppercase">The Action Box</h3>
                                </div>

                                <p className="text-white font-medium text-2xl leading-snug italic">
                                    {lessonData?.action_box}
                                </p>

                                <div className="bg-black/60 p-10 rounded-[2rem] border border-white/10 font-mono text-lg relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent-secondary/30"></div>
                                    <p className="pr-12 text-accent-secondary/90 leading-relaxed font-black italic">
                                        "{lessonData?.ai_prompt}"
                                    </p>
                                    <button
                                        onClick={() => copyPrompt(lessonData?.ai_prompt)}
                                        className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-accent-secondary hover:text-white rounded-2xl transition-all shadow-xl border border-white/10"
                                    >
                                        {copied ? <Check className="h-6 w-6 text-green-400" /> : <Copy className="h-6 w-6" />}
                                    </button>
                                </div>
                            </motion.div>

                            <section className="pt-16 border-t border-white/5 flex items-center justify-between">
                                <button
                                    onClick={() => navigate('/hub/dashboard')}
                                    className="flex items-center gap-2 text-[10px] font-black text-text-muted hover:text-white transition-all uppercase tracking-widest italic"
                                >
                                    <ChevronLeft className="h-4 w-4" /> RECAP DASHBOARD
                                </button>
                                <button className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-accent-secondary hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95">
                                    COMPLETE LESSON
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </section>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Classroom;
