import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        console.log(`Attempting login for: ${email}`); // DEBUG

        try {
            if (isSignUp) {
                // ... (Sign Up Logic) ...
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName, phone } }
                });
                if (error) throw error;
                setMessage('Success! Check your email for the confirmation link.');
            } else {
                // SIGN IN
                console.log("Calling supabase.auth.signInWithPassword..."); // DEBUG
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    console.error("Login Error:", error); // DEBUG
                    throw error;
                }

                console.log("Login Success! User:", data.user); // DEBUG
                // Immediate Redirect
                window.location.href = '/hub/dashboard'; // Force hard reload redirect
            }
        } catch (error) {
            console.error("Catch Block Error:", error); // DEBUG
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#05070A]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl"
            >
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-8">
                        <img src="/images/logo_premium.png" alt="OfficeAim" className="h-10" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 mb-8">
                        <Sparkles className="h-4 w-4 text-accent-secondary" />
                        <span className="text-[10px] font-black tracking-widest text-accent-secondary uppercase italic">The OfficeAIM Campus</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight italic text-white">
                        {isSignUp ? 'Join the' : 'Welcome'}<br />
                        <span className="title-gradient">{isSignUp ? 'Beta Cohort' : 'Back, Student.'}</span>
                    </h1>
                    <p className="text-text-muted text-lg font-medium italic">
                        {isSignUp ? 'Secure your spot in the OfficeAIM Beta and lead the AI transformation.' : 'Continue your transformation into an AI-powered professional.'}
                    </p>
                </div>

                <div className="glass-card p-12 relative overflow-hidden text-white">
                    <form onSubmit={handleAuth} className="space-y-8">
                        {/* Full Name (Sign Up only) */}
                        {isSignUp && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    required={isSignUp}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/10"
                                    placeholder="Your full name"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/10"
                                placeholder="you@office.com"
                            />
                        </div>

                        {/* Phone Input (Only for Sign Up) */}
                        {isSignUp && (
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
                                    <span className="h-3 w-3 flex items-center justify-center">📱</span> Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    required={isSignUp}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/10"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted italic flex items-center gap-2">
                                    <Lock className="h-3 w-3" /> Secure Password
                                </label>
                                {!isSignUp && <button type="button" className="text-[10px] font-black uppercase tracking-widest text-accent-secondary italic hover:underline">Forgot?</button>}
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-accent-secondary outline-none transition-all placeholder:text-white/10"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-accent-secondary hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'SYNCING...' : (isSignUp ? 'CLAIM MY SEAT' : 'ENTER CAMPUS')}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </button>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-6 rounded-2xl text-center text-sm font-bold italic border ${message.includes('Success') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                            >
                                {message}
                            </motion.div>
                        )}
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/5 text-center">
                        <p className="text-text-muted text-xs font-bold mb-4 italic">
                            {isSignUp ? 'Already a founding member?' : 'New to OfficeAIM?'}
                        </p>
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-white hover:text-accent-secondary font-black uppercase tracking-widest text-sm transition-all italic underline underline-offset-8 decoration-accent-secondary/50"
                        >
                            {isSignUp ? 'BACK TO LOGIN' : 'CREATE FREE ACCOUNT'}
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale">
                    <div className="text-[10px] font-black tracking-widest uppercase italic text-white flex items-center gap-2">
                        <div className="h-1 w-1 bg-white rounded-full"></div> Fully Encrypted
                    </div>
                    <div className="text-[10px] font-black tracking-widest uppercase italic text-white flex items-center gap-2">
                        <div className="h-1 w-1 bg-white rounded-full"></div> GDPR Compliant
                    </div>
                    <div className="text-[10px] font-black tracking-widest uppercase italic text-white flex items-center gap-2">
                        <div className="h-1 w-1 bg-white rounded-full"></div> Immediate Access
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
