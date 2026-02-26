import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Users, MessageSquare, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Lounge = ({ profile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('public:chat_messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    const newMsg = payload.new;
                    setMessages((current) => [...current, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) {
                if (error.code === '42P01') {
                    // Table doesn't exist yet
                    setError("The 'chat_messages' table hasn't been created in Supabase yet.");
                    setMessages([]);
                } else {
                    console.error('Error fetching messages:', error);
                    setError("Failed to load chat history.");
                }
            } else {
                setMessages(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !profile) return;

        const textToSend = newMessage.trim();
        setNewMessage(''); // Optimistic clear

        try {
            const { error } = await supabase.from('chat_messages').insert([
                {
                    user_id: profile.id,
                    user_name: profile.full_name || 'Anonymous Learner',
                    user_role: profile.role || 'student',
                    content: textToSend
                }
            ]);

            if (error) {
                console.error("Error sending message:", error);
                // Revert if error
                setNewMessage(textToSend);
            }
        } catch (err) {
            console.error("Unexpected error sending message:", err);
            setNewMessage(textToSend);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center p-8">
                <div className="glass-card p-12 border-red-500/20 text-center max-w-lg">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black italic uppercase tracking-tight mb-4">Database Warning</h2>
                    <p className="text-sm text-text-muted italic mb-6">{error}</p>
                    <div className="bg-black/50 p-4 rounded-xl text-left border border-white/5">
                        <p className="text-[10px] text-text-muted font-mono mb-2">Please run this SQL in your Supabase SQL Editor:</p>
                        <code className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap">
                            {`CREATE TABLE chat_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  user_name text NOT NULL,
  user_role text DEFAULT 'student',
  content text NOT NULL
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Anyone can read chat messages" 
  ON chat_messages FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Users can insert their own messages" 
  ON chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);`}
                        </code>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col pt-8 px-8 pb-4 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 shrink-0 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                        <span className="text-indigo-400"><MessageSquare className="h-8 w-8" /></span>
                        Student Lounge
                    </h1>
                    <p className="text-sm text-text-muted italic mt-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent-secondary" />
                        Connect with 250+ action-takers in our real-time ecosystem.
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Live Sync</span>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2 text-text-muted">
                        <Users className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Global</span>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-grow glass-card border-white/5 rounded-3xl overflow-hidden flex flex-col relative mb-6">
                {/* Subtle Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-secondary/5 blur-[80px] rounded-full pointer-events-none -ml-20 -mb-20"></div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Activity className="h-8 w-8 animate-spin text-indigo-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                            <MessageSquare className="h-16 w-16 text-text-muted mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest text-white italic">The Lounge is quiet</p>
                            <p className="text-[10px] text-text-muted uppercase tracking-widest">Be the first to spark a conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = profile && profile.id === msg.user_id;
                            const isAdmin = msg.user_role === 'admin';

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id || index}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-black border ${isAdmin ? 'bg-red-500/20 border-red-500/40 text-red-500' : isMe ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/10 border-white/20 text-white'}`}>
                                            {msg.user_name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Message bubble */}
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/50 italic">
                                                    {isMe ? 'You' : msg.user_name}
                                                </span>
                                                {isAdmin && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">Admin</span>
                                                )}
                                                <span className="text-[9px] font-bold text-white/30">{formatTime(msg.created_at)}</span>
                                            </div>

                                            <div className={`px-5 py-3 rounded-2xl text-sm italic shadow-lg ${isMe ? 'bg-indigo-500/20 border border-indigo-500/30 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md relative z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Share an insight or ask the community..."
                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm italic focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-white placeholder:text-white/30"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] italic hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                        >
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">Transmit</span>
                        </button>
                    </form>
                </div >
            </div >
        </div >
    );
};

export default Lounge;
