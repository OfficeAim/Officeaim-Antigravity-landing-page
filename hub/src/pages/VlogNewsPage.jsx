import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, ChevronRight, X, Clock, Newspaper, Youtube, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';
import { vlogs as fallbackVlogs } from './newsData';

const VlogNewsPage = ({ profile }) => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState(null);

    // Fetch published news from Supabase PostgreSQL
    useEffect(() => {
        const fetchPublicNews = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('news')
                    .select('*')
                    .eq('published', true)
                    .order('published_at', { ascending: false });

                if (error) {
                    console.warn('Supabase news query warning, using local seed:', error.message);
                    setNewsItems(fallbackVlogs.map(mapFallbackItem));
                } else if (data && data.length > 0) {
                    setNewsItems(data);
                } else {
                    // Fallback to initial seed if DB table has 0 records yet
                    setNewsItems(fallbackVlogs.map(mapFallbackItem));
                }
            } catch (err) {
                console.error('Failed to fetch public news from Supabase:', err);
                setNewsItems(fallbackVlogs.map(mapFallbackItem));
            } finally {
                setLoading(false);
            }
        };

        fetchPublicNews();

        // Subscribe to real-time additions/modifications on published news
        const channel = supabase
            .channel('public_news_feed')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'news' },
                () => {
                    fetchPublicNews();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Helper to normalize fallback items to news schema
    const mapFallbackItem = (vlog) => ({
        id: vlog.id,
        title: vlog.title,
        description: vlog.description,
        youtube_url: vlog.youtubeId ? `https://www.youtube.com/watch?v=${vlog.youtubeId}` : null,
        category: vlog.category || 'Generative AI',
        published: true,
        published_at: vlog.date || new Date().toISOString(),
        articleContent: vlog.articleContent
    });

    return (
        <>
            <style>{`
                .modal-article-content h2, .modal-article-content h3 {
                    color: #fff;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 800;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    font-style: italic;
                }
                .modal-article-content h2 {
                    font-size: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 0.5rem;
                }
                .modal-article-content h3 {
                    font-size: 1.25rem;
                }
                .modal-article-content p {
                    margin-bottom: 1.25rem;
                    color: #94A3B8;
                    line-height: 1.7;
                    font-size: 0.95rem;
                }
                .modal-article-content strong {
                    color: #fff;
                }
                .modal-article-content a {
                    color: #22D3EE;
                    text-decoration: underline;
                    transition: color 0.2s;
                }
                .modal-article-content a:hover {
                    color: #FF7A18;
                }
            `}</style>

            <div className="w-full min-h-screen py-12 px-6 lg:px-8 bg-[#070A12] text-white overflow-hidden relative font-plus-jakarta">
                {/* Cybernetic Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="max-w-6xl mx-auto relative z-10"
                >
                    {/* Header Section */}
                    <header className="mb-16 text-center md:text-left flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                <img 
                                    src="/hub/logo_officeaim.png" 
                                    alt="AIM Logo" 
                                    className="h-16 w-16 object-contain" 
                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                                <h1 className="text-5xl font-black italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 flex items-center gap-2">
                                    <Newspaper className="w-10 h-10 text-cyan-400" />
                                    AIM NEWS
                                </h1>
                            </div>
                            <h2 className="text-xl font-bold text-cyan-400 mb-1">Artificial Intelligence Management</h2>
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted italic flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                Live Supabase Telemetry Active
                            </p>
                        </div>
                        <div className="glass-card px-6 py-3 border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <p className="text-xs font-bold text-white/70">
                                Transmissions: <span className="text-cyan-300 font-mono">{newsItems.length} Verified</span>
                            </p>
                        </div>
                    </header>

                    {/* News Grid */}
                    {loading ? (
                        <div className="py-24 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4 tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
                            <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse italic text-cyan-400">
                                Synchronizing News Transmissions...
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {newsItems.map((item, idx) => {
                                const ytId = extractYouTubeId(item.youtube_url);
                                const thumbnail = ytId ? getYouTubeThumbnailUrl(item.youtube_url) : null;
                                const displayDate = new Date(item.published_at || item.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                                        className="group relative glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] cursor-pointer flex flex-col justify-between"
                                        onClick={() => setSelectedNews(item)}
                                    >
                                        <div>
                                            {/* Thumbnail / Video Preview */}
                                            <div className="aspect-video w-full bg-[#0a0f1c] relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] to-transparent opacity-80 z-10"></div>
                                                
                                                {thumbnail ? (
                                                    <img 
                                                        src={thumbnail} 
                                                        alt={item.title} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-cyan-950/40 p-4 text-center">
                                                        <Newspaper className="w-12 h-12 text-white/20 mb-2" />
                                                        <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest">OfficeAIM Dispatch</span>
                                                    </div>
                                                )}
                                                
                                                {ytId && (
                                                    <div className="absolute top-3 right-3 z-20 glass-card px-3 py-1 rounded-full border-white/10 flex items-center gap-1.5 bg-black/50 backdrop-blur-md">
                                                        <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                                                        <span className="text-[10px] font-bold tracking-wider">VIDEO</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-3">
                                                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{item.category}</span>
                                                    <span>•</span>
                                                    <span>{displayDate}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-text-muted mb-4 line-clamp-3 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="p-6 pt-0">
                                            <button 
                                                className="w-full py-3 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 group/btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedNews(item);
                                                }}
                                            >
                                                <span>Watch Protocol</span>
                                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Premium News Detail Modal */}
            <AnimatePresence>
                {selectedNews && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                            onClick={() => setSelectedNews(null)}
                        />

                        {/* Modal Window */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className="bg-[#0a0f1c] border border-cyan-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 flex flex-col"
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setSelectedNews(null)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-20 bg-black/40 backdrop-blur-md"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Media content: Adaptive YouTube Player */}
                            {selectedNews.youtube_url && extractYouTubeId(selectedNews.youtube_url) ? (
                                <div className="aspect-video w-full bg-black relative">
                                    <iframe 
                                        src={getYouTubeEmbedUrl(selectedNews.youtube_url, true)}
                                        title={selectedNews.title}
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                        allowFullScreen 
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        className="w-full h-full"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video w-full bg-[#070a12] flex flex-col items-center justify-center text-center p-8 border-b border-white/5 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1c]"></div>
                                    <Clock className="w-16 h-16 text-cyan-400/50 mb-4 animate-pulse relative z-10" />
                                    <h3 className="text-xl font-black italic tracking-wide text-white relative z-10">
                                        OFFICEAIM DISPATCH
                                    </h3>
                                    <p className="text-sm text-text-muted max-w-md mt-2 relative z-10">
                                        Official intelligence transmission recorded directly from the OfficeAIM Autonomous Hub.
                                    </p>
                                </div>
                            )}

                            {/* Text content */}
                            <div className="p-8 md:p-10">
                                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-cyan-400 mb-4">
                                    <span className="bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">{selectedNews.category}</span>
                                    <span>•</span>
                                    <span>{new Date(selectedNews.published_at || selectedNews.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                                </div>

                                <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-white mb-6 leading-tight">
                                    {selectedNews.title}
                                </h1>

                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-6">
                                    {selectedNews.description}
                                </div>

                                {selectedNews.articleContent && (
                                    <div 
                                        className="modal-article-content pt-4 border-t border-white/10"
                                        dangerouslySetInnerHTML={{ __html: selectedNews.articleContent }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VlogNewsPage;
