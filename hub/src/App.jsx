import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Classroom from './pages/Classroom';
import AdminDashboard from './pages/AdminDashboard';
import AgentHQ from './pages/AgentHQ';
import ProjectLab from './pages/ProjectLab';
import ModuleViewer from './pages/ModuleViewer';
import AgentTestConsole from './pages/AgentTestConsole';
import MyProjects from './pages/MyProjects';
import Lounge from './pages/Lounge';
import ProjectPlanner from './pages/ProjectPlanner';
import VlogNewsPage from './pages/VlogNewsPage';
import LibraryTracker from './pages/LibraryTracker';
import MobileNewsAdmin from './pages/MobileNewsAdmin';
import MascotAssistant from './components/MascotAssistant';
import { Toaster } from 'react-hot-toast';
import { NewsProvider } from './context/NewsContext';

// Hardcoded admin whitelist — these users always get admin access
const KNOWN_ADMINS = [
  'b2283a40-d51e-4bd2-ba46-262465a83d95', // rody@officeaim.com
  '8c08e8dc-7250-4c78-8638-46b2e78e7e3f'  // rodyf81@yahoo.es
];

const KNOWN_ADMIN_EMAILS = [
  'officeaim.hq@gmail.com',
  'rody@officeaim.com',
  'rodyf81@yahoo.es',
  'rodyf81@gmail.com'
];

// Helper to determine if a user session/identity represents an administrator
const isWhitelistedAdmin = (userId, userEmail) => {
  return KNOWN_ADMINS.includes(userId) || KNOWN_ADMIN_EMAILS.includes(userEmail);
};

// AdminGuard: re-checks role from DB on every visit to /hub/admin
const AdminGuard = ({ session, profile, setProfile }) => {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [freshProfile, setFreshProfile] = useState(profile);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session) { console.log('AdminGuard: No session'); setChecking(false); return; }
      const userId = session.user.id;
      const userEmail = session.user.email;
      const isWhitelisted = isWhitelistedAdmin(userId, userEmail);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (data) {
          // Override role if user is in whitelist or has superadmin/admin role
          const isRoleAdmin = data.role === 'superadmin' || data.role === 'admin';
          const adminProfile = (isWhitelisted || isRoleAdmin) ? { ...data, role: data.role || 'superadmin' } : data;
          setFreshProfile(adminProfile);
          setProfile(adminProfile);
          setIsAdmin(isWhitelisted || isRoleAdmin);
        } else if (isWhitelisted) {
          // No profile but whitelisted — grant admin anyway
          const fallback = { id: userId, role: 'superadmin', full_name: session.user.user_metadata?.full_name || 'Super Admin' };
          setFreshProfile(fallback);
          setProfile(fallback);
          setIsAdmin(true);
        }
      } catch (e) {
        if (isWhitelisted) { setIsAdmin(true); }
        console.warn('Admin check failed:', e);
      }
      setChecking(false);
    };
    checkAdmin();
  }, [session]);

  if (checking) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#070A12] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent-secondary mx-auto mb-4"></div>
        <p className="text-text-muted text-sm">Verifying admin access...</p>
      </div>
    </div>
  );
  if (!session || !isAdmin) return <Navigate to="/hub/dashboard" />;
  return <AdminDashboard profile={freshProfile} />;
};

const ResourceRedirect = ({ to }) => {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#070A12] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">Loading Public Resource...</p>
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ------------------------------------------------------------
  // DEV PREVIEW MODE – bypass authentication and Supabase calls
  // ------------------------------------------------------------
  // Set to true to render the landing page and student dashboard
  // without requiring a real login. This is useful for quick UI
  // testing or when the Supabase endpoint is unreachable.
  const FORCE_PREVIEW = false;
  const mockSession = {
    user: {
      id: 'preview-user',
      email: 'preview@officeaim.com',
      user_metadata: { full_name: 'Preview User' },
    },
  };
  const mockProfile = {
    id: 'preview-user',
    role: 'student',
    membership_status: 'active',
    full_name: 'Preview User',
  };
  // Determine preview based on flag (overrides email check)
  const isPreview = FORCE_PREVIEW;


  useEffect(() => {
    console.log("App initialized - Checking session...");

    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const localDevAdmin = isLocalhost && localStorage.getItem('OFFICEAIM_LOCAL_DEV_AUTH') === 'admin';

    if (FORCE_PREVIEW || localDevAdmin) {
      // Skip real Supabase calls, use mock admin data
      const adminSession = {
        user: {
          id: 'b2283a40-d51e-4bd2-ba46-262465a83d95',
          email: 'admin@officeaim.com',
          user_metadata: { full_name: 'Admin Rody' },
        },
      };
      const adminProfile = {
        id: 'b2283a40-d51e-4bd2-ba46-262465a83d95',
        role: 'admin',
        membership_status: 'active',
        full_name: 'Admin Rody',
      };
      setSession(adminSession);
      setProfile(adminProfile);
      setLoading(false);
      return;
    }

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        setError(error.message);
      }
      setSession(session);
      if (session) fetchProfile(session.user);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth event:", _event, session?.user?.email);
      setSession(session);
      if (session) fetchProfile(session.user);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user) => {
    try {
      const userId = user.id;
      const userEmail = user.email;
      console.log("Fetching profile for:", userId, userEmail);
      // If preview mode is active, skip actual DB fetch
    if (FORCE_PREVIEW) {
      const isWhitelisted = isWhitelistedAdmin(userId, userEmail);
      setProfile({
        id: userId,
        role: isWhitelisted ? 'admin' : 'student',
        membership_status: 'active',
        full_name: user?.user_metadata?.full_name || 'Preview User',
      });
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid 406 error on empty result

    const isWhitelisted = isWhitelistedAdmin(userId, userEmail);

      if (error) {
        console.warn("Profile fetch error:", error.message);
        // Try to get name from user metadata
        const metaName = user?.user_metadata?.full_name || 'Student';
        setProfile({
          id: userId,
          role: isWhitelisted ? 'admin' : 'student',
          membership_status: 'active',
          full_name: metaName
        });
      } else if (!data) {
        console.log("No profile found, using guest defaults");
        const metaName = user?.user_metadata?.full_name || 'Student';
        setProfile({
          id: userId,
          role: isWhitelisted ? 'admin' : 'student',
          membership_status: 'active',
          full_name: metaName
        });
      } else {
        // Override role for whitelisted admins
        const profileData = (isWhitelisted || data.role === 'admin') ? { ...data, role: 'admin' } : data;
        setProfile(profileData);
      }
    } catch (err) {
      console.error("Critical Profile Fetch Error:", err);
      const isWhitelisted = isWhitelistedAdmin(user.id, user.email);
      setProfile({ id: user.id, role: isWhitelisted ? 'admin' : 'student', membership_status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  const isWidgetRoute = window.location.pathname === '/hub/widget';

  if (loading && !isWidgetRoute) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#070A12] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4 tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse italic text-cyan-400">Syncing Campus Data...</p>
        </div>
      </div>
    );
  }

  if (error && !isWidgetRoute) {
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
    <NewsProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} toastOptions={{ className: 'glass-card border-white/10 text-white text-[12px] italic font-bold', style: { background: 'rgba(7, 10, 18, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' } }} />
        <div className={isWidgetRoute ? "min-h-screen bg-transparent text-white font-plus-jakarta" : "min-h-screen bg-[#070A12] text-white font-plus-jakarta"}>
          <Routes>
            {/* Super Admin Authentication & Mobile News Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/hub/admin/login" element={<AdminLogin />} />
            <Route path="/admin/news" element={<MobileNewsAdmin profile={profile} />} />
            <Route path="/hub/admin/news" element={<MobileNewsAdmin profile={profile} />} />
            <Route path="/admin" element={<Navigate to="/hub/admin" />} />
            <Route path="/news" element={<Navigate to="/hub/vlog-news" />} />

            {/* Main Redirect */}
            <Route path="/hub" element={isPreview ? <Navigate to="/hub/dashboard" /> : (!session ? <Navigate to="/hub/login" /> : <Navigate to="/hub/dashboard" />)} />

            {/* Specific Routes with /hub prefix */}
            <Route path="/hub/login" element={(session && !isPreview) ? <Navigate to="/hub/dashboard" /> : <Login />} />

          {/* PROTECTED ROUTES WRAPPED IN MAIN LAYOUT */}
          <Route element={
            // Global guard for the layout
            !session ? <Navigate to="/hub/login" /> :
              (isCanceled && profile?.role !== 'admin') ?
                <div className="p-20 text-center bg-[#070A12] h-screen flex flex-col items-center justify-center">
                  <div className="glass-card p-12 border-amber-500/20">
                    <h2 className="text-3xl font-black mb-4 italic text-white">Access Temporarily Suspended</h2>
                    <p className="text-text-muted italic max-w-sm mx-auto">Your membership is currently inactive. Please contact support at the Team Brain HQ to reactivate your access.</p>
                  </div>
                </div>
                : <MainLayout profile={profile} />
          }>
            <Route path="/hub/dashboard" element={<Dashboard profile={profile} />} />
            <Route path="/hub/classroom" element={<Navigate to="/hub/module/1" />} />
            <Route path="/hub/classroom/:lessonId" element={<Navigate to="/hub/module/1" />} />

            <Route path="/hub/agents" element={<AgentHQ />} />
            <Route path="/hub/module/:moduleId" element={<ModuleViewer />} />
            <Route path="/hub/lab/:agentId" element={<ProjectLab />} />
            <Route path="/hub/planner" element={<ProjectPlanner profile={profile} />} />
            <Route path="/hub/agent-test" element={<AgentTestConsole />} />
            <Route path="/hub/projects" element={<MyProjects />} />
            <Route path="/hub/lounge" element={<Lounge profile={profile} />} />
            <Route path="/hub/library" element={<ResourceRedirect to="/resources/library-tracker.html" />} />
          </Route>

          {/* PUBLIC ROUTES WITH MAIN LAYOUT (Guest access) */}
          <Route element={<MainLayout profile={profile || { role: 'guest', full_name: 'Visitor', membership_status: 'active' }} />}>
            <Route path="/hub/vlog-news" element={<VlogNewsPage profile={profile || { role: 'guest' }} />} />
          </Route>

          <Route path="/hub/widget" element={<MascotAssistant profile={{ role: 'guest' }} />} />

          {/* PUBLIC STANDALONE UTILITY ROUTE (Redirected to public standalone resource) */}
          <Route path="/hub/library-tracker" element={<ResourceRedirect to="/resources/library-tracker.html" />} />
          <Route path="/library-tracker" element={<ResourceRedirect to="/resources/library-tracker.html" />} />

          <Route path="/hub/admin" element={
            (isPreview) ? <AdminDashboard profile={{ full_name: 'Admin Rody' }} /> :
              <AdminGuard session={session} profile={profile} setProfile={setProfile} />
          } />

            {/* Fallback for the root or mistakes */}
            <Route path="/" element={<Navigate to="/hub/login" />} />
            <Route path="*" element={<Navigate to="/hub/login" />} />
          </Routes>
        </div>
      </Router>
    </NewsProvider>
  );
};

export default App;
