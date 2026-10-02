import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles, Zap, ShieldAlert } from 'lucide-react';

// --- Password Validation (replaces paid HaveIBeenPwned feature) ---
const WEAK_PASSWORDS = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'letmein', 'monkey', 'master', 'iloveyou', 'admin',
    'welcome', 'login', 'pass', 'test', '111111'
];

const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Mínimo 8 caracteres';
    if (WEAK_PASSWORDS.includes(pwd.toLowerCase())) return 'Contraseña demasiado común, elige una más segura';
    if (!/[A-Z]/.test(pwd)) return 'Debe incluir al menos una letra mayúscula';
    if (!/[0-9]/.test(pwd)) return 'Debe incluir al menos un número';
    return null; // válida
};

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

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
            setTapCount(0);
        }
        // Reset counter after 3s of inactivity
        tapTimer.current = setTimeout(() => setTapCount(0), 3000);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setPasswordError('');

        console.log(`Attempting login for: ${email}`); // DEBUG

        try {
            if (isSignUp) {
                // Validate password strength before calling Supabase
                const pwdError = validatePassword(password);
                if (pwdError) {
                    setPasswordError(pwdError);
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName, phone } }
                });
                if (error) throw error;

                // Ping n8n webhook for new user registration
                try {
                    await fetch('http://localhost:5678/webhook-test/supabase-new-user', {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email,
                            firstName: fullName,
                            phone,
                            userAgent: navigator.userAgent,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            referrer: document.referrer || 'direct'
                        })
                    });
                    console.log("Welcome webhook triggered successfully");
                } catch (webhookError) {
                    console.error("Failed to trigger welcome webhook:", webhookError);
                }

                setMessage('Success! Check your email for the confirmation link.');
            } else {
                // SIGN IN
                const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
                if (isLocalhost && (email.trim().toLowerCase() === 'admin' || email.trim().toLowerCase() === 'admin@officeaim.com') && password === 'admin') {
                    console.log("Local Dev Admin Bypass Activated");
                    localStorage.setItem('OFFICEAIM_LOCAL_DEV_AUTH', 'admin');
                    window.location.href = '/hub/dashboard';
                    return;
                }

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
                <div className="text-center mb-6 mt-4">
                    <div className="flex justify-center mb-8">
                        <img
                            src="/hub/images/logo_premium.png"
                            alt="OfficeAim"
                            className="h-16 object-cover object-center w-64 rounded-xl cursor-pointer select-none"
                            onClick={handleLogoTap}
                            draggable={false}
                        />
                    </div>
                    <h1 className="text-2xl lg:text-4xl font-black mb-3 leading-tight italic text-white flex flex-col md:flex-row md:items-center justify-center gap-2">
                        {isSignUp ? <span>Join the</span> : <span>Welcome to</span>}
                        <span className="title-gradient">{isSignUp ? 'Beta Cohort' : 'OfficeAIM.'}</span>
                    </h1>
                    <p className="text-text-muted text-xs font-medium italic">
                        {isSignUp ? 'Secure your spot in the OfficeAIM Beta and lead the AI transformation.' : 'Continue your transformation into an AI-powered professional.'}
                    </p>
                </div>

                <div className="glass-card p-6 lg:p-8 relative overflow-hidden text-white">
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
                                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                                className={`w-full bg-white/5 border rounded-2xl py-4 px-6 text-white focus:outline-none transition-all placeholder:text-white/10 ${passwordError ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-accent-secondary'
                                    }`}
                                placeholder="••••••••"
                            />
                            {passwordError && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-xs text-red-400 font-bold italic mt-1"
                                >
                                    <ShieldAlert className="h-3 w-3 flex-shrink-0" />
                                    {passwordError}
                                </motion.p>
                            )}
                            {isSignUp && !passwordError && password.length > 0 && (
                                <p className="text-[10px] text-text-muted italic mt-1">
                                    ✓ 8+ caracteres · 1 mayúscula · 1 número
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-accent-secondary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'SYNCING...' : (isSignUp ? 'CLAIM MY SEAT' : 'ENTER CAMPUS')}
                            {!loading && <ArrowRight className="h-4 w-4" />}
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

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-text-muted text-xs font-bold mb-3 italic">
                            {isSignUp ? 'Already a founding member?' : 'New to OfficeAIM?'}
                        </p>
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-white hover:text-accent-secondary font-black uppercase tracking-widest text-xs transition-all italic underline underline-offset-4 decoration-accent-secondary/50"
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

                {/* Secret admin link — appears after 5 logo taps */}
                <AnimatePresence>
                    {showAdminLink && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="mt-8 flex justify-center"
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
