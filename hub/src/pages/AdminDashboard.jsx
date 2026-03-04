import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Power, Search, Sparkles, RefreshCcw, BookOpen, Clock, MessageSquare, Send, ChevronRight, X, Activity, Award, HeadphonesIcon, DollarSign, Cpu, BarChart3, Wallet, Pencil, Check, ChevronDown, ChevronUp, Globe, Server, Zap, Mail, ExternalLink, Copy, CheckCircle, Inbox, Bug, ClipboardCheck, LayoutDashboard, LifeBuoy, ArrowRight } from 'lucide-react';

const AdminDashboard = ({ profile }) => {
    // ---- STATE ----
    const [activeTab, setActiveTab] = useState('revenue');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0, active: 0, canceled: 0, completionRate: '0%', revenue: '$0',
        totalLessonsCompleted: 0, apiCosts: '$12.50', netMargin: '$0',
        tierBreakdown: { free: 0, pro: 0, plus: 0 }
    });

    // Selection state for Right Panel
    const [selectedUser, setSelectedUser] = useState(null);
    const [userVault, setUserVault] = useState([]);
    const [loadingVault, setLoadingVault] = useState(false);

    // Support Tickets state
    const [supportTickets, setSupportTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [ticketFilter, setTicketFilter] = useState('open');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Cost Analysis state
    const [editingCost, setEditingCost] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [costs, setCosts] = useState({
        fixed: [
            { id: 'supabase', name: 'Supabase', plan: 'Pro', cost: 25, icon: 'server', color: 'green' },
            { id: 'vercel', name: 'Vercel', plan: 'Pro', cost: 20, icon: 'globe', color: 'blue' },
            { id: 'google_ai', name: 'Google AI', plan: 'Pro', cost: 20, icon: 'sparkles', color: 'purple' },
            { id: 'domain', name: 'Domain', plan: 'Annual', cost: 1, icon: 'globe', color: 'cyan' },
        ],
        variable: [
            { id: 'gemini_api', name: 'Gemini API', plan: 'Usage', cost: 5, icon: 'cpu', color: 'orange' },
            { id: 'n8n', name: 'n8n', plan: 'Cloud', cost: 0, icon: 'zap', color: 'yellow' },
        ]
    });

    // Calculations
    const totalCosts = [...costs.fixed, ...costs.variable].reduce((sum, c) => sum + c.cost, 0);
    const mrrValue = parseFloat(stats.revenue.replace('$', '')) || 0;
    const netMarginValue = mrrValue - totalCosts;
    const breakeven = totalCosts > 0 ? Math.ceil(totalCosts / 49) : 0;

    // ---- EFFECTS ----
    useEffect(() => {
        fetchUsers();
        fetchTickets();
        fetchAlerts();

        // Real-time listener for whistleblower (Rule 9)
        const channel = supabase
            .channel('admin_alerts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_inbox' }, (payload) => {
                setAlerts(prev => [payload.new, ...prev]);
                setUnreadCount(c => c + 1);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    useEffect(() => {
        if (selectedUser) fetchUserVault(selectedUser.id);
    }, [selectedUser]);

    // ---- HANDLERS ----
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            const userList = profiles || [];
            console.log('Students:', userList.length);
            setUsers(userList);

            const proUsers = userList.filter(u => u.subscription_tier === 'pro').length;
            const plusUsers = userList.filter(u => u.subscription_tier === 'plus').length;
            const mrr = (proUsers * 49) + (plusUsers * 99);

            setStats({
                total: userList.length,
                active: userList.filter(u => u.membership_status === 'active').length,
                canceled: userList.filter(u => u.membership_status === 'canceled').length,
                revenue: `$${mrr}`,
                tierBreakdown: { free: userList.filter(u => u.subscription_tier === 'free' || !u.subscription_tier).length, pro: proUsers, plus: plusUsers }
            });
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchAlerts = async () => {
        const { data } = await supabase.from('admin_inbox').select('*').order('created_at', { ascending: false }).limit(20);
        setAlerts(data || []);
        setUnreadCount(data?.filter(a => !a.is_read).length || 0);
    };

    const markAlertRead = async (id) => {
        await supabase.from('admin_inbox').update({ is_read: true }).eq('id', id);
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
        setUnreadCount(c => Math.max(0, c - 1));
    };

    const fetchTickets = async () => {
        setTicketsLoading(true);
        try {
            const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
            setSupportTickets(data || []);
        } catch (err) { console.error(err); } finally { setTicketsLoading(false); }
    };

    const fetchUserVault = async (userId) => {
        setLoadingVault(true);
        try {
            const { data } = await supabase.from('saved_chats').select('*').eq('user_id', userId).order('created_at', { ascending: false });
            setUserVault(data || []);
        } catch (err) { console.error(err); } finally { setLoadingVault(false); }
    };

    const handleCostEdit = (id, val) => {
        setEditingCost(id);
        setEditValue(val.toString());
    };

    const handleCostSave = (type, id) => {
        const val = parseFloat(editValue) || 0;
        setCosts(prev => ({ ...prev, [type]: prev[type].map(c => c.id === id ? { ...c, cost: val } : c) }));
        setEditingCost(null);
    };

    const handleResolveTicket = async (id) => {
        await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', id);
        fetchTickets();
        if (selectedTicket?.id === id) setSelectedTicket(prev => ({ ...prev, status: 'resolved' }));
    };

    // Filters
    const filteredUsers = users.filter(u => (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTickets = supportTickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter);

    // Helpers
    const getCostIcon = (icon) => {
        const map = { server: <Server className="h-4 w-4" />, globe: <Globe className="h-4 w-4" />, sparkles: <Sparkles className="h-4 w-4" />, cpu: <Cpu className="h-4 w-4" />, zap: <Zap className="h-4 w-4" />, mail: <Mail className="h-4 w-4" /> };
        return map[icon] || <DollarSign className="h-4 w-4" />;
    };

    const getColorClasses = (color) => {
        const map = { green: 'text-green-400 bg-green-500/10', blue: 'text-blue-400 bg-blue-500/10', purple: 'text-purple-400 bg-purple-500/10', cyan: 'text-cyan-400 bg-cyan-500/10', orange: 'text-orange-400 bg-orange-500/10', yellow: 'text-yellow-400 bg-yellow-500/10' };
        return map[color] || 'text-white bg-white/10';
    };

    // ---- RENDER PANELS ----

    const NavPanel = () => (
        <div className="w-[15%] h-full border-r border-white/10 bg-[#0B1220] flex flex-col shrink-0">
            <div className="p-6 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3 mb-1">
                    <Shield className="h-6 w-6 text-accent-secondary" />
                    <h1 className="text-lg font-black tracking-tight text-white uppercase italic">InmoCMS</h1>
                </div>
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Admin Authority</p>
            </div>
            <div className="flex-1 px-4 space-y-1.5">
                {[
                    { id: 'revenue', icon: <BarChart3 className="h-4 w-4" />, label: 'Revenue' },
                    { id: 'users', icon: <Users className="h-4 w-4" />, label: 'Users' },
                    { id: 'support', icon: <Inbox className="h-4 w-4" />, label: 'Support', count: unreadCount },
                    { id: 'infra', icon: <Server className="h-4 w-4" />, label: 'Infrastructure' }
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}>
                        <div className="flex items-center gap-3">
                            {item.icon} {item.label}
                        </div>
                        {item.count > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center bg-orange-500 rounded-full text-[10px] font-black animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            <div className="p-6 border-t border-white/5">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="inline-block h-2 w-2 bg-emerald-400 rounded-full animate-pulse mr-2" />
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">System stabilized</span>
                </div>
            </div>
        </div>
    );

    const CenterPanel = () => (
        <div className="w-[55%] h-full bg-[#070A12] flex flex-col overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-secondary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="p-8 border-b border-white/5 bg-white/[0.01] backdrop-blur-sm z-10 shrink-0">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-1">{activeTab} Command</h2>
                <p className="text-xs text-text-muted">Real-time oversight and data control.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-8 z-10 scrollbar-hide">
                {activeTab === 'revenue' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Monthly MRR', value: stats.revenue, color: 'text-green-400' },
                                { label: 'Total Costs', value: `$${totalCosts}`, color: 'text-red-400' },
                                { label: 'Net Margin', value: `$${netMarginValue.toFixed(2)}`, color: 'text-purple-400' },
                                { label: 'Breakeven', value: `${breakeven} users`, color: 'text-amber-400' }
                            ].map(kpi => (
                                <div key={kpi.label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-2">{kpi.label}</div>
                                    <div className={`text-3xl font-black italic ${kpi.color}`}>{kpi.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Cost List */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] uppercase font-black text-text-muted tracking-widest">Expenditure Entries</h3>
                            {[...costs.fixed, ...costs.variable].map(item => (
                                <div key={item.id} className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${getColorClasses(item.color)}`}>{getCostIcon(item.icon)}</div>
                                        <div>
                                            <div className="text-sm font-black text-white italic">{item.name}</div>
                                            <div className="text-[10px] text-text-muted uppercase font-bold">{item.plan}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {editingCost === item.id ? (
                                            <div className="flex items-center gap-2">
                                                <input autoFocus type="number" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCostSave(costs.fixed.find(c => c.id === item.id) ? 'fixed' : 'variable', item.id)} className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white text-right outline-none" />
                                                <button onClick={() => handleCostSave(costs.fixed.find(c => c.id === item.id) ? 'fixed' : 'variable', item.id)} className="p-1.5 bg-green-500/20 rounded-lg text-green-400"><Check className="h-4 w-4" /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-lg font-black text-white italic">${item.cost}</span>
                                                <button onClick={() => handleCostEdit(item.id, item.cost)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all"><Pencil className="h-3.5 w-3.5 text-text-muted hover:text-white" /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                            <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-accent-secondary/50 transition-all font-medium" />
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] border-b border-white/5">
                                    <tr className="text-[10px] uppercase font-black tracking-widest text-text-muted">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Tier</th>
                                        <th className="px-6 py-4">State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-xs text-text-muted italic">No students found in production</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(user => (
                                            <tr key={user.id} onClick={() => setSelectedUser(user)} className={`cursor-pointer transition-all ${selectedUser?.id === user.id ? 'bg-accent-secondary/10' : 'hover:bg-white/5'}`}>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-white italic">{user.full_name || 'Anonymous'}</div>
                                                    <div className="text-[10px] text-text-muted font-medium truncate max-w-[180px]">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white">{user.subscription_tier || 'free'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${user.membership_status === 'active' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.membership_status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{user.membership_status}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'support' && (
                    <div className="space-y-4 animate-in fade-in">
                        {/* Alerts Section (Whistleblower Rule 9) */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] uppercase font-black text-orange-500 tracking-widest flex items-center gap-2">
                                <Sparkles className="h-3 w-3 animate-pulse" /> Whistleblower Alerts
                            </h3>
                            {alerts.length === 0 ? (
                                <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-text-muted italic text-xs">No project completions yet.</div>
                            ) : (
                                alerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        onClick={() => markAlertRead(alert.id)}
                                        className={`bg-white/[0.02] border transition-all rounded-2xl p-5 cursor-pointer flex items-center justify-between ${!alert.is_read ? 'border-orange-500/40 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${!alert.is_read ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-text-muted'}`}>
                                                <ClipboardCheck className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white italic">{alert.title}</div>
                                                <div className="text-xs text-text-muted font-medium">{alert.message}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-text-muted">{new Date(alert.created_at).toLocaleTimeString()}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <hr className="border-white/5 my-8" />

                        <div className="space-y-3">
                            <h3 className="text-[10px] uppercase font-black text-text-muted tracking-widest">Support Tickets</h3>
                            <div className="grid gap-3">
                                {filteredTickets.map(t => (
                                    <div key={t.id} onClick={() => setSelectedTicket(t)} className={`bg-white/[0.02] border transition-all rounded-2xl p-5 cursor-pointer flex items-center justify-between ${selectedTicket?.id === t.id ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.status === 'open' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{t.status === 'open' ? <Bug className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}</div>
                                            <div>
                                                <div className="text-sm font-black text-white italic">{t.student_name}</div>
                                                <div className="text-xs text-text-muted font-medium truncate max-w-[300px]">{t.issue}</div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-text-muted">{new Date(t.created_at).toLocaleDateString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'infra' && (
                    <div className="grid gap-6 animate-in fade-in">
                        {[
                            { name: 'PostgreSQL Backend', status: 'Online', icon: <Server />, url: 'https://supabase.com/dashboard/project/guemwhrdqmbneoccucht', color: 'green' },
                            { name: 'Automation Workflows', status: 'Online', icon: <Zap />, url: 'http://localhost:5678', color: 'blue' },
                            { name: 'SMTP Mock Server', status: 'Ready', icon: <Mail />, url: 'https://supabase.com/dashboard/project/guemwhrdqmbneoccucht/auth/users', color: 'purple' }
                        ].map(sys => (
                            <div key={sys.name} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${getColorClasses(sys.color)} group-hover:scale-110 transition-transform`}>{sys.icon}</div>
                                    <div>
                                        <div className="text-lg font-black text-white italic">{sys.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                                            <span className="text-[10px] font-black uppercase text-green-400 tracking-widest">{sys.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => window.open(sys.url, '_blank')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2">Monitor <ExternalLink className="h-3 w-3" /></button>
                            </div>
                        ))}
                    </div>
                )
                }
            </div >
        </div >
    );

    const RightPanel = () => (
        <div className="w-[30%] h-full border-l border-white/10 bg-[#0B1220] flex flex-col shrink-0 overflow-hidden relative">
            <div className="p-6 border-b border-white/5 shrink-0">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted italic">Contextual Work Panel</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {activeTab === 'users' && selectedUser ? (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-8">
                        {/* Profile Header */}
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-3xl font-black text-white italic">{selectedUser.full_name?.charAt(0) || 'U'}</div>
                            <div>
                                <h4 className="text-xl font-black text-white italic">{selectedUser.full_name || 'Anonymous'}</h4>
                                <p className="text-xs text-text-muted font-medium mb-3">{selectedUser.email}</p>
                                <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">Suspend Account</button>
                            </div>
                        </div>

                        {/* Project Memory (Vault) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-black uppercase text-accent-secondary tracking-widest">Project Memory (Vault)</h5>
                                <span className="text-[10px] font-bold text-text-muted">{userVault.length} entries</span>
                            </div>
                            <div className="space-y-3">
                                {loadingVault ? (
                                    <div className="py-8 text-center text-text-muted italic text-xs animate-pulse">Accessing Vault...</div>
                                ) : userVault.length === 0 ? (
                                    <div className="py-12 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-center">
                                        <Activity className="h-8 w-8 text-white/5 mx-auto mb-3" />
                                        <p className="text-xs text-text-muted italic">Memory is empty.</p>
                                    </div>
                                ) : userVault.map(vault => (
                                    <div key={vault.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase text-white tracking-widest">{vault.agent_id || 'GENERAL'}</span>
                                            <span className="text-[9px] text-text-muted">{new Date(vault.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-[11px] text-text-muted line-clamp-3 leading-relaxed">"{vault.chat_history?.[0]?.content}"</p>
                                        <button className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-accent-secondary opacity-0 group-hover:opacity-100 transition-all">Expedite review <ArrowRight className="h-3 w-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'users' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                        <Users className="h-12 w-12 mb-4" />
                        <p className="text-xs italic font-bold text-white uppercase tracking-widest leading-relaxed">Select a student profile to decrypt the session history.</p>
                    </div>
                )}

                {activeTab === 'support' && selectedTicket ? (
                    <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedTicket.status === 'open' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{selectedTicket.status}</span>
                            <span className="text-[10px] font-bold text-text-muted">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                        </div>
                        <h4 className="text-lg font-black text-white italic">Submission from {selectedTicket.student_name}</h4>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/80 leading-relaxed italic border-l-4 border-l-red-400">"{selectedTicket.issue}"</div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Triage AI Payload</span>
                            </div>
                            <pre className="bg-black/40 border border-emerald-500/20 rounded-2xl p-5 font-mono text-[10px] text-emerald-300 whitespace-pre-wrap leading-relaxed">
                                {selectedTicket.generated_prompt || `# RECOVERY ATTEMPT\n# UID: ${selectedTicket.user_id}\n# ISSUE: ${selectedTicket.issue}`}
                            </pre>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button onClick={() => { navigator.clipboard.writeText(selectedTicket.generated_prompt); setCopiedId(selectedTicket.id); setTimeout(() => setCopiedId(null), 2000) }} className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                {copiedId === selectedTicket.id ? <><CheckCircle className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy Payload</>}
                            </button>
                            {selectedTicket.status === 'open' ? (
                                <button onClick={() => handleResolveTicket(selectedTicket.id)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Resolve Ticket</button>
                            ) : (
                                <div className="text-center py-4 text-xs font-bold text-text-muted italic uppercase tracking-widest">Marked as Resolved by AI</div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'support' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                        <Inbox className="h-12 w-12 mb-4" />
                        <p className="text-xs italic font-bold text-white uppercase tracking-widest leading-relaxed">Select a ticket to review the machine-generated recovery prompt.</p>
                    </div>
                )}

                {activeTab === 'revenue' && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500">
                            <Activity className="h-5 w-5" />
                            <h4 className="text-sm font-black uppercase tracking-widest italic">Forecast Alert</h4>
                        </div>
                        <p className="text-xs text-amber-500/80 leading-relaxed font-medium">Monthly expenditures are currently <span className="text-white font-black">${totalCosts}</span>, requiring <span className="text-white font-black">{breakeven}</span> paid enrollments to maintain net neutral stability.</p>
                        <ul className="space-y-2 mt-4">
                            <li className="flex items-center gap-2 text-[10px] font-bold text-amber-500/70"><div className="h-1 w-1 bg-amber-500 rounded-full" /> n8n variable scaling is inactive.</li>
                            <li className="flex items-center gap-2 text-[10px] font-bold text-amber-500/70"><div className="h-1 w-1 bg-amber-500 rounded-full" /> Vercel Pro limit at 85% capacity.</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full flex overflow-hidden bg-[#070A12] text-white font-plus-jakarta select-none">
            <NavPanel />
            <CenterPanel />
            <RightPanel />
        </div>
    );
};

export default AdminDashboard;
