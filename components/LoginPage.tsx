
import React, { useState, useMemo, useEffect } from 'react';
import { ContentItem, EffectType } from '../types.ts';
import { formatDate, parseDateString } from '../constants.ts';
import { EffectOverlay } from './EffectOverlay.tsx';
import { Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap, Target, Lightbulb } from 'lucide-react';
import { getAIInsight } from '../lib/ai.ts';

interface LoginPageProps {
  onLogin: (username: string) => void;
  content: ContentItem[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, content }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

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
    return { ...matched, questions: texts };
  }, [content]);

  useEffect(() => {
    if (todayContent?.questions && todayContent.questions.length > 0) {
      setLoadingAI(true);
      getAIInsight(todayContent.questions).then(insight => {
        setAiInsight(insight);
        setLoadingAI(false);
      });
    }
  }, [todayContent?.questions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      onLogin(username);
    }
  };

  const questionIcons = [<Target className="w-5 h-5" />, <GraduationCap className="w-5 h-5" />, <Lightbulb className="w-5 h-5" />];

  return (
    <div className="relative min-h-screen bg-[#f5f5f7] flex flex-col items-center pt-10 px-4 overflow-hidden">
      {todayContent && <EffectOverlay type={todayContent.effect as EffectType} />}
      
      <div className="w-full max-w-3xl text-center mb-10 animate-fade-in relative z-10">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-6">
          SCHOLAR DAILY SEQUENCE
        </h2>
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="grid grid-cols-1 gap-4 w-full max-w-2xl px-4">
            {todayContent?.questions.map((q, idx) => (
              <div key={idx} className="glass rounded-[1.5rem] p-5 md:p-6 text-left border border-white/60 shadow-sm flex items-start space-x-4 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="mt-1 p-2 bg-gray-900 text-white rounded-lg shadow-lg">
                  {questionIcons[idx] || <Target className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Objective {idx + 1}</p>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight tracking-tight">
                    {q}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          
          {(aiInsight || loadingAI) && (
            <div className="max-w-xl bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white shadow-xl animate-fade-in">
              <div className="flex items-center space-x-2 mb-3 text-blue-600 justify-center">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">AI Scholar Synthesis</span>
              </div>
              {loadingAI ? (
                <div className="flex justify-center space-x-1 py-4">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              ) : (
                <p className="text-sm md:text-base text-gray-700 italic leading-relaxed text-center font-medium">
                  "{aiInsight}"
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <span>Active Session Presence</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-gray-100 p-8 md:p-12 relative z-10 mb-16">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Access Portal</h3>
          <p className="text-gray-400 text-xs font-medium">Verify credentials to enter scholar dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Institutional ID / Email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 transition-all text-gray-700 font-medium text-sm"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Security Passcode"
                className="w-full pl-12 pr-12 py-4 bg-gray-50/80 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400/50 transition-all text-gray-700 font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-200 hover:bg-black transition-all transform active:scale-[0.98] text-[10px] uppercase tracking-[0.2em]"
          >
            Authenticate Profile
          </button>

          <div className="pt-2 text-center">
            <button type="button" className="text-[10px] font-bold text-gray-300 hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">
              Security Protocol Support
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-auto py-8 text-center animate-fade-in relative z-10 w-full bg-white/30 backdrop-blur-sm border-t border-gray-200/50">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em] mb-2">
          AchieveTrack Achievement Program
        </p>
        <p className="text-[9px] text-gray-300 font-medium tracking-[0.1em]">
          © 2024 <a href="https://envisageit.co.in" className="text-gray-400 hover:text-blue-500 transition-colors">envisageit.co.in</a> • All rights reserved.
        </p>
      </footer>
    </div>
  );
};
