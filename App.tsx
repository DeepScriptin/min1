
import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminPage } from './components/AdminPage';
import { User, ContentItem } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_schedule')
      .select('*')
      .order('date_str', { ascending: false });

    if (!error && data) {
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
    setLoading(false);
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
