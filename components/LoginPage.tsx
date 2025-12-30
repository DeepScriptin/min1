
import React, { useState, useMemo } from 'react';
import { ContentItem, EffectType } from '../types.ts';
import { formatDate, parseDateString } from '../constants.ts';
import { EffectOverlay } from './EffectOverlay.tsx';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string) => void;
  content: ContentItem[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, content }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const todayContent = useMemo(() => {
    if (!content.length) return null;
    const today = new Date();
    const todayStr = formatDate(today);
    
    let matched = content.find(c => c.date === todayStr);
    
    if (!matched) {
      const pastItems = content
        .map(item => ({ item, date: parseDateString(item.date) }))
        .filter(obj => obj.date !== null && obj.date <= today)
        .sort((a, b) => b.date!.getTime() - a.date!.getTime());
      
      matched = pastItems[0]?.item;
    }

    if (!matched) return null;

    const texts = [matched.text1, matched.text2, matched.text3].filter(t => t && t.trim() !== '');
    if (texts.length === 0) return { ...matched, activeText: "Believe in your journey." };
    
    const randomIndex = Math.floor(Math.random() * texts.length);
    const activeText = texts[randomIndex];
    
    return { ...matched, activeText };
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      onLogin(username);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center pt-12 px-4 overflow-hidden">
      {todayContent && <EffectOverlay type={todayContent.effect as EffectType} />}
      
      <div className="w-full max-w-2xl text-center mb-16 animate-fade-in relative z-10">
        <h2 className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.2em] mb-6">
          QUESTION OF THE DAY
        </h2>
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-start justify-center">
            {todayContent?.icon && (
              <img 
                src={todayContent.icon} 
                alt="Icon" 
                className="w-12 h-12 mr-4 mt-2 object-contain rounded-lg shadow-sm"
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight max-w-xl">
              "{todayContent?.activeText || "Loading your daily inspiration..."}"
            </h1>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-medium">
            <span>Join 1,328 learners growing today</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[560px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-10 md:p-14 relative z-10 mb-8">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h3>
          <p className="text-gray-500 text-sm font-medium">Continue your path to excellence.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 px-1">Student Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@school.edu"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 transition-all text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900 px-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 transition-all text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all transform active:scale-[0.98]"
          >
            Sign In to Journey
          </button>
        </form>
      </div>

      <div className="mt-auto text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest pb-8">
        AchieveTrack Achievement & Scholarship Program
      </div>
    </div>
  );
};
