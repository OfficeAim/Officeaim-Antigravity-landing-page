import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Mail, 
    Send, 
    CheckCircle2, 
    AlertTriangle, 
    Sparkles, 
    Users, 
    ClipboardCheck, 
    Clock, 
    RefreshCw, 
    Eye, 
    Code, 
    FileText, 
    Check, 
    ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

const PREBUILT_TEMPLATES = [
    {
        id: 'waitlist-invite',
        name: 'Waitlist invitation',
        badge: 'Onboarding',
        subject: 'Your invitation to the OfficeAIM Campus is ready',
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070A12; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
  <div style="background: linear-gradient(135deg, #1E1B4B 0%, #0B1220 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #38BDF8;">OfficeAIM Campus</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px;">Autonomous AI & Workflow Mastery</p>
  </div>
  <div style="padding: 32px 24px; line-height: 1.6; color: #E2E8F0;">
    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #FFFFFF;">You have been approved for campus access</h2>
    <p style="margin: 0 0 16px; font-size: 15px;">Your application to join the private OfficeAIM Campus has been reviewed and granted access by our founding team.</p>
    <p style="margin: 0 0 24px; font-size: 15px;">Inside, you will find hands-on modules on multi-agent architectures, n8n automations, and production AI prompts.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://officeaim.com/hub/login" style="background: #0284C7; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">Access Your Campus Account</a>
    </div>
    <p style="margin: 24px 0 0; font-size: 12px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
      If you did not request this invite, please disregard this email. Built with care by the OfficeAIM Core Team.
    </p>
  </div>
</div>`
    },
    {
        id: 'weekly-intel',
        name: 'Weekly AI intel',
        badge: 'Weekly digest',
        subject: 'OfficeAIM Intel: Autonomous workflows & prompt architecture',
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070A12; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
  <div style="background: linear-gradient(135deg, #18181B 0%, #09090B 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #F43F5E;">OfficeAIM Weekly Intel</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #A1A1AA; letter-spacing: 1px;">High-signal breakdown of production AI systems</p>
  </div>
  <div style="padding: 32px 24px; line-height: 1.6; color: #E4E4E7;">
    <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #FAFAFA;">What we shipped this week</h2>
    <ul style="margin: 0 0 20px; padding-left: 20px; font-size: 14px; color: #D4D4D8;">
      <li style="margin-bottom: 8px;"><strong>Resend email engine:</strong> Native transactional and newsletter delivery.</li>
      <li style="margin-bottom: 8px;"><strong>Waitlist management:</strong> 1-click candidate reviews and priority WhatsApp channels.</li>
      <li style="margin-bottom: 8px;"><strong>Autonomous agent blueprints:</strong> Updated production workflows in n8n.</li>
    </ul>
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://officeaim.com/hub/dashboard" style="background: #E11D48; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block;">Explore the Hub</a>
    </div>
    <p style="margin: 24px 0 0; font-size: 12px; color: #71717A; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
      You are receiving this as a member of OfficeAIM. Unsubscribe anytime from your profile settings.
    </p>
  </div>
</div>`
    },
    {
        id: 'platform-update',
        name: 'Platform update',
        badge: 'Release notes',
        subject: 'OfficeAIM update: New features and speed improvements',
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070A12; color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
  <div style="padding: 32px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: center;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #10B981;">OfficeAIM Release Notes</h1>
  </div>
  <div style="padding: 24px; line-height: 1.6; color: #E2E8F0; font-size: 14px;">
    <p>A new suite of tools and optimizations has just been deployed to your workspace:</p>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: 700; color: #34D399;">⚡ Zero-latency classroom streaming</p>
      <p style="margin: 0 0 8px; font-weight: 700; color: #34D399;">🔒 Enhanced Supabase session security</p>
      <p style="margin: 0; font-weight: 700; color: #34D399;">📬 Instant email broadcasts via Resend</p>
    </div>
    <p style="margin-top: 24px;">Log in to test out the improvements.</p>
  </div>
</div>`
    }
];

export default function NewsletterManager() {
    const [target, setTarget] = useState('test'); // 'test' | 'waitlist' | 'students'
    const [testEmail, setTestEmail] = useState('delivered@resend.dev');
    const [subject, setSubject] = useState(PREBUILT_TEMPLATES[0].subject);
    const [htmlContent, setHtmlContent] = useState(PREBUILT_TEMPLATES[0].html);
    const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
    const [sending, setSending] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    // Target counts
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [studentsCount, setStudentsCount] = useState(0);
    const [loadingCounts, setLoadingCounts] = useState(true);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                // Fetch waitlist count
                const { count: wCount } = await supabase
                    .from('waitlist_entries')
                    .select('*', { count: 'exact', head: true });
                setWaitlistCount(wCount || 0);

                // Fetch student count
                const { count: sCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });
                setStudentsCount(sCount || 0);
            } catch (err) {
                console.warn('Error loading audience counts:', err);
            } finally {
                setLoadingCounts(false);
            }
        };
        loadCounts();
    }, []);

    const handleApplyTemplate = (tmpl) => {
        setSubject(tmpl.subject);
        setHtmlContent(tmpl.html);
        toast.success(`Template applied: ${tmpl.name}`);
    };

    const handleSend = async () => {
        if (!subject.trim()) {
            toast.error('Please enter a newsletter subject line.');
            return;
        }
        if (!htmlContent.trim()) {
            toast.error('Please provide email content.');
            return;
        }

        setSending(true);
        setLastResult(null);

        try {
            let recipients = [];

            if (target === 'test') {
                if (!testEmail || !testEmail.includes('@')) {
                    toast.error('Please provide a valid test email address.');
                    setSending(false);
                    return;
                }
                recipients = [testEmail.trim()];
            } else if (target === 'waitlist') {
                const { data, error } = await supabase
                    .from('waitlist_entries')
                    .select('email');
                if (error) throw error;
                recipients = (data || []).map(r => r.email).filter(Boolean);
                if (recipients.length === 0) {
                    toast.error('No waitlist recipients found.');
                    setSending(false);
                    return;
                }
            } else if (target === 'students') {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('email');
                if (error) throw error;
                recipients = (data || []).map(r => r.email).filter(Boolean);
                if (recipients.length === 0) {
                    toast.error('No student recipients found.');
                    setSending(false);
                    return;
                }
            }

            // In Resend free tier/unverified domains, batch sends to external domains are restricted to verified accounts.
            // If broadcasting to multiple recipients, we chunk or dispatch via our API endpoint.
            const response = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: recipients.length === 1 ? recipients[0] : recipients,
                    subject,
                    html: htmlContent
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Failed to dispatch email');
            }

            setLastResult({
                timestamp: new Date().toLocaleTimeString(),
                id: result.id || 'N/A',
                count: recipients.length,
                target
            });

            toast.success(`Newsletter dispatched! ID: ${result.id || 'OK'}`);
        } catch (err) {
            console.error('Dispatch error:', err);
            toast.error(err.message || 'Failed to send newsletter');
            setLastResult({
                error: err.message,
                timestamp: new Date().toLocaleTimeString()
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#0B1220] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 italic text-white">
                        <Mail className="h-4 w-4 text-pink-400" /> Resend Newsletter Engine
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5">
                        Broadcast curated updates, course announcements, or invitations directly through Resend.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]"></div>
                        <span>Resend Connected</span>
                    </div>
                    <a 
                        href="https://resend.com/emails" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                        <span>Resend Logs</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                </div>
            </div>

            {/* Main Area: Split 2 columns */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
                {/* Left Form: Target, Templates, Subject & Content */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4 border-r border-white/5" style={{ scrollbarWidth: 'thin' }}>
                    {/* Audience Selection */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-text-muted mb-2 italic">
                            Select Audience
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setTarget('test')}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    target === 'test'
                                        ? 'bg-pink-500/20 border-pink-500/40 text-white shadow-lg'
                                        : 'bg-white/[0.02] border-white/5 text-text-muted hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold">Test Email</span>
                                    <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                                </div>
                                <p className="text-[10px] opacity-70">Single recipient verification</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTarget('waitlist')}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    target === 'waitlist'
                                        ? 'bg-orange-500/20 border-orange-500/40 text-white shadow-lg'
                                        : 'bg-white/[0.02] border-white/5 text-text-muted hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold">Waitlist</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                                        {loadingCounts ? '...' : `${waitlistCount} leads`}
                                    </span>
                                </div>
                                <p className="text-[10px] opacity-70">All verified applicants</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTarget('students')}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    target === 'students'
                                        ? 'bg-cyan-500/20 border-cyan-500/40 text-white shadow-lg'
                                        : 'bg-white/[0.02] border-white/5 text-text-muted hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold">Students</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                                        {loadingCounts ? '...' : `${studentsCount} users`}
                                    </span>
                                </div>
                                <p className="text-[10px] opacity-70">Active campus accounts</p>
                            </button>
                        </div>
                    </div>

                    {/* Single Test Email Input */}
                    {target === 'test' && (
                        <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/20 space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                                Recipient Test Address
                            </label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="name@example.com or delivered@resend.dev"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500/50 font-mono"
                            />
                            <p className="text-[9px] text-text-muted italic">
                                Tip: Use <code className="text-pink-300">delivered@resend.dev</code> to verify delivery status in Resend without spamming personal inboxes.
                            </p>
                        </div>
                    )}

                    {/* Pre-built Templates Quick Pick */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-text-muted mb-2 italic">
                            Quick Templates
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PREBUILT_TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.id}
                                    type="button"
                                    onClick={() => handleApplyTemplate(tmpl)}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-[11px] font-medium text-slate-300 flex items-center gap-1.5 transition-all"
                                >
                                    <FileText className="h-3 w-3 text-pink-400" />
                                    <span>{tmpl.name}</span>
                                    <span className="text-[8px] font-mono uppercase bg-white/10 px-1 py-0.2 rounded text-slate-400">
                                        {tmpl.badge}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject Line */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-text-muted mb-1.5 italic">
                            Email Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter subject line..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500/50 font-semibold"
                        />
                    </div>

                    {/* HTML Content & View Switcher */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-text-muted italic">
                                Email HTML Body
                            </label>
                            <div className="flex items-center bg-black/30 p-0.5 rounded-lg border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('edit')}
                                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        viewMode === 'edit'
                                            ? 'bg-pink-500/20 text-pink-300'
                                            : 'text-text-muted hover:text-white'
                                    }`}
                                >
                                    <Code className="h-3 w-3" /> Source HTML
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('preview')}
                                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        viewMode === 'preview'
                                            ? 'bg-pink-500/20 text-pink-300'
                                            : 'text-text-muted hover:text-white'
                                    }`}
                                >
                                    <Eye className="h-3 w-3" /> Live Preview
                                </button>
                            </div>
                        </div>

                        {viewMode === 'edit' ? (
                            <textarea
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                                rows={10}
                                placeholder="Paste or compose HTML email content here..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-pink-500/50 leading-relaxed resize-y"
                                style={{ scrollbarWidth: 'thin' }}
                            />
                        ) : (
                            <div className="border border-white/10 rounded-xl bg-white p-4 max-h-[260px] overflow-y-auto text-black">
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            </div>
                        )}
                    </div>

                    {/* Send Action */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                        <div className="text-[10px] text-text-muted">
                            Sender: <code className="text-pink-300 font-mono">OfficeAIM &lt;onboarding@resend.dev&gt;</code>
                        </div>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={sending}
                            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
                                sending
                                    ? 'bg-pink-500/50 cursor-not-allowed text-white/70'
                                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-pink-500/20'
                            }`}
                        >
                            {sending ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    <span>Dispatching...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-3.5 w-3.5" />
                                    <span>
                                        {target === 'test' ? 'Send Test Email' : `Broadcast to ${target === 'waitlist' ? `${waitlistCount} Leads` : `${studentsCount} Users`}`}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result alert */}
                    {lastResult && (
                        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                            lastResult.error
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        }`}>
                            <div className="flex items-center gap-2">
                                {lastResult.error ? (
                                    <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                )}
                                <div>
                                    <span className="font-bold">
                                        {lastResult.error ? 'Dispatch error' : `Successfully sent to ${lastResult.count} recipient(s)`}
                                    </span>
                                    {lastResult.id && (
                                        <span className="block text-[10px] font-mono opacity-80">
                                            Resend ID: {lastResult.id}
                                        </span>
                                    )}
                                    {lastResult.error && (
                                        <span className="block text-[10px] opacity-80">{lastResult.error}</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[9px] font-mono opacity-60">{lastResult.timestamp}</span>
                        </div>
                    )}
                </div>

                {/* Right Column: Full Responsive Live Preview Canvas */}
                <div className="w-full lg:w-[420px] p-5 bg-black/20 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted italic flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-pink-400" /> Inbox Mockup
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Client View</span>
                    </div>

                    {/* Email preview container */}
                    <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-y-auto border border-white/10" style={{ scrollbarWidth: 'thin' }}>
                        {/* Chrome bar */}
                        <div className="bg-[#1E293B] px-3 py-2 border-b border-slate-700 text-slate-300 text-[10px] flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="ml-2 font-mono text-slate-400 truncate max-w-[200px]">{subject || 'No subject'}</span>
                            </div>
                            <span className="text-[9px] text-slate-400">now</span>
                        </div>
                        {/* Email HTML rendered */}
                        <div className="p-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

