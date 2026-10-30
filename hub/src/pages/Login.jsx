import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Zap, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const OFFICIAL_WAITLIST_URL = '/hub/login';

const ROLE_OPTIONS = [
    'Entrepreneur / Independent Builder',
    'Automation Engineer / AI Operator',
    'Student / Learner',
    'Other'
];

const REASON_OPTIONS = [
    'Founding member discount',
    'Discover free AI software & how to use it',
    'Connect with other professionals'
];

const BOTTLENECK_OPTIONS = [
    'Build my no-code website or full-stack app',
    'Automate social media, content & n8n workflows',
    'Create AI agents, prompts & databases',
    'None, just exploring AI'
];

const STACK_OPTIONS = ['ChatGPT', 'Claude', 'n8n', 'Supabase', 'None'];

function getRecommendation(role, bottleneck, stack) {
    const r = (role || '').toLowerCase();
    const b = (bottleneck || '').toLowerCase();
    const s = (stack || '').toLowerCase();

    if (b.includes('website') || r.includes('entrepreneur')) {
        return {
            badge: 'Tailored path · Web architecture',
            message: 'Awesome! While we open the Campus, test our Web Blueprint Studio to design your first full-stack app.',
            primaryLabel: 'Open Web Blueprint Studio →',
            primaryUrl: '/resources/website-creator.html',
            secondaryLabel: 'Explore 26 AI skills →',
            secondaryUrl: '/skills.html'
        };
    }

    if (b.includes('automate') || r.includes('automation') || s === 'n8n') {
        return {
            badge: 'Tailored path · Workflow automation',
            message: 'We recommend exploring the n8n Vault with 98 ready-to-copy automation workflows.',
            primaryLabel: 'Explore the n8n Vault (98 workflows) →',
            primaryUrl: '/resources/workflows.html',
            secondaryLabel: 'Open the Prompt Vault →',
            secondaryUrl: '/learn/prompts.html'
        };
    }

    return {
        badge: 'Tailored path · Prompt engineering & AI skills',
        message: 'Start today with our 26 AI skills and the OfficeAIM Prompt Vault.',
        primaryLabel: 'Open the OfficeAIM Prompt Vault →',
        primaryUrl: '/learn/prompts.html',
        secondaryLabel: 'Explore the 26 AI skills →',
        secondaryUrl: '/skills.html'
    };
}

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showMemberLogin, setShowMemberLogin] = useState(false);

    // Native Waitlist Wizard State
    const [wlStep, setWlStep] = useState(1);
    const [wlSubmitting, setWlSubmitting] = useState(false);
    const [wlSubmitted, setWlSubmitted] = useState(false);
    const [wlError, setWlError] = useState('');
    const [wlForm, setWlForm] = useState({
        full_name: '',
        email: '',
        phone_whatsapp: '',
        user_role: ROLE_OPTIONS[0],
        join_reason: REASON_OPTIONS[0],
        main_bottleneck: BOTTLENECK_OPTIONS[0],
        tech_stack: 'ChatGPT'
    });

    // Secret admin trigger — tap logo 5 times
    const [tapCount, setTapCount] = useState(0);
    const [showAdminLink, setShowAdminLink] = useState(false);
    const tapTimer = useRef(null);

    const handleLogoTap = () => {
        clearTimeout(tapTimer.current);
        const next = tapCount + 1;
        setTapCount(next);
        if (next >= 5) {
            setShowAdminLink(true);
            setShowMemberLogin(true);
            setTapCount(0);
        }
        tapTimer.current = setTimeout(() => setTapCount(0), 3000);
    };

    const handleWaitlistStep1 = () => {
        if (!wlForm.full_name.trim()) {
            setWlError('Please enter your full name to continue.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wlForm.email.trim())) {
            setWlError('Please enter a valid email address.');
            return;
        }
        setWlError('');
        setWlStep(2);
    };

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        setWlSubmitting(true);
        setWlError('');

        const payload = {
            full_name: wlForm.full_name.trim(),
            email: wlForm.email.trim().toLowerCase(),
            phone_whatsapp: wlForm.phone_whatsapp.trim() || null,
            user_role: wlForm.user_role,
            join_reason: wlForm.join_reason,
            main_bottleneck: wlForm.main_bottleneck,
            tech_stack: wlForm.tech_stack,
            preferred_channel: wlForm.phone_whatsapp.trim() ? 'WhatsApp' : 'Email'
        };

        try {
            localStorage.setItem('oa_waitlist_profile', JSON.stringify({ ...payload, saved_at: new Date().toISOString() }));
            const { error } = await supabase.from('waitlist_entries').insert([payload]);
            if (error && error.code !== '23505') {
                console.warn('Waitlist insert warning:', error.message);
            }
        } catch (err) {
            console.warn('Waitlist saved locally:', err);
        } finally {
            setWlSubmitting(false);
            setWlSubmitted(true);
        }
    };

    const recommendation = getRecommendation(wlForm.user_role, wlForm.main_bottleneck, wlForm.tech_stack);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (isLocalhost && (email.trim().toLowerCase() === 'admin' || email.trim().toLowerCase() === 'admin@officeaim.com') && password === 'admin') {
                localStorage.setItem('OFFICEAIM_LOCAL_DEV_AUTH', 'admin');
                window.location.href = '/hub/dashboard';
                return;
            }

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            window.location.href = '/hub/dashboard';
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Public account registration is currently closed. Please join the official waitlist above to receive your invitation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#05070A] relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-orange-500/15 blur-[130px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-cyan-500/10 blur-[130px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="glass-card p-8 lg:p-12 relative overflow-hidden text-white text-center border border-white/10 rounded-3xl shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <img
                            src="/hub/images/logo_premium.png"
                            alt="OfficeAIM"
                            className="h-16 object-cover object-center w-60 rounded-xl cursor-pointer select-none"
                            onClick={handleLogoTap}
                            draggable={false}
                        />
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-extrabold uppercase tracking-widest mb-5">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Campus in construction · Waitlist open</span>
                    </div>

                    <h1 className="text-2xl lg:text-4xl font-black mb-4 leading-tight text-white">
                        We are building the <span className="title-gradient">OfficeAIM Campus</span>
                    </h1>

                    <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-md mx-auto">
                        The interactive OfficeAIM Campus and its 19 specialized AI agents are in their final stabilization phase. Public account creation is currently closed while we prepare the next cohort. Join the official waitlist to be the first to enter!
                    </p>

                    <div className="space-y-4 text-left">
                        {!wlSubmitted ? (
                            <form onSubmit={handleWaitlistSubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 flex-1 rounded-full transition-all ${wlStep >= s ? (s === 3 ? 'bg-cyan-400' : 'bg-orange-500') : 'bg-white/10'}`}
                                        />
                                    ))}
                                </div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 text-center">
                                    {wlStep === 1 && 'Step 1 of 3 · Contact & VIP access'}
                                    {wlStep === 2 && 'Step 2 of 3 · Your role & goal'}
                                    {wlStep === 3 && 'Step 3 of 3 · Current bottleneck & stack'}
                                </div>

                                {wlStep === 1 && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">1. Full name *</label>
                                            <input
                                                type="text"
                                                value={wlForm.full_name}
                                                onChange={(e) => setWlForm({ ...wlForm, full_name: e.target.value })}
                                                placeholder="Alex Rivera"
                                                className="w-full bg-slate-900/80 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-cyan-400 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">2. Email address *</label>
                                            <input
                                                type="email"
                                                value={wlForm.email}
                                                onChange={(e) => setWlForm({ ...wlForm, email: e.target.value })}
                                                placeholder="alex@company.com"
                                                className="w-full bg-slate-900/80 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-cyan-400 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                3. WhatsApp / phone <span className="text-slate-500 font-normal normal-case">(Optional — VIP priority alerts)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={wlForm.phone_whatsapp}
                                                onChange={(e) => setWlForm({ ...wlForm, phone_whatsapp: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full bg-slate-900/80 border border-white/15 rounded-xl py-2.5 px-3.5 text-sm text-white focus:border-cyan-400 outline-none"
                                            />
                                        </div>
                                        {wlError && <p className="text-xs text-red-400 font-semibold text-center">{wlError}</p>}
                                        <button
                                            type="button"
                                            onClick={handleWaitlistStep1}
                                            className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                                        >
                                            <span>Next: Your profile &amp; goal</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {wlStep === 2 && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">4. Your primary role or profile *</label>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {ROLE_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setWlForm({ ...wlForm, user_role: opt })}
                                                        className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${wlForm.user_role === opt ? 'border-orange-500 bg-orange-500/15 text-white' : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-cyan-400/40'}`}
                                                    >
                                                        <span>{opt}</span>
                                                        {wlForm.user_role === opt && <span className="text-orange-400">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">5. Main reason for joining *</label>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {REASON_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setWlForm({ ...wlForm, join_reason: opt })}
                                                        className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${wlForm.join_reason === opt ? 'border-orange-500 bg-orange-500/15 text-white' : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-cyan-400/40'}`}
                                                    >
                                                        <span>{opt}</span>
                                                        {wlForm.join_reason === opt && <span className="text-orange-400">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setWlStep(1)}
                                                className="px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-slate-300 text-xs font-bold"
                                            >
                                                ← Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWlStep(3)}
                                                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl"
                                            >
                                                Final step: Current focus →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {wlStep === 3 && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">6. What is your biggest current bottleneck? *</label>
                                            <div className="grid grid-cols-1 gap-1.5">
                                                {BOTTLENECK_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setWlForm({ ...wlForm, main_bottleneck: opt })}
                                                        className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${wlForm.main_bottleneck === opt ? 'border-orange-500 bg-orange-500/15 text-white' : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-cyan-400/40'}`}
                                                    >
                                                        <span>{opt}</span>
                                                        {wlForm.main_bottleneck === opt && <span className="text-orange-400">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Primary tool or stack you use most</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {STACK_OPTIONS.map((st) => (
                                                    <button
                                                        key={st}
                                                        type="button"
                                                        onClick={() => setWlForm({ ...wlForm, tech_stack: st })}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${wlForm.tech_stack === st ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-300'}`}
                                                    >
                                                        {st === 'None' ? 'None yet' : st}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setWlStep(2)}
                                                className="px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-slate-300 text-xs font-bold"
                                            >
                                                ← Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={wlSubmitting}
                                                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg"
                                            >
                                                {wlSubmitting ? 'Saving profile...' : 'Lock in my priority spot →'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="bg-emerald-500/5 border border-cyan-400/30 rounded-2xl p-6 text-center space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div className="inline-block px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-extrabold uppercase tracking-widest">
                                    {recommendation.badge}
                                </div>
                                <h3 className="text-xl font-black text-white">
                                    Welcome aboard, {wlForm.full_name.split(' ')[0] || 'Builder'}!
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                                    {recommendation.message}
                                </p>
                                <div className="pt-2 space-y-2">
                                    <a
                                        href={recommendation.primaryUrl}
                                        className="w-full py-3.5 px-5 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <span>{recommendation.primaryLabel}</span>
                                    </a>
                                    <a
                                        href={recommendation.secondaryUrl}
                                        className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center"
                                    >
                                        <span>{recommendation.secondaryLabel}</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <a
                                href="/index.html"
                                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors pt-2"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                <span>Back to OfficeAIM home</span>
                            </a>
                        </div>
                    </div>

                    {/* Optional Authorized Admin / Founding Tester Sign-In (Registration Disabled) */}
                    <AnimatePresence>
                        {showMemberLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-8 pt-8 border-t border-white/10 text-left overflow-hidden"
                            >
                                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 flex items-center justify-between">
                                    <span>Authorized tester sign-in</span>
                                    <span className="text-[10px] text-text-muted font-normal">Sign-ups disabled</span>
                                </div>
                                <form onSubmit={handleAuth} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-1.5">
                                            <Mail className="h-3 w-3" /> Email address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/20"
                                            placeholder="authorized@officeaim.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2 mb-1.5">
                                            <Lock className="h-3 w-3" /> Password
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/20"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Verifying...' : 'Sign in (Authorized only)'}
                                        {!loading && <ArrowRight className="h-3.5 w-3.5" />}
                                    </button>
                                    {message && (
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
                                            {message}
                                        </div>
                                    )}
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-50">
                    <div className="text-[10px] font-bold tracking-widest uppercase text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> 100% Free Open Tools
                    </div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-white flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div> Priority Cohort Queue
                    </div>
                </div>

                {/* Secret admin link — appears after 5 logo taps */}
                <AnimatePresence>
                    {showAdminLink && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="mt-6 flex justify-center"
                        >
                            <button
                                onClick={() => navigate('/hub/admin')}
                                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 hover:border-accent-secondary/60 hover:bg-accent-secondary/10 transition-all duration-300"
                            >
                                <Zap className="h-4 w-4 text-accent-secondary" />
                                <span className="text-[10px] font-black tracking-widest uppercase italic text-accent-secondary group-hover:text-white transition-colors">Command Center</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Login;
