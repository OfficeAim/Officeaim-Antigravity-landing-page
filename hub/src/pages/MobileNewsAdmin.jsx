import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Clipboard, ArrowLeft, Send, Trash2, Edit3, 
    CheckCircle2, AlertCircle, ExternalLink, RefreshCw, Plus, 
    Clock, Youtube, ChevronDown, Check, X, ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { toSentenceCase, extractYouTubeId, isYouTubePublished } from '../lib/youtube';
import { Link } from 'react-router-dom';

const OFFICIAL_CATEGORIES = [
    'Generative AI',
    'Generative AI • AI Music',
    'Generative Visuals',
    'Autonomous Agents',
    'AI Workflow Strategy',
    'Prompt Architecture',
    'Product Engineering'
];

export const parseTransmissionMarkdown = (rawText) => {
    if (!rawText || typeof rawText !== 'string') return {};

    const text = rawText.trim();
    const lines = text.split(/\r?\n/).map(l => l.trim());

    let title = '';
    let category = '';
    let youtube_url = '';
    let date = '';

    // 1. Extract Title
    const titleMatch = text.match(/^(?:Title|SEO title):\s*(.+)$/im);
    if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/^\*\*|\*\*$/g, '').trim();
    } else {
        const h1Match = text.match(/^#\s+(.+)$/m);
        if (h1Match && h1Match[1]) {
            title = h1Match[1].replace(/^\*\*|\*\*$/g, '').trim();
        } else if (lines.length > 0 && lines[0].length > 5 && !lines[0].startsWith('---') && !lines[0].toLowerCase().startsWith('category')) {
            title = lines[0].replace(/^\*\*|\*\*$/g, '').trim();
        }
    }

    // 2. Extract Category
    const categoryMatch = text.match(/^(?:Category|Categoría):\s*(.+)$/im);
    if (categoryMatch && categoryMatch[1]) {
        category = categoryMatch[1].replace(/^\*\*|\*\*$/g, '').trim();
    }

    // 3. Extract YouTube URL
    const ytMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch && ytMatch[0]) {
        youtube_url = ytMatch[0].trim();
    } else if (/youtube:\s*not published/i.test(text) || /video:\s*not published/i.test(text) || /not published/i.test(text)) {
        youtube_url = 'Not published';
    }

    // 4. Extract Date
    const dateMatch = text.match(/^(?:Date|Fecha):\s*(.+)$/im);
    if (dateMatch && dateMatch[1]) {
        date = dateMatch[1].replace(/^\*\*|\*\*$/g, '').trim();
    }

    // 5. Clean Transmission Body
    let cleanLines = [];
    let hasSkippedHeader = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.toLowerCase();

        if (!hasSkippedHeader) {
            if (!line) continue;
            if (title && line.toLowerCase() === title.toLowerCase()) continue;
            if (lower.startsWith('title:') || lower.startsWith('seo title:') || lower.startsWith('# ')) continue;
            if (lower.startsWith('category:') || lower.startsWith('categoría:')) continue;
            if (lower.startsWith('date:') || lower.startsWith('fecha:')) continue;
            if (lower.startsWith('officeaim newsroom metadata:') || lower.startsWith('metadata:')) continue;
            if (lower.startsWith('---') || lower.startsWith('===')) continue;
            if (lower.startsWith('https://youtu.be') || lower.startsWith('https://www.youtube.com')) continue;
            if (lower.startsWith('youtube:') || lower.startsWith('video:')) continue;
            if (lower.includes('[insert_') && lower.includes('_embed_here]')) continue;
            hasSkippedHeader = true;
        }

        if (lower.includes('[insert_') && lower.includes('_embed_here]')) continue;
        if (youtube_url && line === youtube_url) continue;

        cleanLines.push(lines[i]);
    }

    let description = cleanLines.join('\n').trim();

    return {
        title: title ? toSentenceCase(title) : '',
        category,
        youtube_url: youtube_url || 'Not published',
        date,
        description
    };
};

const MobileNewsAdmin = ({ profile }) => {
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form fields
    const [formData, setFormData] = useState({
        title: '',
        category: 'Generative AI',
        youtube_url: '',
        description: '',
        published: true
    });

    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryInput, setCustomCategoryInput] = useState('');
    const [manualPasteOpen, setManualPasteOpen] = useState(false);
    const [manualPasteText, setManualPasteText] = useState('');

    const fetchLatestNews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setNewsList(data || []);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            toast.error('Failed to load recent dispatches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestNews();
    }, []);

    // Smart Paste handler
    const handleSmartPaste = async () => {
        try {
            let clipboardText = '';
            if (navigator?.clipboard?.readText) {
                clipboardText = await navigator.clipboard.readText();
            }

            if (!clipboardText || clipboardText.trim().length === 0) {
                setManualPasteOpen(true);
                return;
            }

            applyParsedText(clipboardText);
        } catch (err) {
            console.warn('Clipboard read failed, falling back to manual drawer:', err);
            setManualPasteOpen(true);
        }
    };

    const applyParsedText = (text) => {
        const parsed = parseTransmissionMarkdown(text);

        if (!parsed.title && !parsed.description) {
            toast.error('Could not detect transmission fields');
            setManualPasteOpen(true);
            return;
        }

        let catToSet = parsed.category || 'Generative AI';
        if (OFFICIAL_CATEGORIES.includes(catToSet)) {
            setIsCustomCategory(false);
        } else if (catToSet) {
            setIsCustomCategory(true);
            setCustomCategoryInput(catToSet);
        }

        setFormData(prev => ({
            ...prev,
            title: parsed.title ? toSentenceCase(parsed.title) : prev.title,
            category: OFFICIAL_CATEGORIES.includes(catToSet) ? catToSet : 'CUSTOM',
            youtube_url: parsed.youtube_url || prev.youtube_url || 'Not published',
            description: parsed.description || prev.description
        }));

        setManualPasteOpen(false);
        setManualPasteText('');
        toast.success('⚡ Transmission auto-filled successfully!', { icon: '✨' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalTitle = formData.title.trim();
        if (!finalTitle) {
            toast.error('Title is required');
            return;
        }

        const finalCategory = isCustomCategory 
            ? (customCategoryInput.trim() || 'Generative AI')
            : formData.category;

        const finalYouTubeUrl = formData.youtube_url.trim() || 'Not published';

        if (!formData.description.trim()) {
            toast.error('Transmission body cannot be empty');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: toSentenceCase(finalTitle),
                category: finalCategory,
                youtube_url: finalYouTubeUrl,
                description: formData.description.trim(),
                published: formData.published,
                published_at: new Date().toISOString()
            };

            if (editingId) {
                const { error } = await supabase
                    .from('news')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Transmission updated live!', { icon: '✅' });
                setEditingId(null);
            } else {
                const { error } = await supabase
                    .from('news')
                    .insert([payload]);

                if (error) throw error;
                toast.success('🚀 Transmission published to Newsroom!', { icon: '🔥' });
            }

            // Reset form
            setFormData({
                title: '',
                category: 'Generative AI',
                youtube_url: '',
                description: '',
                published: true
            });
            setIsCustomCategory(false);
            setCustomCategoryInput('');

            fetchLatestNews();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Submit error:', err);
            toast.error(err.message || 'Error saving transmission');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        const isOfficial = OFFICIAL_CATEGORIES.includes(item.category);
        setIsCustomCategory(!isOfficial);
        if (!isOfficial) {
            setCustomCategoryInput(item.category);
        }

        setFormData({
            title: toSentenceCase(item.title),
            category: isOfficial ? item.category : 'CUSTOM',
            youtube_url: item.youtube_url || 'Not published',
            description: item.description || '',
            published: item.published ?? true
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast('Editing transmission...', { icon: '✏️' });
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete this transmission?\n\n"${title}"`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Transmission deleted');
            if (editingId === id) {
                setEditingId(null);
                setFormData({
                    title: '',
                    category: 'Generative AI',
                    youtube_url: '',
                    description: '',
                    published: true
                });
            }
            fetchLatestNews();
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Failed to delete transmission');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            title: '',
            category: 'Generative AI',
            youtube_url: '',
            description: '',
            published: true
        });
        setIsCustomCategory(false);
        setCustomCategoryInput('');
    };

    return (
        <div className="min-h-screen bg-[#070A12] text-white font-plus-jakarta pb-24 selection:bg-cyan-500/30">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[#0A0F1D]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link 
                        to="/hub/vlog-news" 
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-center"
                        title="Back to Campus News"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Mobile Fast Publisher</span>
                        </div>
                        <h1 className="text-sm font-extrabold text-white leading-tight">
                            OfficeAIM Newsroom
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a 
                        href="/news" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-slate-400 hover:text-cyan-400 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                        <span>Public View</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 pt-5 space-y-6">
                {/* Editing Notification Banner */}
                {editingId && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                            <span>✏️ Editing Mode Active</span>
                        </div>
                        <button 
                            onClick={handleCancelEdit}
                            className="text-[11px] font-bold text-amber-400 hover:text-white underline"
                        >
                            Cancel Edit
                        </button>
                    </motion.div>
                )}

                {/* Top Prominent Action: Smart Paste Button */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={handleSmartPaste}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4 fill-black" />
                        <span>⚡ SMART PASTE (Auto-Fill from Clipboard)</span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
                        One-tap auto-parsing for Markdown, YouTube URLs & Categories
                    </p>
                </div>

                {/* Main Publishing Form */}
                <form onSubmit={handleSubmit} className="p-5 rounded-3xl bg-[#0A0F1D] border border-cyan-500/25 shadow-xl space-y-4">
                    {/* Title */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                                Transmission Title
                            </label>
                            {formData.title && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, title: toSentenceCase(p.title) }))}
                                    className="text-[10px] text-orange-400 hover:text-orange-300 font-mono underline"
                                >
                                    Format Sentence Case
                                </button>
                            )}
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Suno v6 turns music ideas into drafts—but know the free-plan limits"
                            value={formData.title}
                            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Category Selector */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
                            Category
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            <select
                                value={isCustomCategory ? 'CUSTOM' : formData.category}
                                onChange={(e) => {
                                    if (e.target.value === 'CUSTOM') {
                                        setIsCustomCategory(true);
                                    } else {
                                        setIsCustomCategory(false);
                                        setFormData(p => ({ ...p, category: e.target.value }));
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-sm focus:outline-none transition-all"
                            >
                                {OFFICIAL_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                <option value="CUSTOM">+ Add custom category...</option>
                            </select>

                            {isCustomCategory && (
                                <input
                                    type="text"
                                    placeholder="Type custom category name (e.g. AI Creative Tools)"
                                    value={customCategoryInput}
                                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-orange-500/40 text-orange-200 text-xs focus:outline-none placeholder:text-slate-600"
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                                YouTube URL (or "Not published")
                            </label>
                            {formData.youtube_url && !isYouTubePublished(formData.youtube_url) && (
                                <span className="text-[10px] text-orange-400 font-mono flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> Scheduled / Coming Soon
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="https://youtu.be/... or 'Not published'"
                                value={formData.youtube_url}
                                onChange={(e) => setFormData(p => ({ ...p, youtube_url: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-sm placeholder:text-slate-600 focus:outline-none transition-all"
                            />
                            {formData.youtube_url && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, youtube_url: 'Not published' }))}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400 hover:text-white"
                                >
                                    Set "Not published"
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Transmission Body */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
                            Transmission Body (Markdown supported)
                        </label>
                        <textarea
                            required
                            rows={8}
                            placeholder="Write or paste transmission body (supports ## Headings, - Bullets, FAQ questions, Editorial note, etc.)..."
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-mono leading-relaxed placeholder:text-slate-600 focus:outline-none transition-all resize-y"
                        />
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-xs font-bold text-slate-300">
                            Broadcast Status:
                        </span>
                        <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, published: !p.published }))}
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                                formData.published 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                        >
                            {formData.published ? '● Live / Published' : '○ Draft'}
                        </button>
                    </div>

                    {/* Big Action Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>{editingId ? '💾 UPDATE TRANSMISSION' : '🚀 PUBLISH TRANSMISSION'}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Recent Dispatches Section (Latest 5) */}
                <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                                Latest 5 Transmissions
                            </h2>
                        </div>
                        <button 
                            onClick={fetchLatestNews}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Refresh dispatches"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-10 text-center">
                            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Loading dispatches...</span>
                        </div>
                    ) : newsList.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-xs text-slate-400">No dispatches found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {newsList.map((item) => {
                                const hasVideo = isYouTubePublished(item.youtube_url);
                                const isCurrentEdit = editingId === item.id;

                                return (
                                    <div 
                                        key={item.id}
                                        className={`p-4 rounded-2xl bg-[#0A0F1D] border transition-all ${
                                            isCurrentEdit 
                                                ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]' 
                                                : 'border-white/10 hover:border-cyan-500/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                                    {item.category}
                                                </span>
                                                {hasVideo ? (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold text-cyan-300 bg-black/40 border border-cyan-500/30">
                                                        ▶ VIDEO
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30">
                                                        ⏱ COMING SOON
                                                    </span>
                                                )}
                                            </div>

                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(item.published_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>

                                        <h3 className="text-xs font-bold text-white mb-3 line-clamp-2 leading-relaxed">
                                            {toSentenceCase(item.title)}
                                        </h3>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                                <span>Edit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id, item.title)}
                                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Manual Paste Fallback Drawer Modal */}
            <AnimatePresence>
                {manualPasteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setManualPasteOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0A0F1D] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative z-10 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clipboard className="w-4 h-4 text-cyan-400" />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Manual Smart Paste
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setManualPasteOpen(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                                Paste the AI markdown text below. The parser will automatically extract the Title, Category, YouTube URL and clean Body.
                            </p>

                            <textarea
                                rows={8}
                                placeholder="Paste your markdown transmission here..."
                                value={manualPasteText}
                                onChange={(e) => setManualPasteText(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-cyan-400 text-white text-xs font-mono focus:outline-none"
                                autoFocus
                            />

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setManualPasteOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyParsedText(manualPasteText)}
                                    disabled={!manualPasteText.trim()}
                                    className="px-5 py-2 rounded-xl bg-cyan-400 text-black text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                >
                                    ⚡ Parse & Fill
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileNewsAdmin;
