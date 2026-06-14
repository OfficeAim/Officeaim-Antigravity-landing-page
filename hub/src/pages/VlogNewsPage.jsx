import { motion } from 'framer-motion';
import { Play, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import MainLayout from '../components/MainLayout';

const VlogNewsPage = ({ profile }) => {
    // Placeholder Data
    const vlogs = [
        {
            id: 'meta-prompting',
            title: 'Mastering Meta-Prompting: How AI is Learning to Write Its Own Prompts',
            date: 'June 11, 2026',
            description: 'Meta-prompting shifts focus from content-centric prompts to structural frameworks, allowing AI to write and refine its own prompts [1, 2]. This advanced technique helps scale operations by automating prompt engineering [3, 4].',
            image: '/hub/images/module1_hero.png',
            duration: '5:00'
        },
{
            id: 'v1',
            title: 'OfficeAIM 2.0 Launch & Neural Engine Updates',
            date: 'June 2026',
            description: 'Discover how the new Antigravity integration makes AIM your ultimate AI system pilot.',
            image: '/hub/images/module1_hero.png',
            duration: '8:45'
        },
        {
            id: 'v2',
            title: 'Automating Make.com Workflows with Gema',
            date: 'May 2026',
            description: 'Step-by-step vlog on injecting Gema into your agency operations.',
            image: '/hub/images/module2_hero.png',
            duration: '12:30'
        }
    ];

    return (
        <>
            <div className="w-full min-h-screen py-12 px-6 lg:px-8 bg-[#070A12] text-white overflow-hidden relative">
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
                                <img src="/logo_premium_v2.png" alt="AIM Logo" className="h-16 w-16 object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                                <h1 className="text-5xl font-black italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                    AIM
                                </h1>
                            </div>
                            <h2 className="text-xl font-bold text-cyan-400 mb-1">Artificial Intelligence Management</h2>
                            <p className="text-xs font-black uppercase tracking-widest text-text-muted italic flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                System Pilot Active
                            </p>
                        </div>
                        <div className="glass-card px-6 py-3 border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                            <p className="text-xs font-bold text-white/70">Latest Transmission: <span className="text-white">June 2026</span></p>
                        </div>
                    </header>

                    {/* Vlogs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vlogs.map((vlog, idx) => (
                            <motion.div
                                key={vlog.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                className="group relative glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-video w-full bg-[#0a0f1c] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] to-transparent opacity-80 z-10"></div>
                                    <img src={vlog.image} alt={vlog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    
                                    <div className="absolute top-3 right-3 z-20 glass-card px-3 py-1 rounded-full border-white/10 flex items-center gap-1.5">
                                        <Play className="w-3 h-3 text-cyan-400" />
                                        <span className="text-[10px] font-bold">{vlog.duration}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 relative z-20">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400 mb-3">
                                        <Calendar className="w-3 h-3" />
                                        {vlog.date}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-cyan-400 transition-colors">
                                        {vlog.title}
                                    </h3>
                                    <p className="text-sm text-text-muted mb-6 line-clamp-2">
                                        {vlog.description}
                                    </p>

                                    <button className="w-full py-3 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 group/btn">
                                        Watch Protocol
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Incoming Transmission Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="glass-card rounded-2xl p-8 border border-white/5 flex flex-col items-center justify-center text-center min-h-[300px] border-dashed"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                <TrendingUp className="w-6 h-6 text-text-muted" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-1">Incoming Transmission</h3>
                            <p className="text-xs text-text-muted">Our AI engine is synthesizing the next news vlog. Stay connected.</p>
                        </motion.div>
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="mt-16 w-full max-w-2xl mx-auto">
                        <div className="glass-card p-8 md:p-10 rounded-3xl border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative overflow-hidden">
                            {/* Background glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-cyan-500/10 blur-[50px] -z-10 rounded-full"></div>
                            
                            <div className="text-center relative z-10">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">OfficeAIM Insider</h3>
                                <p className="text-sm text-text-muted mb-6">Join our newsletter to receive the latest updates on Artificial Intelligence, OfficeAIM features, and exclusive strategies directly in your inbox.</p>
                                
                                <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing! You'll receive our latest news soon."); }}>
                                    <input 
                                        type="email" 
                                        placeholder="Your email address..." 
                                        required
                                        className="flex-1 bg-[#0a0f1c] border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                                <p className="text-[10px] text-white/30 mt-4 uppercase tracking-wider">No spam. Only high-value data transmissions.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default VlogNewsPage;
