import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const KNOWN_ADMIN_EMAILS = [
    'officeaim.hq@gmail.com',
    'rody@officeaim.com',
    'rodyf81@yahoo.es',
    'rodyf81@gmail.com'
];

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAdminSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (authError) throw authError;

            const user = authData?.user;
            if (!user) throw new Error('Authentication failed. No user returned.');

            // 2. Query real role from public.profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, role, full_name')
                .eq('id', user.id)
                .maybeSingle();

            const isRoleAdmin = profileData && (profileData.role === 'superadmin' || profileData.role === 'admin');
            const isWhitelisted = KNOWN_ADMIN_EMAILS.includes(user.email?.toLowerCase());

            if (!isRoleAdmin && !isWhitelisted) {
                // Zero-Trust policy: instantly evict unauthorized session
                await supabase.auth.signOut();
                throw new Error('ACCESS DENIED: Account lacks superadmin privileges.');
            }

            toast.success(`Welcome back, ${profileData?.full_name || 'Super Admin'}!`);
            navigate('/hub/admin');
        } catch (err) {
            console.error('Super Admin Auth Failed:', err);
            setErrorMsg(err.message || 'Invalid credentials or unauthorized role.');
            toast.error(err.message || 'Authentication rejected');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#04060c] relative overflow-hidden font-plus-jakarta">
            {/* Background Cybernetic Glow */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Security Shield Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                        <Terminal className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black italic tracking-wide text-white uppercase flex items-center justify-center gap-2">
                        Super Admin Portal
                    </h1>
                    <p className="text-xs font-mono uppercase tracking-widest text-cyan-400/80 mt-1">
                        Row-Level Security · Enforced Access
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#080d1a]/90 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    {errorMsg && (
                        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
                            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                            <div>
                                <p className="font-bold uppercase tracking-wider text-[10px]">Authorization Failure</p>
                                <p className="mt-0.5 opacity-90">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleAdminSignIn} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">
                                Administrator Email
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@officeaim.com"
                                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2">
                                Master Password
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                                    <span>Verifying Credentials...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Verify Super Admin Access</span>
                                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <Link to="/hub/login" className="text-xs text-text-muted hover:text-white transition-colors">
                            ← Return to Student Portal
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
