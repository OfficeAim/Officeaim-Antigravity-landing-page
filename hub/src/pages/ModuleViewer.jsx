import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Lock, PlayCircle, Trophy, Target, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ModuleViewer = () => {
    const navigate = useNavigate();
    const { moduleId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data from Supabase
    const [module, setModule] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [studentProgress, setStudentProgress] = useState({});

    // UI State
    const [currentView, setCurrentView] = useState('intro'); // 'intro', 'lesson', 'quiz'
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(null);
    const [user, setUser] = useState(null);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    // Load module data
    useEffect(() => {
        if (!moduleId) return;
        loadModuleData();
    }, [moduleId, user]);

    const loadModuleData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load module
            const { data: moduleData, error: moduleError } = await supabase
                .from('modules')
                .select('*')
                .eq('id', moduleId)
                .single();

            if (moduleError) throw moduleError;
            setModule(moduleData);

            // Load lessons
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', moduleId)
                .order('order_index', { ascending: true });

            if (lessonsError) throw lessonsError;
            setLessons(lessonsData);

            // Load student progress if user is logged in
            if (user) {
                const { data: progressData, error: progressError } = await supabase
                    .from('student_progress')
                    .select('*')
                    .eq('user_id', user.id);

                if (progressError) throw progressError;

                // Convert to object for easy lookup
                const progressMap = {};
                progressData.forEach(p => {
                    progressMap[p.lesson_id] = p;
                });
                setStudentProgress(progressMap);

                // Track completion for automation
                checkModuleCompletion(progressMap, lessonsData.length);

                // Initialize progress for first lesson if none exists
                if (lessonsData.length > 0 && !progressMap[lessonsData[0].id]) {
                    await initializeFirstLesson(lessonsData[0].id);
                }
            }

        } catch (err) {
            console.error('Error loading module:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const initializeFirstLesson = async (lessonId) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('student_progress')
                .insert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    status: 'in_progress'
                });

            if (error) throw error;

            // Reload progress
            loadModuleData();
        } catch (err) {
            console.error('Error initializing lesson:', err);
        }
    };

    const loadLesson = async (lesson) => {
        setCurrentLesson(lesson);
        setCurrentView('lesson');
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);

        // Load quiz questions
        const { data: questions, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('lesson_id', lesson.id)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error loading quiz:', error);
            return;
        }

        setQuizQuestions(questions);

        // Update progress to in_progress if not already
        if (user && (!studentProgress[lesson.id] || studentProgress[lesson.id].status === 'locked')) {
            await supabase
                .from('student_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: lesson.id,
                    status: 'in_progress'
                });
        }
    };

    const handleAnswerSelect = (questionIndex, optionIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIndex]: optionIndex
        });
    };

    const handleQuizSubmit = async () => {
        let correct = 0;
        const answers = {};

        quizQuestions.forEach((q, idx) => {
            const selectedOption = ['A', 'B', 'C', 'D'][selectedAnswers[idx]];
            answers[q.id] = selectedOption;

            if (selectedOption === q.correct_answer) {
                correct++;
            }
        });

        const score = Math.round((correct / quizQuestions.length) * 100);
        const requiredScore = currentLesson?.passing_threshold || 80;
        const passed = score >= requiredScore;

        setQuizScore(score);
        setQuizSubmitted(true);

        // Save quiz attempt to database
        if (user) {
            try {
                // Save attempt
                await supabase
                    .from('quiz_attempts')
                    .insert({
                        user_id: user.id,
                        lesson_id: currentLesson.id,
                        score: score,
                        answers: answers,
                        passed: passed
                    });

                // Update progress
                const updateData = {
                    user_id: user.id,
                    lesson_id: currentLesson.id,
                    status: passed ? 'completed' : 'in_progress',
                    quiz_score: score,
                    quiz_attempts: (studentProgress[currentLesson.id]?.quiz_attempts || 0) + 1
                };

                if (passed) {
                    updateData.completed_at = new Date().toISOString();
                }

                await supabase
                    .from('student_progress')
                    .upsert(updateData);

                // If passed, unlock next lesson
                if (passed) {
                    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                    if (currentIndex < lessons.length - 1) {
                        // Unlock next lesson in same module
                        const nextLesson = lessons[currentIndex + 1];
                        await supabase
                            .from('student_progress')
                            .upsert({
                                user_id: user.id,
                                lesson_id: nextLesson.id,
                                status: 'in_progress'
                            });
                    }
                    // Note: next module unlocking is handled in the UI via navigation
                }

                // Reload progress
                loadModuleData();
            } catch (err) {
                console.error('Error saving quiz:', err);
            }
        }
    };

    const convertVideoUrl = (url) => {
        if (!url) return '';
        // Google Drive: already in /preview format
        if (url.includes('drive.google.com') && url.includes('/preview')) {
            return url;
        }
        // Google Drive: convert /view to /preview
        if (url.includes('drive.google.com') && url.includes('/view')) {
            return url.replace(/\/view.*$/, '/preview');
        }
        // Google Drive: extract file ID from share link
        if (url.includes('drive.google.com/file/d/')) {
            const fileId = url.match(/\/file\/d\/([^/]+)/)?.[1];
            if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        // YouTube: youtu.be short links
        if (url.includes('youtu.be')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // YouTube: watch links
        if (url.includes('watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }
        // NotebookLM or other direct URLs — pass through
        return url;
    };

    const checkModuleCompletion = async (progressMap, totalLessons) => {
        const completedCount = Object.values(progressMap).filter(p => p.status === 'completed').length;

        if (completedCount === totalLessons && totalLessons > 0) {
            console.log("🏆 Module 100% Complete! Triggering certificate automation...");
            await pingN8N();
        }
    };

    const pingN8N = async () => {
        if (!user || !module) return;

        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn("n8n Webhook URL not configured in .env");
            return;
        }

        try {
            const payload = {
                event: 'module_completed',
                user_id: user.id,
                user_email: user.email,
                module_id: module.id,
                module_title: module.title,
                completion_date: new Date().toISOString(),
                score: calculateProgress()
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log("✅ n8n Certificate Trigger Sent Successfully");
            } else {
                console.error("❌ n8n Trigger Failed:", response.statusText);
            }
        } catch (err) {
            console.error("❌ Error pinging n8n:", err);
        }
    };

    const isLessonUnlocked = (lesson) => {
        if (!user) return false;
        const progress = studentProgress[lesson.id];
        return progress && progress.status !== 'locked';
    };

    const calculateProgress = () => {
        if (lessons.length === 0) return 0;
        const completed = Object.values(studentProgress).filter(p => p.status === 'completed').length;
        return Math.round((completed / lessons.length) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-accent-secondary mx-auto mb-4" />
                    <p className="text-text-muted italic">Loading module...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center p-8">
                <div className="max-w-md text-center">
                    <h2 className="text-2xl font-black mb-4 text-red-500">Error Loading Module</h2>
                    <p className="text-text-muted mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/hub/dashboard')}
                        className="px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-accent-secondary hover:text-white transition-all"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-[#05070A] text-white flex items-center justify-center">
                <p className="text-text-muted">Module not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05070A] text-white font-plus-jakarta">
            {/* Header */}
            <header className="border-b border-white/5 bg-[#0B1220]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/hub/dashboard')}
                        className="flex items-center gap-2 text-text-muted hover:text-white transition-all text-xs font-black uppercase tracking-widest italic"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-text-muted uppercase tracking-widest font-black italic">Progress</div>
                            <div className="text-2xl font-black italic text-accent-secondary">{calculateProgress()}%</div>
                        </div>
                        <div className="h-2 w-32 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateProgress()}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {/* Module Introduction */}
                {currentView === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-5xl mx-auto px-8 py-16"
                    >
                        {/* Module Title */}
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-secondary/10 text-accent-secondary rounded-xl text-xs font-black tracking-widest uppercase italic border border-accent-secondary/20 mb-6">
                                <Trophy className="h-4 w-4" />
                                Module {moduleId}
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight italic">
                                {module.title.split('-')[0]}
                                <br />
                                <span className="bg-gradient-to-r from-accent-secondary to-accent-primary bg-clip-text text-transparent">
                                    {module.title.split('-')[1]}
                                </span>
                            </h1>
                            <p className="text-2xl text-text-muted italic font-medium">
                                {module.description}
                            </p>
                        </div>

                        {/* Welcome Video */}
                        {module.intro_video_url && (
                            <div className="mb-16">
                                <h2 className="text-2xl font-black mb-6 italic flex items-center gap-3">
                                    <PlayCircle className="h-6 w-6 text-accent-secondary" />
                                    Welcome to Module {moduleId}
                                </h2>
                                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={convertVideoUrl(module.intro_video_url)}
                                        title="Module Introduction"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Lesson Cards */}
                        <div className="space-y-6 mb-12">
                            <h2 className="text-2xl font-black italic">What You'll Learn</h2>
                            {lessons.map((lesson, idx) => {
                                const progress = studentProgress[lesson.id];
                                const isUnlocked = isLessonUnlocked(lesson);
                                const isCompleted = progress?.status === 'completed';

                                return (
                                    <motion.div
                                        key={lesson.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-8 bg-[#0B1220] border rounded-2xl transition-all ${isUnlocked
                                            ? 'border-white/5 hover:border-accent-secondary/30 cursor-pointer group'
                                            : 'border-white/5 opacity-50'
                                            }`}
                                        onClick={() => isUnlocked && loadLesson(lesson)}
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className="flex-shrink-0">
                                                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-xl ${isCompleted
                                                    ? 'bg-green-500/20 border-2 border-green-500 text-green-500'
                                                    : isUnlocked
                                                        ? 'bg-accent-secondary/10 border-2 border-accent-secondary text-accent-secondary'
                                                        : 'bg-white/5 border-2 border-white/20 text-white/40'
                                                    }`}>
                                                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className={`text-xl font-black mb-2 italic ${isUnlocked ? 'group-hover:text-accent-secondary transition-colors' : 'text-white/40'
                                                    }`}>
                                                    {lesson.title}
                                                </h3>
                                                <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-text-muted' : 'text-white/30'
                                                    }`}>
                                                    {lesson.smart_goal}
                                                </p>
                                                {!isUnlocked && (
                                                    <p className="text-xs text-white/40 mt-2 flex items-center gap-2">
                                                        <Lock className="h-3 w-3" />
                                                        Complete previous lesson to unlock
                                                    </p>
                                                )}
                                            </div>
                                            {isUnlocked && (
                                                <ChevronRight className="h-6 w-6 text-text-muted group-hover:text-accent-secondary group-hover:translate-x-1 transition-all" />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Start Button */}
                        {lessons.length > 0 && isLessonUnlocked(lessons[0]) && (
                            <motion.button
                                onClick={() => loadLesson(lessons[0])}
                                className="w-full py-8 bg-gradient-to-r from-accent-secondary to-accent-primary text-white font-black uppercase tracking-widest italic rounded-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all text-xl flex items-center justify-center gap-4 group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Start Module {moduleId}
                                <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* Lesson View */}
                {currentView === 'lesson' && currentLesson && (
                    <motion.div
                        key="lesson"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-5xl mx-auto px-8 py-16"
                    >
                        {/* Lesson Header */}
                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-secondary/10 text-accent-secondary rounded-xl text-xs font-black tracking-widest uppercase italic border border-accent-secondary/20 mb-6">
                                Lesson {currentLesson.id}
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black mb-8 leading-tight italic">
                                {currentLesson.title}
                            </h1>

                            {/* SMART Goal */}
                            <div className="p-8 bg-gradient-to-br from-accent-secondary/10 to-accent-primary/10 border border-accent-secondary/20 rounded-2xl mb-12">
                                <div className="flex items-start gap-4">
                                    <Target className="h-6 w-6 text-accent-secondary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-accent-secondary mb-3 italic">
                                            🎯 Your SMART Goal
                                        </h3>
                                        <p className="text-lg leading-relaxed italic font-medium">
                                            {currentLesson.smart_goal}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video */}
                        {currentLesson.video_url && (
                            <div className="mb-16">
                                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={convertVideoUrl(currentLesson.video_url)}
                                        title="Lesson Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Lesson Image Overlay - Reinforcing the topic */}
                        {currentLesson.image_url && (
                            <div className="mb-16 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                <img
                                    src={currentLesson.image_url}
                                    alt={currentLesson.title}
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-invert max-w-none space-y-8 mb-16"
                            dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                        />

                        {/* Take Quiz Button */}
                        <motion.button
                            onClick={() => setCurrentView('quiz')}
                            className="w-full py-8 bg-gradient-to-r from-accent-secondary to-accent-primary text-white font-black uppercase tracking-widest italic rounded-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all text-xl flex items-center justify-center gap-4 group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Take the Quiz
                            <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </motion.button>

                        <button
                            onClick={() => setCurrentView('intro')}
                            className="mt-6 text-text-muted hover:text-white transition-all text-sm font-black uppercase tracking-widest italic flex items-center gap-2 mx-auto"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Module Overview
                        </button>
                    </motion.div>
                )}

                {/* Quiz View */}
                {currentView === 'quiz' && currentLesson && (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl mx-auto px-8 py-16"
                    >
                        <div className="mb-12">
                            <h1 className="text-5xl font-black mb-4 italic">
                                Test Your Knowledge
                            </h1>
                            <p className="text-xl text-text-muted italic">
                                Answer all questions to complete this lesson. You need 80% to pass.
                            </p>
                        </div>

                        {/* Questions */}
                        <div className="space-y-8 mb-12">
                            {quizQuestions.map((q, qIdx) => (
                                <div key={q.id} className="p-8 bg-[#0B1220] border border-white/5 rounded-2xl">
                                    <h3 className="text-xl font-black mb-6 italic">
                                        Question {qIdx + 1}: {q.question_text}
                                    </h3>
                                    <div className="space-y-3">
                                        {['A', 'B', 'C', 'D'].map((letter, oIdx) => {
                                            const optionText = q[`option_${letter.toLowerCase()}`];
                                            const isSelected = selectedAnswers[qIdx] === oIdx;
                                            const isCorrect = q.correct_answer === letter;
                                            const showFeedback = quizSubmitted;

                                            return (
                                                <button
                                                    key={letter}
                                                    onClick={() => !quizSubmitted && handleAnswerSelect(qIdx, oIdx)}
                                                    disabled={quizSubmitted}
                                                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${showFeedback && isCorrect
                                                        ? 'bg-green-500/10 border-green-500 text-green-400'
                                                        : showFeedback && isSelected && !isCorrect
                                                            ? 'bg-red-500/10 border-red-500 text-red-400'
                                                            : isSelected
                                                                ? 'bg-accent-secondary/10 border-accent-secondary text-accent-secondary'
                                                                : 'bg-white/5 border-white/10 text-text-muted hover:border-accent-secondary/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${showFeedback && isCorrect
                                                            ? 'border-green-500 bg-green-500'
                                                            : isSelected
                                                                ? 'border-current bg-current'
                                                                : 'border-current'
                                                            }`}>
                                                            {(isSelected || (showFeedback && isCorrect)) && (
                                                                <CheckCircle2 className="h-4 w-4 text-white" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium">{optionText}</span>
                                                    </div>
                                                    {showFeedback && isCorrect && q.explanation && (
                                                        <p className="mt-3 text-sm text-green-300 pl-10">
                                                            ✓ {q.explanation}
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit/Results */}
                        {!quizSubmitted ? (
                            <motion.button
                                onClick={handleQuizSubmit}
                                disabled={Object.keys(selectedAnswers).length !== quizQuestions.length}
                                className="w-full py-8 bg-gradient-to-r from-accent-secondary to-accent-primary text-white font-black uppercase tracking-widest italic rounded-2xl hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Submit Quiz
                            </motion.button>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-12 rounded-3xl text-center ${quizScore >= (currentLesson?.passing_threshold || 80)
                                    ? 'bg-gradient-to-br from-green-500/20 to-accent-secondary/20 border-2 border-green-500'
                                    : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500'
                                    }`}
                            >
                                <div className="text-6xl font-black mb-4 italic">
                                    {quizScore >= (currentLesson?.passing_threshold || 80) ? '🎉' : '📚'}
                                </div>
                                <h2 className="text-4xl font-black mb-4 italic">
                                    {quizScore >= (currentLesson?.passing_threshold || 80) ? 'Congratulations!' : 'Keep Learning!'}
                                </h2>
                                <p className="text-2xl mb-8 italic">
                                    Your Score: <span className="font-black text-accent-secondary">{quizScore}%</span>
                                </p>
                                {quizScore >= (currentLesson?.passing_threshold || 80) ? (
                                    <>
                                        {(() => {
                                            const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                                            const isLastLesson = currentIndex >= lessons.length - 1;
                                            const nextModuleId = module.id + 1;

                                            if (isLastLesson) {
                                                return (
                                                    <>
                                                        <p className="text-lg text-text-muted mb-8">
                                                            🏆 You've completed <strong>{module.title}</strong>! Amazing work!
                                                        </p>
                                                        <button
                                                            onClick={() => navigate(`/hub/module/${nextModuleId}`)}
                                                            className="px-12 py-6 bg-gradient-to-r from-accent-secondary to-accent-primary text-black font-black uppercase tracking-widest italic rounded-2xl hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all"
                                                        >
                                                            🚀 Continue to Module {nextModuleId}
                                                        </button>
                                                        <button
                                                            onClick={() => navigate('/hub/dashboard')}
                                                            className="mt-4 px-8 py-3 text-text-muted hover:text-white font-black uppercase tracking-widest italic text-xs transition-all block mx-auto"
                                                        >
                                                            Back to Dashboard
                                                        </button>
                                                    </>
                                                );
                                            }
                                            return (
                                                <>
                                                    <p className="text-lg text-text-muted mb-8">
                                                        You've completed {currentLesson.title}! The next lesson is now unlocked.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setCurrentView('intro');
                                                            loadModuleData();
                                                        }}
                                                        className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-accent-secondary hover:text-white transition-all"
                                                    >
                                                        Continue to Next Lesson
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg text-text-muted mb-8">
                                            You need {currentLesson?.passing_threshold || 80}% to pass. Review the lesson and try again!
                                        </p>
                                        <button
                                            onClick={() => {
                                                setQuizSubmitted(false);
                                                setSelectedAnswers({});
                                                setQuizScore(null);
                                            }}
                                            className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-accent-secondary hover:text-white transition-all"
                                        >
                                            Retry Quiz
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}

                        <button
                            onClick={() => setCurrentView('lesson')}
                            className="mt-6 text-text-muted hover:text-white transition-all text-sm font-black uppercase tracking-widest italic flex items-center gap-2 mx-auto"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Lesson
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModuleViewer;
