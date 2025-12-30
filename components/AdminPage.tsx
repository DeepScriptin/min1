
import React, { useState, useEffect, useRef } from 'react';
import { User, ContentItem, EffectType } from '../types';
import { formatDate, parseDateString, MONTHS } from '../constants';
import { supabase } from '../lib/supabase';
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
  Calendar as CalendarIcon
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

  // Form State
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
    if (missing.length > 0) {
      setShowAlert(true);
    }
  }, [content]);

  const handleLogoutWithCheck = () => {
    const missing = checkContentGap(content);
    if (missing.length > 0) {
      setShowAlert(true);
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
    if (!formData.text1 || !formData.text2 || !formData.text3) {
      alert("Please fill all 3 texts.");
      return;
    }
    if (!validateWordCount(formData.text1) || !validateWordCount(formData.text2) || !validateWordCount(formData.text3)) {
      alert("Texts must be under 30 words.");
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
        if (!parseDateString(date)) errors.push(`Row ${index + 2}: Invalid Date`);
        if (!t1 || !t2 || !t3) errors.push(`Row ${index + 2}: All 3 Texts required`);

        if (errors.length === 0) {
          newItems.push({
            date_str: date,
            type,
            icon_url: icon,
            text1: t1,
            text2: t2,
            text3: t3,
            effect: EffectType.NONE
          });
        }
      });

      if (errors.length > 0) {
        setImportError(errors.join('\n'));
      } else {
        const { error } = await supabase.from('content_schedule').insert(newItems);
        if (!error) await refreshContent();
        else setImportError(error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h1 className="text-lg font-bold text-gray-800">Admin Content Schedule</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => fileInputRef.current?.click()} className="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center space-x-1">
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleCsvImport} accept=".csv" className="hidden" />
          <button onClick={handleLogoutWithCheck} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-8">
        {showAlert && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-amber-800 font-medium italic">Schedule gap detected for the next 7 days.</span>
            </div>
            <button onClick={() => setShowAlert(false)} className="text-amber-400 hover:text-amber-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        {importError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 whitespace-pre-wrap">
            {importError}
          </div>
        )}

        {/* Schedule List */}
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-50">
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-7">Text</div>
            <div className="col-span-1 text-right"></div>
          </div>

          <div className="space-y-6">
            {content.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center group">
                <div className="col-span-2 text-xs font-bold text-gray-900 leading-tight">
                  {item.date.split(' ').slice(0,2).join(' ')}<br/>
                  <span className="text-[10px] text-gray-400">{item.date.split(' ')[2]}</span>
                </div>
                <div className="col-span-2">
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    item.effect !== EffectType.NONE 
                    ? 'bg-red-50 text-red-400' 
                    : 'bg-blue-50 text-blue-400'
                  }`}>
                    {item.type} {item.effect !== EffectType.NONE ? `(${item.effect})` : ''}
                  </span>
                </div>
                <div className="col-span-7 text-xs text-gray-500 italic line-clamp-2">
                  "{item.text1}"
                </div>
                <div className="col-span-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-8">
              <Plus className="w-5 h-5 text-gray-900" />
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Schedule New Text</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Left Column: Text Areas */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Question Text Content (Texts 1-3)</h3>
                <div className="space-y-4">
                  <textarea 
                    value={formData.text1}
                    onChange={(e) => setFormData({...formData, text1: e.target.value})}
                    placeholder="Enter the daily inquiry text 1 here..."
                    className="w-full h-24 p-6 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-sm text-gray-700 placeholder:text-gray-300 italic shadow-sm"
                  />
                  <textarea 
                    value={formData.text2}
                    onChange={(e) => setFormData({...formData, text2: e.target.value})}
                    placeholder="Enter text 2 here..."
                    className="w-full h-20 p-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-xs text-gray-700 placeholder:text-gray-300 italic shadow-sm"
                  />
                  <textarea 
                    value={formData.text3}
                    onChange={(e) => setFormData({...formData, text3: e.target.value})}
                    placeholder="Enter text 3 here..."
                    className="w-full h-20 p-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all text-xs text-gray-700 placeholder:text-gray-300 italic shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column: Settings */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publish Date</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-200"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Effect Type</label>
                    <div className="relative">
                      <select 
                        value={formData.effect}
                        onChange={(e) => setFormData({...formData, effect: e.target.value as EffectType})}
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 appearance-none focus:outline-none focus:border-blue-200"
                      >
                        {Object.values(EffectType).map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Graphic URL & Theme Color</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                      <input 
                        type="text" 
                        placeholder="https://..."
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:border-blue-200"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="color" 
                        value={formData.themeColor}
                        onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                        className="w-12 h-10 border-none bg-transparent cursor-pointer"
                      />
                      <div className="absolute inset-0 w-12 h-10 rounded-lg pointer-events-none" style={{ backgroundColor: formData.themeColor }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSubmitNew}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Schedule Content</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">
        AchieveTrack Achievement & Scholarship Program • Dashboard Version 2.0
      </footer>
    </div>
  );
};
