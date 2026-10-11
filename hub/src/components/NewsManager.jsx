import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Pencil, 
    Trash2, 
    ExternalLink, 
    Play, 
    CheckCircle2, 
    Clock, 
    Search, 
    X, 
    Youtube, 
    Eye, 
    Layers, 
    Sparkles, 
    AlertTriangle,
    Zap,
    Clipboard,
    ChevronDown,
    Check,
    Tag
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
    'Generative AI',
    'Generative Visuals',
    'Autonomous Agents',
    'AI Workflow Strategy',
    'Prompt Architecture',
    'Product Engineering',
    'Security & Trust',
    'Case Studies'
];

/**
 * Robust markdown parser tailored for OfficeAIM AI Agent dispatches
 */
export const parseTransmissionMarkdown = (rawText) => {
    if (!rawText || typeof rawText !== 'string') return null;
    const text = rawText.trim();
    if (!text) return null;

    let title = '';
    let category = '';
    let youtube_url = '';
    let description = '';

    // 1. YouTube Link Extraction
    const ytMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s\)]*)/i);
    if (ytMatch) {
        youtube_url = ytMatch[0];
    }

    // 2. Title Extraction
    const seoTitleMatch = text.match(/SEO\s*title:\s*([^\n\r]+?)(?:\s*Suggested\s*slug:|\s*Meta\s*description:|\n|$)/i);
    const explicitTitleMatch = text.match(/^Title:\s*([^\n\r]+)/im);
    const h1Match = text.match(/^#\s+([^\n\r]+)/m);

    if (seoTitleMatch && seoTitleMatch[1].trim()) {
        title = seoTitleMatch[1].trim();
    } else if (explicitTitleMatch && explicitTitleMatch[1].trim()) {
        title = explicitTitleMatch[1].trim();
    } else if (h1Match && h1Match[1].trim()) {
        title = h1Match[1].trim();
    } else {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
            title = lines[0].replace(/^[#*_\s]+/, '').replace(/[#*_\s]+$/, '');
        }
    }

    // 3. Category Extraction
    const categoryMatch = text.match(/(?:Category|Categor[ií]a):\s*([^\n\r]+)/i);
    if (categoryMatch && categoryMatch[1].trim()) {
        category = categoryMatch[1].trim().replace(/^[*_]+|[*_]+$/g, '');
    } else {
        const lower = text.toLowerCase();
        if (lower.includes('video') || lower.includes('hyperframes') || lower.includes('animat')) {
            category = 'Generative AI';
        } else if (lower.includes('visual') || lower.includes('image') || lower.includes('banana')) {
            category = 'Generative Visuals';
        } else if (lower.includes('agent') || lower.includes('openbot') || lower.includes('autonomous')) {
            category = 'Autonomous Agents';
        } else if (lower.includes('prompt') || lower.includes('meta-prompt')) {
            category = 'Prompt Architecture';
        } else {
            category = 'AI Workflow Strategy';
        }
    }

    // 4. Description / Content: Strip leading metadata lines already extracted into separate fields
    let cleanDescription = text;
    // Strip leading title lines
    cleanDescription = cleanDescription.replace(/^(?:SEO\s*title|Title):\s*[^\n\r]+(?:\r?\n)?/im, '');
    cleanDescription = cleanDescription.replace(/^#\s+[^\n\r]+(?:\r?\n)?/m, '');
    // Strip Category & Date lines
    cleanDescription = cleanDescription.replace(/^(?:Category|Categor[ií]a):\s*[^\n\r]+(?:\r?\n)?/im, '');
    cleanDescription = cleanDescription.replace(/^(?:Date|Fecha):\s*[^\n\r]+(?:\r?\n)?/im, '');
    cleanDescription = cleanDescription.replace(/^(?:Officeaim Newsroom metadata|Metadata):\s*[^\n\r]+(?:\r?\n)?/im, '');
    // Strip placeholder tokens
    cleanDescription = cleanDescription.replace(/\[INSERT_[A-Z0-9_]+_EMBED_HERE\]/gi, '');
    // Strip leading divider rules or extra whitespace
    cleanDescription = cleanDescription.replace(/^[\s\r\n\-\=\_]+/, '').trim();

    description = cleanDescription || text;

    return { title, category, youtube_url, description };
};

export const NewsManager = () => {
    const { news, loading, fetchNews, createNews, updateNews, deleteNews } = useNews();
    
    // Filter and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all | published | draft
    const [filterCategory, setFilterCategory] = useState('all');

    // Dynamic categories tracked locally in-session + extracted from database
    const [customCategories, setCustomCategories] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Manual Paste Fallback Modal (if navigator.clipboard is denied on mobile)
    const [isPasteDrawerOpen, setIsPasteDrawerOpen] = useState(false);
    const [rawPasteText, setRawPasteText] = useState('');

    // Combobox state
    const [categoryQuery, setCategoryQuery] = useState('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const categoryComboboxRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtube_url: '',
        category: 'Generative AI',
        published: true,
        published_at: new Date().toISOString().slice(0, 16)
    });

    // Fetch all items (including drafts) when entering admin
    useEffect(() => {
        fetchNews(true);
    }, [fetchNews]);

    // Close category dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryComboboxRef.current && !categoryComboboxRef.current.contains(e.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Memoized union of default, DB-stored, and session-created categories
    const allCategories = useMemo(() => {
        const fromDb = news.map(n => n.category).filter(Boolean);
        return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromDb, ...customCategories]))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
    }, [news, customCategories]);

    // Filtered categories for combobox searching
    const filteredCategories = useMemo(() => {
        if (!categoryQuery.trim()) return allCategories;
        const q = categoryQuery.toLowerCase().trim();
        return allCategories.filter(c => c.toLowerCase().includes(q));
    }, [allCategories, categoryQuery]);

    // Open Create Modal
    const handleOpenCreate = () => {
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            youtube_url: '',
            category: 'Generative AI',
            published: true,
            published_at: new Date().toISOString().slice(0, 16)
        });
        setCategoryQuery('Generative AI');
        setIsCategoryDropdownOpen(false);
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        const cat = item.category || 'Generative AI';
        setFormData({
            title: item.title || '',
            description: item.description || '',
            youtube_url: item.youtube_url || '',
            category: cat,
            published: Boolean(item.published),
            published_at: item.published_at 
                ? new Date(item.published_at).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)
        });
        setCategoryQuery(cat);
        setIsCategoryDropdownOpen(false);
        setIsModalOpen(true);
    };

    // Apply auto-parsed data to form state
    const applyParsedData = (parsed) => {
        if (!parsed) return;
        const newCat = parsed.category || formData.category;
        
        // Register custom category if it doesn't exist
        if (newCat && !allCategories.includes(newCat)) {
            setCustomCategories(prev => [...prev, newCat]);
        }

        setFormData(prev => ({
            ...prev,
            title: parsed.title || prev.title,
            category: newCat,
            youtube_url: parsed.youtube_url || prev.youtube_url,
            description: parsed.description || prev.description
        }));
        setCategoryQuery(newCat);
    };

    // Smart Paste Trigger (One-Tap Clipboard Access)
    const handleSmartPaste = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    const parsed = parseTransmissionMarkdown(text);
                    if (parsed && (parsed.title || parsed.youtube_url || parsed.description)) {
                        applyParsedData(parsed);
                        toast.success('⚡ Auto-filled Title, Video, Category & Body from clipboard!', {
                            icon: '⚡',
                            style: { background: '#0A0F1D', border: '1px solid #00F0FF', color: '#FFF' }
                        });
                        return;
                    }
                }
            }
            // Fallback if clipboard was empty or blocked
            setIsPasteDrawerOpen(true);
        } catch (err) {
            console.warn('Clipboard read permission denied or unsupported:', err);
            // Seamless mobile fallback
            setIsPasteDrawerOpen(true);
        }
    };

    // Submit handler from raw textarea fallback
    const handleParseManualPaste = () => {
        if (!rawPasteText.trim()) {
            toast.error('Please paste some text first');
            return;
        }
        const parsed = parseTransmissionMarkdown(rawPasteText);
        if (parsed) {
            applyParsedData(parsed);
            setIsPasteDrawerOpen(false);
            setRawPasteText('');
            toast.success('⚡ Successfully auto-parsed transmission fields!');
        } else {
            toast.error('Could not extract fields from text');
        }
    };

    // Select category from combobox
    const handleSelectCategory = (cat) => {
        setFormData(prev => ({ ...prev, category: cat }));
        setCategoryQuery(cat);
        setIsCategoryDropdownOpen(false);
    };

    // Add new custom category from combobox input
    const handleCreateCustomCategory = () => {
        const trimmed = categoryQuery.trim();
        if (!trimmed) return;
        if (!allCategories.includes(trimmed)) {
            setCustomCategories(prev => [...prev, trimmed]);
        }
        setFormData(prev => ({ ...prev, category: trimmed }));
        setIsCategoryDropdownOpen(false);
        toast.success(`Category "${trimmed}" added!`);
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSubmitting(true);
        const finalCategory = formData.category.trim() || 'Generative AI';
        const payload = {
            ...formData,
            category: finalCategory,
            published_at: new Date(formData.published_at).toISOString()
        };

        if (editingItem) {
            await updateNews(editingItem.id, payload);
        } else {
            await createNews(payload);
        }

        setSubmitting(false);
        setIsModalOpen(false);
    };

    // Delete handler
    const handleDelete = async (id) => {
        setSubmitting(true);
        await deleteNews(id);
        setDeleteConfirmId(null);
        setSubmitting(false);
    };

    // Filtered list
    const filteredNews = news.filter((item) => {
        const matchesSearch = 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = 
            filterStatus === 'all' ||
            (filterStatus === 'published' && item.published) ||
            (filterStatus === 'draft' && !item.published);

        const matchesCategory = 
            filterCategory === 'all' || item.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const previewYouTubeId = extractYouTubeId(formData.youtube_url);

    return (
        <div className="w-full space-y-6 sm:space-y-8 font-plus-jakarta">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-slate-950/60 p-5 sm:p-6 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
                        <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-white uppercase flex items-center gap-2">
                            Newsroom Protocol
                        </h2>
                    </div>
                    <p className="text-xs text-text-muted">
                        Publish, edit, and orchestrate live transmissions and YouTube broadcasts with Zero-Build instant sync.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenCreate}
                        className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        New Transmission
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search transmissions by keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full min-h-[48px] bg-[#0a0f1c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full min-h-[48px] bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                        <option value="all">All Statuses (Published & Drafts)</option>
                        <option value="published">Published Only</option>
                        <option value="draft">Drafts Only</option>
                    </select>
                </div>

                <div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full min-h-[48px] bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                        <option value="all">All Categories ({allCategories.length})</option>
                        {allCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* News List */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-xs uppercase tracking-widest text-cyan-400 animate-pulse">Syncing Newsroom Database...</p>
                </div>
            ) : filteredNews.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-white/10 rounded-3xl">
                    <Layers className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white mb-1">No news items found</h3>
                    <p className="text-xs text-text-muted mb-6">Create your first transmission or adjust your filters.</p>
                    <button
                        onClick={handleOpenCreate}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                    >
                        Create Transmission
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filteredNews.map((item) => {
                        const ytId = extractYouTubeId(item.youtube_url);
                        const thumb = ytId ? getYouTubeThumbnailUrl(item.youtube_url) : null;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between bg-[#080d1a]"
                            >
                                <div>
                                    {/* Thumbnail / Header */}
                                    <div className="aspect-video w-full bg-slate-950 relative overflow-hidden">
                                        {thumb ? (
                                            <img
                                                src={thumb}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-cyan-950/40 p-4 text-center">
                                                <Youtube className="w-10 h-10 text-white/20 mb-2" />
                                                <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">No Video Attached</span>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                                                item.published
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            }`}>
                                                {item.published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>

                                        {/* Category Badge */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-300 border border-white/10">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 text-[10px] text-text-muted mb-2 font-mono">
                                            <Clock className="w-3 h-3 text-cyan-400" />
                                            <span>{new Date(item.published_at || item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-text-muted line-clamp-3">
                                            {item.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-4">
                                    <div className="flex items-center gap-2">
                                        {item.youtube_url && (
                                            <a
                                                href={item.youtube_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-400 transition-colors"
                                                title="View YouTube Video"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-white/80 font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/5 hover:border-cyan-500/30"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(item.id)}
                                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-white/80 font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/5 hover:border-rose-500/30"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ======================================================== */}
            {/* UPGRADED CREATE / EDIT MODAL (MOBILE-FIRST & DYNAMIC)    */}
            {/* ======================================================== */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md"
                            onClick={() => !submitting && setIsModalOpen(false)}
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                            className="bg-[#0A0F1D] border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(0,240,255,0.18)] relative z-10 overflow-hidden"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            {/* Sticky Modal Header */}
                            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0F1D]/95 backdrop-blur-md sticky top-0 z-20">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F0FF]"></span>
                                        <h3 className="text-base sm:text-lg font-black italic tracking-wide text-white uppercase">
                                            {editingItem ? 'Edit Transmission' : 'New Transmission'}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-text-muted mt-0.5">
                                        Syncs directly to Supabase with real-time public delivery.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* ONE-TAP SMART PASTE BUTTON */}
                                    <button
                                        type="button"
                                        onClick={handleSmartPaste}
                                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-orange-500/10 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all active:scale-95"
                                        title="Smart Paste Markdown from Clipboard"
                                    >
                                        <Zap className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
                                        <span className="hidden sm:inline">Smart Paste</span>
                                        <span className="sm:hidden">Auto-Fill</span>
                                    </button>

                                    <button
                                        onClick={() => !submitting && setIsModalOpen(false)}
                                        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/50 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Form Body */}
                            <form id="transmissionForm" onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
                                
                                {/* Quick Mobile Auto-Fill Hint */}
                                <div className="bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-400 p-3 rounded-r-xl flex items-center justify-between gap-3 text-[11px] text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                                        <span>Copied agent markdown? Tap <strong>Smart Paste</strong> to fill all fields instantly.</span>
                                    </div>
                                </div>

                                {/* Transmission Title */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2">
                                        Transmission Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Google Nano Banana 2.1 and OpenBot"
                                        className="w-full min-h-[48px] bg-slate-950/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* Dynamic Category & Status Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* DYNAMIC CATEGORY CREATABLE COMBOBOX */}
                                    <div className="relative" ref={categoryComboboxRef}>
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                                                Category *
                                            </span>
                                            <span className="text-[10px] text-cyan-400/70 font-mono">Pick or type new</span>
                                        </label>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={categoryQuery}
                                                onFocus={() => setIsCategoryDropdownOpen(true)}
                                                onChange={(e) => {
                                                    setCategoryQuery(e.target.value);
                                                    setFormData(prev => ({ ...prev, category: e.target.value }));
                                                    setIsCategoryDropdownOpen(true);
                                                }}
                                                placeholder="Select or type new category..."
                                                className="w-full min-h-[48px] bg-slate-950/90 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsCategoryDropdownOpen(prev => !prev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                            >
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Dropdown Options List */}
                                        <AnimatePresence>
                                            {isCategoryDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    className="absolute left-0 right-0 mt-2 bg-[#0B132B] border border-cyan-500/30 rounded-2xl shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-white/5"
                                                >
                                                    {filteredCategories.map((cat) => (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => handleSelectCategory(cat)}
                                                            className={`w-full min-h-[44px] px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                                                                formData.category === cat 
                                                                    ? 'bg-cyan-500/20 text-cyan-300' 
                                                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                        >
                                                            <span>{cat}</span>
                                                            {formData.category === cat && <Check className="w-4 h-4 text-cyan-400" />}
                                                        </button>
                                                    ))}

                                                    {/* Creatable Option if query is not in the list */}
                                                    {categoryQuery.trim() && !allCategories.some(c => c.toLowerCase() === categoryQuery.trim().toLowerCase()) && (
                                                        <button
                                                            type="button"
                                                            onClick={handleCreateCustomCategory}
                                                            className="w-full min-h-[44px] px-4 py-2.5 text-left text-xs font-black text-orange-400 hover:bg-orange-500/10 flex items-center gap-2 transition-colors border-t border-cyan-500/20 bg-black/40"
                                                        >
                                                            <Plus className="w-4 h-4 stroke-[3]" />
                                                            <span>Add <strong>"{categoryQuery.trim()}"</strong> as new category</span>
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Mobile Segmented Status Switcher */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2">
                                            Publication Status
                                        </label>
                                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/90 border border-white/10 rounded-xl min-h-[48px] items-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, published: true }))}
                                                className={`min-h-[40px] rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                    formData.published 
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                                        : 'text-white/40 hover:text-white'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${formData.published ? 'bg-emerald-400' : 'bg-transparent'}`}></span>
                                                Published
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, published: false }))}
                                                className={`min-h-[40px] rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                                    !formData.published 
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                                        : 'text-white/40 hover:text-white'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${!formData.published ? 'bg-amber-400' : 'bg-transparent'}`}></span>
                                                Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube URL with Live Preview */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2 flex items-center justify-between">
                                        <span>YouTube Video URL or ID</span>
                                        {previewYouTubeId && (
                                            <span className="text-[10px] text-cyan-400 font-mono">Video ID: {previewYouTubeId}</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <Youtube className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
                                        <input
                                            type="text"
                                            value={formData.youtube_url}
                                            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                            className="w-full min-h-[48px] bg-slate-950/90 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Video Preview Box */}
                                    {previewYouTubeId && (
                                        <div className="mt-3 rounded-2xl overflow-hidden border border-cyan-500/30 aspect-video bg-black relative shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                                            <iframe
                                                src={getYouTubeEmbedUrl(formData.youtube_url)}
                                                title="Preview"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Description / Markdown Body */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2">
                                        Content & Summary (Full Markdown)
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Full context, takeaways, section outlines, and sources..."
                                        className="w-full bg-slate-950/90 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-colors font-sans leading-relaxed"
                                    />
                                </div>

                                {/* Publication Date */}
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-white/80 mb-2">
                                        Publication Timestamp
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.published_at}
                                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                                        className="w-full min-h-[48px] bg-slate-950/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors"
                                    />
                                </div>
                            </form>

                            {/* Sticky Modal Action Footer (Mobile-First Accessible) */}
                            <div className="p-4 sm:p-5 border-t border-white/10 flex items-center justify-end gap-3 bg-[#0A0F1D]/95 backdrop-blur-md sticky bottom-0 z-20">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="min-h-[48px] px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="transmissionForm"
                                    disabled={submitting}
                                    className="min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(0,240,255,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish Transmission'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* MANUAL SMART-PASTE FALLBACK DRAWER (MOBILE PERMISSION SAFE) */}
            {/* ======================================================== */}
            <AnimatePresence>
                {isPasteDrawerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsPasteDrawerOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0B132B] border border-cyan-500/30 p-5 sm:p-6 rounded-3xl max-w-lg w-full relative z-10 shadow-[0_0_40px_rgba(0,240,255,0.2)] space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clipboard className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-base font-black italic text-white uppercase">
                                        Paste Agent Markdown
                                    </h3>
                                </div>
                                <button onClick={() => setIsPasteDrawerOpen(false)} className="p-1 text-white/50 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-text-muted leading-relaxed">
                                Paste the raw dispatch delivered by the AI agent. The parser will automatically extract the Title, Category, YouTube Link, and Full Body into the form.
                            </p>

                            <textarea
                                rows={6}
                                autoFocus
                                value={rawPasteText}
                                onChange={(e) => setRawPasteText(e.target.value)}
                                placeholder="Paste your markdown dispatch here..."
                                className="w-full bg-slate-950/90 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
                            />

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPasteDrawerOpen(false)}
                                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleParseManualPaste}
                                    className="min-h-[44px] px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                                >
                                    Parse & Populate Form
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ======================================================== */}
            {/* DELETE CONFIRMATION DIALOG                               */}
            {/* ======================================================== */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => !submitting && setDeleteConfirmId(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0d1322] border border-rose-500/30 p-6 rounded-3xl max-w-md w-full relative z-10 text-center shadow-[0_0_40px_rgba(244,63,94,0.2)]"
                        >
                            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Delete Transmission?</h3>
                            <p className="text-xs text-text-muted mb-6">
                                This action is permanent and will delete the record directly from the database.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <button
                                    disabled={submitting}
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="min-h-[44px] px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={submitting}
                                    onClick={() => handleDelete(deleteConfirmId)}
                                    className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                                >
                                    {submitting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewsManager;
