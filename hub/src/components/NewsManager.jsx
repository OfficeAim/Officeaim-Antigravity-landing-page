import { useState, useEffect } from 'react';
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
    AlertTriangle 
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';

const CATEGORIES = [
    'Generative AI',
    'Generative Visuals',
    'Autonomous Agents',
    'AI Workflow Strategy',
    'Prompt Architecture',
    'Product Engineering',
    'Security & Trust',
    'Case Studies'
];

export const NewsManager = () => {
    const { news, loading, fetchNews, createNews, updateNews, deleteNews } = useNews();
    
    // Local filter and search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all | published | draft
    const [filterCategory, setFilterCategory] = useState('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            youtube_url: item.youtube_url || '',
            category: item.category || 'Generative AI',
            published: Boolean(item.published),
            published_at: item.published_at 
                ? new Date(item.published_at).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16)
        });
        setIsModalOpen(true);
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setSubmitting(true);
        const payload = {
            ...formData,
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
        <div className="w-full space-y-8">
            {/* Top Bar / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-slate-950/60 p-6 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
                        <h2 className="text-2xl font-black italic tracking-wide text-white uppercase flex items-center gap-2">
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
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        New Transmission
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search transmissions by keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
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
                        className="w-full bg-[#0a0f1c] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none transition-colors"
                    >
                        <option value="all">All Categories</option>
                        {CATEGORIES.map((cat) => (
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
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                    >
                        Create Transmission
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-cyan-300 border border-white/10">
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
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-400 transition-colors"
                                                title="View YouTube Video"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-white/80 font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/5 hover:border-cyan-500/30"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmId(item.id)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-white/80 font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/5 hover:border-rose-500/30"
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

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => !submitting && setIsModalOpen(false)}
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#090e1a] border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(34,211,238,0.15)] relative z-10 flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#090e1a]/90 backdrop-blur-md z-20">
                                <div>
                                    <h3 className="text-lg font-black italic tracking-wide text-white uppercase">
                                        {editingItem ? 'Edit Transmission' : 'New Transmission'}
                                    </h3>
                                    <p className="text-xs text-text-muted">
                                        Directly writes to Supabase PostgreSQL with live frontend sync.
                                    </p>
                                </div>
                                <button
                                    onClick={() => !submitting && setIsModalOpen(false)}
                                    className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                                        Transmission Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. OpenAI Dots: Autonomous Background Agents"
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>

                                {/* Category & Status Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                                            Status (Published / Draft)
                                        </label>
                                        <div className="flex items-center gap-4 h-[46px]">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="published_status"
                                                    checked={formData.published === true}
                                                    onChange={() => setFormData({ ...formData, published: true })}
                                                    className="accent-cyan-400"
                                                />
                                                <span className="text-xs font-bold text-emerald-400">Published</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="published_status"
                                                    checked={formData.published === false}
                                                    onChange={() => setFormData({ ...formData, published: false })}
                                                    className="accent-amber-400"
                                                />
                                                <span className="text-xs font-bold text-amber-400">Draft</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube URL with Live Preview */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center justify-between">
                                        <span>YouTube Video URL or ID</span>
                                        {previewYouTubeId && (
                                            <span className="text-[10px] text-cyan-400 font-mono">ID: {previewYouTubeId}</span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <Youtube className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500" />
                                        <input
                                            type="text"
                                            value={formData.youtube_url}
                                            onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
                                        />
                                    </div>

                                    {/* Video Preview Box */}
                                    {previewYouTubeId && (
                                        <div className="mt-3 rounded-2xl overflow-hidden border border-cyan-500/30 aspect-video bg-black relative">
                                            <iframe
                                                src={getYouTubeEmbedUrl(formData.youtube_url)}
                                                title="Preview"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Description / Content */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                                        Description & Summary
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Full context, key takeaways, and breakdown of the transmission..."
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>

                                {/* Publication Date */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                                        Publication Timestamp
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.published_at}
                                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>

                                {/* Modal Actions */}
                                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2"
                                    >
                                        {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Publish Transmission'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
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
                                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={submitting}
                                    onClick={() => handleDelete(deleteConfirmId)}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(244,63,94,0.4)]"
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
