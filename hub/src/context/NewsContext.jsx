import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const NewsContext = createContext(null);

export const NewsProvider = ({ children }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch news items from Supabase
    const fetchNews = useCallback(async (includeDrafts = false) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('news')
                .select('*')
                .order('published_at', { ascending: false });

            if (!includeDrafts) {
                query = query.eq('published', true);
            }

            const { data, error: fetchErr } = await query;

            if (fetchErr) throw fetchErr;
            setNews(data || []);
        } catch (err) {
            console.error('Error fetching news:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create news item
    const createNews = async (newItem) => {
        const toastId = toast.loading('Publishing news item...');
        try {
            const payload = {
                title: newItem.title.trim(),
                description: newItem.description?.trim() || '',
                youtube_url: newItem.youtube_url?.trim() || null,
                category: newItem.category?.trim() || 'Generative AI',
                published: Boolean(newItem.published),
                published_at: newItem.published_at || new Date().toISOString()
            };

            const { data, error: insertError } = await supabase
                .from('news')
                .insert([payload])
                .select()
                .single();

            if (insertError) throw insertError;

            setNews((prev) => [data, ...prev]);
            toast.success('News item created successfully!', { id: toastId });
            return { data, error: null };
        } catch (err) {
            console.error('Failed to create news item:', err);
            toast.error(`Error: ${err.message}`, { id: toastId });
            return { data: null, error: err };
        }
    };

    // Update news item
    const updateNews = async (id, updates) => {
        const toastId = toast.loading('Updating news item...');
        try {
            const payload = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error: updateError } = await supabase
                .from('news')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            setNews((prev) => prev.map((item) => (item.id === id ? data : item)));
            toast.success('News item updated successfully!', { id: toastId });
            return { data, error: null };
        } catch (err) {
            console.error('Failed to update news item:', err);
            toast.error(`Error: ${err.message}`, { id: toastId });
            return { data: null, error: err };
        }
    };

    // Delete news item
    const deleteNews = async (id) => {
        const toastId = toast.loading('Deleting news item...');
        try {
            const { error: deleteError } = await supabase
                .from('news')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setNews((prev) => prev.filter((item) => item.id !== id));
            toast.success('News item deleted successfully!', { id: toastId });
            return { error: null };
        } catch (err) {
            console.error('Failed to delete news item:', err);
            toast.error(`Error: ${err.message}`, { id: toastId });
            return { error: err };
        }
    };

    // Optional Supabase Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('realtime:news')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'news' },
                () => {
                    // Refetch when any change occurs in the database
                    fetchNews(false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchNews]);

    return (
        <NewsContext.Provider
            value={{
                news,
                loading,
                error,
                fetchNews,
                createNews,
                updateNews,
                deleteNews
            }}
        >
            {children}
        </NewsContext.Provider>
    );
};

export const useNews = () => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
};
