
import React, { useState, useEffect, useRef } from 'react';
import { User, ContentItem, EffectType } from '../types.ts';
import { formatDate, parseDateString } from '../constants.ts';
import { supabase } from '../lib/supabase.ts';
import { 
  Calendar, 
  LogOut, 
  Plus, 
  Trash2, 
  Upload, 
  AlertCircle, 
  X, 
  Image as ImageIcon,
  ChevronDown,
  Calendar as CalendarIcon,
  Palette
} from 'lucide-react';

interface AdminPageProps {
  user: User;
  onLogout: () => void;
  content: ContentItem[];
  refreshContent: () => Promise<void>;
}

export const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout, content, refreshContent }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    text1: '',
    text2: '',
    text3: '',
    date: formatDate(new Date()),
    type: 'Daily',
    effect: EffectType.NONE,
    icon: '',
    themeColor: '#3b82f6'
  });

  const checkContentGap = (currentContent: ContentItem[]) => {
    const today = new Date();
    const missingDays = [];
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const nextDateStr = formatDate(nextDate);
      if (!currentContent.some(c => c.date === nextDateStr)) {
        missingDays.push(nextDateStr);
      }
    }
    return missingDays;
  };

  useEffect(() => {
    const missing = checkContentGap(content);
    if (missing.length > 0) setShowAlert(true);
  }, [content]);

  const handleLogoutWithCheck = () => {
    const missing = checkContentGap(content);
    if (missing.length > 0) {
      if (confirm(`Warning: Content is missing for the next 7 days. Are you sure you want to log out?`)) {
        onLogout();
      }
    } else {
      onLogout();
    }
  };

  const validateWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length <= 30;
  };

  const handleSubmitNew = async () => {
    if (!formData.text1) {
      alert("Please enter at least text 1.");
      return;
    }
    if (!validateWordCount(formData.text1) || (formData.text2 && !validateWordCount(formData.text2)) || (formData.text3 && !validateWordCount(formData.text3))) {
      alert("Each text must be under 30 words.");
      return;
    }

    const { error } = await supabase.from('content_schedule').insert([{
      date_str: formData.date,
      type: formData.type,
      icon_url: formData.icon,
      text1: formData.text1,
      text2: formData.text2,
      text3: formData.text3,
      effect: formData.effect,
      theme_color: formData.themeColor
    }]);

    if (!error) {
      await refreshContent();
      setFormData({
        text1: '', text2: '', text3: '',
        date: formatDate(new Date()),
        type: 'Daily',
        effect: EffectType.NONE,
        icon: '',
        themeColor: '#3b82f6'
      });
    } else {
      alert(error.message);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this entry?')) {
      const { error } = await supabase.from('content_schedule').delete().eq('id', id);
      if (!error) await refreshContent();
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const newItems: any[] = [];
      const errors: string[] = [];

      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return;
        const cols = line.split(',').map(c => c.trim());
        if (cols.length < 6) {
          errors.push(`Row ${index + 2}: Missing columns`);
          return;
        }

        const [date, type, icon, t1, t2, t3] = cols;
        if (!parseDateString(date)) errors.push(`Row ${index + 2}: Invalid Date format (use D Mmm YYYY)`);
        if (!t1) errors.push(`Row ${index + 2}: Text 1 is required`);

        if (errors.length === 0) {
          newItems.push({
            date_str: date,
            type: type || 'Daily',
            icon_url: icon,
            text1: t1,
            text2: t2 || '',
            text3: t3 || '',
            effect: EffectType.NONE,
            theme_color: '#3b82f6'
          });
        }
      });

      if (errors.length > 0) {
        setImportError(errors.join('\n'));
      } else {
        const { error } = await supabase.from('content_schedule').insert(newItems);
        if (!error) {
          await refreshContent();
          setImportError(null);
        } else {
          setImportError(error.message);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Content Schedule</h1>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center space-x-2 uppercase tracking-widest"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
          <button 
            onClick={handleLogoutWithCheck} 
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 space-y-8">
        {showAlert && (
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3 text-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold tracking-tight">SCHEDULE GAP ALERT: Content is missing for the next 7 days.</span>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-amber-400 hover:text-amber-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {importError && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-red-800 flex items-center">
              <X className="w-4 h-4 mr-2" /> Import Failed
            </h3>
            <div className="text-xs text-red-600 font-mono whitespace-pre-wrap leading-relaxed">
              {importError}
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 space-y-10">
          <div className="grid grid-cols-12 gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pb-6 border-b border-gray-50">
            <div className="col-span-2">Publish Date</div>
            <div className="col-span-2">Type & Effect</div>
            <div className="col-span-7">Content Preview</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {content.length === 0 ? (
              <div className="py-20 text-center text-gray-300 font-bold italic">No content scheduled yet.</div>
            ) : content.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-6 items-center group">
                <div className="col-span-2">
                  <div className="text-sm font-bold text-gray-900">{item.date.split(' ').slice(0,2).join(' ')}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.date.split(' ')[2]}</div>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg w-fit">
                      {item.type}
                    </span>
                    {item.effect !== EffectType.NONE && (
                      <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg w-fit">
                        ✨ {item.effect}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-7">
                  <p className="text-xs text-gray-600 italic line-clamp-1">"{item.text1}"</p>
                  <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 opacity-60">
                    {item.text2 ? `• ${item.text2}` : ''} {item.text3 ? `• ${item.text3}` : ''}
                  </p>
                </div>
                <div className="col-span-1 text-right">
                  <button onClick={() => handleDeleteItem(item.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-10">
              <Plus className="w-6 h-6 text-gray-900" />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Schedule New Content</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Question Sequence (Max 3)</label>
                  <div className="space-y-4">
                    <textarea 
                      value={formData.text1}
                      onChange={(e) => setFormData({...formData, text1: e.target.value})}
                      placeholder="1. Primary inquiry..."
                      className="w-full h-28 p-6 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-sm text-gray-700 italic"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <textarea 
                        value={formData.text2}
                        onChange={(e) => setFormData({...formData, text2: e.target.value})}
                        placeholder="2. Alternate inquiry..."
                        className="w-full h-24 p-5 bg-gray-50/50 border border-gray-100 rounded-[1.2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-[11px] text-gray-600 italic"
                      />
                      <textarea 
                        value={formData.text3}
                        onChange={(e) => setFormData({...formData, text3: e.target.value})}
                        placeholder="3. Alternate inquiry..."
                        className="w-full h-24 p-5 bg-gray-50/50 border border-gray-100 rounded-[1.2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-[11px] text-gray-600 italic"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publish Date</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-200"
                        placeholder="15 Dec 2025"
                      />
                      <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Effect</label>
                    <div className="relative">
                      <select 
                        value={formData.effect}
                        onChange={(e) => setFormData({...formData, effect: e.target.value as EffectType})}
                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 appearance-none focus:outline-none focus:border-blue-200"
                      >
                        {Object.values(EffectType).map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Theme & Icon</label>
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          type="text" 
                          placeholder="Icon Image URL (https://...)"
                          value={formData.icon}
                          onChange={(e) => setFormData({...formData, icon: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-xs text-gray-600 focus:outline-none focus:border-blue-200"
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="color" 
                          value={formData.themeColor}
                          onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                          className="w-14 h-14 rounded-2xl border-none bg-transparent cursor-pointer"
                        />
                        <div className="absolute inset-0 w-14 h-14 rounded-2xl pointer-events-none flex items-center justify-center border-2 border-white shadow-sm" style={{ backgroundColor: formData.themeColor }}>
                          <Palette className="w-4 h-4 text-white drop-shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmitNew}
                  className="w-full py-5 bg-gray-900 text-white font-bold rounded-[2rem] shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center space-x-3 transform active:scale-[0.98]"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>Publish to Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 text-center text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em]">
        AchieveTrack System • Secure Admin Dashboard
      </footer>
    </div>
  );
};
