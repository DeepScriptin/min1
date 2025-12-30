
import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage.tsx';
import { AdminPage } from './components/AdminPage.tsx';
import { User, ContentItem } from './types.ts';
import { supabase } from './lib/supabase.ts';
import { AlertTriangle, Database } from 'lucide-react';

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
      // Ensure the error message is a string to avoid React Error #31
      let message = "Unknown connection error";
      if (err?.message) message = err.message;
      else if (typeof err === 'string') message = err;
      else message = JSON.stringify(err);

      if (message.includes("404")) message = "Table 'content_schedule' not found in your Supabase database.";
      if (message.includes("API key")) message = "Invalid Supabase API Key. Please check lib/supabase.ts";
      
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (dbError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 border border-gray-100 text-center space-y-6">
          <div className="inline-flex items-center justify-center p-5 bg-red-50 rounded-3xl">
            <Database className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Connection Error</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We couldn't connect to your Supabase project. This usually means the table is missing or the API key is incorrect.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-left border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Error Details</p>
            <p className="text-xs text-red-600 font-mono break-all">{String(dbError)}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg active:scale-[0.98]"
          >
            Retry Connection
          </button>
        </div>
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}!</h1>
          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors font-bold"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
