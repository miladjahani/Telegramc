import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, Search, Upload, Moon, Sun, SlidersHorizontal, RefreshCw, Grid3X3, List } from 'lucide-react';
import { useUi } from '../store/ui';

const TITLES: any = { files: 'فایل‌های من', recent: 'اخیراً', starred: 'ستاره‌دار', trash: 'سطل زباله', stats: 'آمار فضا' };

export default function Toolbar({ currentFolder, onUploadClick }: { currentFolder: string; onUploadClick: () => void }) {
  const ui = useUi();
  const qc = useQueryClient();
  const [panel, setPanel] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const title = ui.channel ? ui.channel.title : TITLES[ui.view];

  return (
    <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 relative z-30">
      <div className="flex items-center gap-2">
        <button onClick={() => ui.setSidebarOpen(!ui.sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Menu className="w-5 h-5" /></button>
        <div className="text-sm font-bold truncate">{title}</div>
        {ui.channel && <span className="text-[10px] px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 rounded-full">کانال</span>}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input ref={searchRef} value={ui.search} onChange={(e) => ui.setSearch(e.target.value)} placeholder="جستجو (Ctrl+K)" className="w-32 sm:w-56 pr-10 pl-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => { qc.invalidateQueries(); ui.toast('بروزرسانی شد 🔄', 'success'); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
        <button onClick={() => setPanel(!panel)} className={`p-2 rounded-lg ${panel ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><SlidersHorizontal className="w-5 h-5" /></button>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button onClick={() => ui.setViewMode('grid')} className={`p-1.5 rounded ${ui.viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => ui.setViewMode('list')} className={`p-1.5 rounded ${ui.viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}><List className="w-4 h-4" /></button>
        </div>
        <button onClick={onUploadClick} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"><Upload className="w-4 h-4" /><span className="hidden sm:inline">آپلود</span></button>
        <button onClick={() => { const n = !dark; setDark(n); document.documentElement.classList.toggle('dark', n); localStorage.setItem('theme', n ? 'dark' : 'light'); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">{dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
      </div>
      {panel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPanel(false)} />
          <div className="absolute left-4 top-14 z-50 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 p-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">مرتب‌سازی</p>
              <div className="flex gap-1">
                {([['date', 'تاریخ'], ['name', 'نام'], ['size', 'اندازه']] as any[]).map(([k, l]) => (
                  <button key={k} onClick={() => ui.setSortBy(k)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${ui.sortBy === k ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{l}</button>
                ))}
              </div>
              <button onClick={() => ui.setSortOrder(ui.sortOrder === 'asc' ? 'desc' : 'asc')} className="w-full mt-2 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-700">جهت: {ui.sortOrder === 'asc' ? 'صعودی ↑' : 'نزولی ↓'}</button>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">اندازه کارت: {ui.cardSize}%</p>
              <input type="range" min={50} max={200} step={25} value={ui.cardSize} onChange={(e) => ui.setCardSize(Number(e.target.value))} className="w-full" />
            </div>
          </div>
        </>
      )}
    </header>
  );
}