import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classroom from './pages/Classroom';
import AdminDashboard from './pages/AdminDashboard';
import AgentHQ from './pages/AgentHQ';
import ProjectLab from './pages/ProjectLab';
import ModuleViewer from './pages/ModuleViewer';

const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // PREVIEW MODE TOGGLE: Set to 'true' to bypass auth for visual testing
  const isPreview = false;

  useEffect(() => {
    console.log("App initialized - Checking session...");

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        setError(error.message);
      }
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth event:", _event, session?.user?.email);
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      console.log("Fetching profile for:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid 406 error on empty result

      if (error) {
        console.warn("Profile fetch error:", error.message);
        // Try to get name from user metadata
        const { data: { user } } = await supabase.auth.getUser();
        const metaName = user?.user_metadata?.full_name || 'Student';
        setProfile({
          id: userId,
          role: 'admin',
          membership_status: 'active',
          full_name: metaName
        });
      } else if (!data) {
        console.log("No profile found, using guest defaults");
        const { data: { user } } = await supabase.auth.getUser();
        const metaName = user?.user_metadata?.full_name || 'Student';
        setProfile({
          id: userId,
          role: 'admin',
          membership_status: 'active',
          full_name: metaName
        });
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Critical Profile Fetch Error:", err);
      setProfile({ id: userId, role: 'student', membership_status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#070A12] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4 tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse italic text-cyan-400">Syncing Campus Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#070A12] text-white p-10">
        <div className="glass-card p-10 border-red-500/20 text-center max-w-md">
          <h1 className="text-red-500 font-bold mb-4">Connection Failed</h1>
          <p className="text-text-muted text-sm italic">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-white text-black font-bold rounded-xl">Retry Connection</button>
        </div>
      </div>
    )
  }

  // Helper to check if user has access
  const isCanceled = profile?.membership_status === 'canceled';

  return (
    <Router>
      <div className="min-h-screen bg-[#070A12] text-white font-plus-jakarta">
        <Routes>
          {/* Main Redirect */}
          <Route path="/hub" element={isPreview ? <Navigate to="/hub/dashboard" /> : (!session ? <Navigate to="/hub/login" /> : <Navigate to="/hub/dashboard" />)} />

          {/* Specific Routes with /hub prefix */}
          <Route path="/hub/login" element={(session && !isPreview) ? <Navigate to="/hub/dashboard" /> : <Login />} />

          <Route path="/hub/dashboard" element={
            (isPreview) ? <Dashboard profile={{ full_name: 'Rody Figueroa', role: 'admin', membership_status: 'beta' }} /> :
              !session ? <Navigate to="/hub/login" /> :
                isCanceled && profile?.role !== 'admin' ?
                  <div className="p-20 text-center bg-[#070A12] h-screen flex flex-col items-center justify-center">
                    <div className="glass-card p-12 border-amber-500/20">
                      <h2 className="text-3xl font-black mb-4 italic text-white">Access Temporarily Suspended</h2>
                      <p className="text-text-muted italic max-w-sm mx-auto">Your membership is currently inactive. Please contact support at the Team Brain HQ to reactivate your access.</p>
                    </div>
                  </div> :
                  <Dashboard profile={profile} />
          } />

          <Route path="/hub/classroom" element={<Navigate to="/hub/module/1" />} />
          <Route path="/hub/classroom/:lessonId" element={<Navigate to="/hub/module/1" />} />

          <Route path="/hub/admin" element={
            (isPreview) ? <AdminDashboard profile={{ full_name: 'Admin Rody' }} /> :
              !session || profile?.role !== 'admin'
                ? <Navigate to="/hub/dashboard" />
                : <AdminDashboard profile={profile} />
          } />

          <Route path="/hub/agents" element={
            !session ? <Navigate to="/hub/login" /> : <AgentHQ />
          } />

          <Route path="/hub/module/:moduleId" element={
            !session ? <Navigate to="/hub/login" /> : <ModuleViewer />
          } />

          <Route path="/hub/lab/:agentId" element={
            !session ? <Navigate to="/hub/login" /> : <ProjectLab />
          } />

          {/* Fallback for the root or mistakes */}
          <Route path="/" element={<Navigate to="/hub/login" />} />
          <Route path="*" element={<Navigate to="/hub/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
