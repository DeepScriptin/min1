
import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage.tsx';
import { AdminPage } from './components/AdminPage.tsx';
import { User, ContentItem } from './types.ts';
import { supabase } from './lib/supabase.ts';
import { AlertTriangle, Database, RefreshCw, Key, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setDbError(null);
      
      const { data, error } = await supabase
        .from('content_schedule')
        .select('*')
        .order('date_str', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          date: item.date_str,
          type: item.type,
          icon: item.icon_url,
          text1: item.text1,
          text2: item.text2,
          text3: item.text3,
          effect: item.effect,
          themeColor: item.theme_color || '#3b82f6'
        }));
        setContent(mapped);
      }
    } catch (err: any) {
      console.error("Supabase Connection Failed:", err);
      
      let message = "Unknown connection error";
      if (err?.message) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        try {
          message = JSON.stringify(err);
        } catch (e) {
          message = "An unidentifiable error occurred during database connection.";
        }
      }

      if (message.includes("404")) message = "Table 'content_schedule' not found. Ensure you ran the SQL setup in Supabase.";
      if (message.includes("API key")) message = "Invalid Supabase API Key. Please check your environment variables.";
      if (message.includes("failed to fetch")) message = "Network error. Check your internet or Supabase URL.";
      
      setDbError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleLogin = (username: string) => {
    const role = username.toLowerCase().includes('admin') ? 'admin' : 'student';
    setUser({ username, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const Copyright = () => (
    <footer className="mt-auto py-8 text-center w-full">
      <p className="text-[9px] text-gray-300 font-medium tracking-[0.1em]">
        © 2024 <a href="https://envisageit.co.in" className="text-gray-400 hover:text-blue-500 transition-colors">envisageit.co.in</a> • All rights reserved.
      </p>
    </footer>
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] animate-pulse">
          Establishing Secure Handshake
        </p>
      </div>
      <Copyright />
    </div>
  );

  if (dbError && !user) {
    const isInvalidKey = dbError.toLowerCase().includes("key") || dbError.includes("JWT");
    const isStripeKeyDetected = dbError.includes("sb_publishable");
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 border border-gray-100 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-6 bg-red-50 rounded-[2rem]">
            {isStripeKeyDetected ? <ShieldAlert className="w-12 h-12 text-red-500" /> : 
             isInvalidKey ? <Key className="w-12 h-12 text-red-500" /> : 
             <Database className="w-12 h-12 text-red-500" />}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {isStripeKeyDetected ? "Stripe Key Detected" : "Database Connection Failed"}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed px-4">
              {isStripeKeyDetected 
                ? "Your key starts with 'sb_publishable', which is for Stripe. Supabase keys start with 'eyJ'." 
                : isInvalidKey 
                ? "Your Supabase API Key appears to be invalid. Check NEXT_PUBLIC_SUPABASE_ANON_KEY."
                : "We couldn't reach your Supabase project. Check project status and table setup."}
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-2xl text-left border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Technical Exception</p>
            <div className="text-xs text-red-600 font-mono break-all leading-relaxed bg-white p-3 rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              {String(dbError)}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2 text-xs uppercase tracking-widest"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Session</span>
            </button>
          </div>
        </div>
        <Copyright />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!user ? (
        <LoginPage onLogin={handleLogin} content={content} />
      ) : user.role === 'admin' ? (
        <AdminPage 
          user={user} 
          onLogout={handleLogout} 
          content={content} 
          refreshContent={fetchContent} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-10 text-center animate-fade-in">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-10">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Access Granted.</h1>
            <p className="text-gray-400 mb-12 max-w-sm font-medium">Scholar <b>{user.username}</b> is successfully authenticated for the current session.</p>
            <button 
              onClick={handleLogout}
              className="px-12 py-5 bg-gray-100 text-gray-900 rounded-2xl hover:bg-gray-200 transition-all font-bold shadow-sm text-xs uppercase tracking-widest"
            >
              Terminate Session
            </button>
          </div>
          <Copyright />
        </div>
      )}
    </div>
  );
};

export default App;
