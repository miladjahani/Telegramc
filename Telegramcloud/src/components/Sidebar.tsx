import { Cloud, FolderOpen, Clock, Star, Trash2, PieChart, LogOut, HardDrive, Hash, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { logout, getMessages, getChannels } from '../lib/telegram';
import { formatFileSize } from '../lib/formatters';
import { useUi } from '../store/ui';

export default function Sidebar({ currentFolder, onFolderChange, user }: { currentFolder: string; onFolderChange: (f: string) => void; user: any }) {
  const { sidebarOpen, setSidebarOpen, view, setView, trash, channel, setChannel, setSettingsOpen } = useUi();
  const { data } = useQuery({ queryKey: ['messages', 'saved-messages'], queryFn: () => getMessages('me', 1000) });
  const { data: channels } = useQuery({ queryKey: ['channels'], queryFn: getChannels });
  const total = (data || []).reduce((a, m) => a + (m.document ? Number(m.document.size || 0) : 0), 0);

  const closeMobile = () => { if (window.innerWidth < 1024) setSidebarOpen(false); };
  const nav = (v: any) => { setView(v); setChannel(null); onFolderChange('saved-messages'); closeMobile(); };

  const items = [
    { key: 'files', icon: FolderOpen, label: 'فایل‌های من' },
    { key: 'recent', icon: Clock, label: 'اخیراً' },
    { key: 'starred', icon: Star, label: 'ستاره‌دار' },
    { key: 'trash', icon: Trash2, label: 'سطل زباله', badge: trash.size },
    { key: 'stats', icon: PieChart, label: 'آمار فضا' },
  ];

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-200 lg:static lg:z-auto lg:h-screen lg:transition-all ${sidebarOpen ? 'translate-x-0 lg:w-72' : 'translate-x-full lg:w-0'} bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col overflow-hidden`}>
        <div className="w-72 flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"><Cloud className="w-6 h-6 text-white" /></div>
            <div className="flex-1"><h1 className="font-bold text-sm">Telegram Drive</h1><p className="text-xs text-gray-500">v4 Premium</p></div>
            <button onClick={() => { setSettingsOpen(true); closeMobile(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Settings className="w-5 h-5 text-gray-500" /></button>
          </div>
          {user && (
            <div className="p-4 border-b dark:border-gray-700">
              <p className="font-medium text-sm">{user.firstName} {user.lastName || ''}</p>
              <p className="text-xs text-gray-500 mt-1" dir="ltr">{user.phone}</p>
            </div>
          )}
          <nav className="flex-1 p-3 overflow-auto">
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it.key}>
                  <button onClick={() => nav(it.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${view === it.key && !channel ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                    <it.icon className="w-5 h-5" /><span className="flex-1 text-right">{it.label}</span>
                    {!!(it as any).badge && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-full text-xs">{(it as any).badge}</span>}
                  </button>
                </li>
              ))}
            </ul>

            {(channels || []).length > 0 && (
              <>
                <p className="mt-6 mb-2 px-3 text-xs font-bold text-gray-400">📁 پوشه‌های کانالی</p>
                <ul className="space-y-1">
                  {(channels || []).map((ch: any) => (
                    <li key={ch.id}>
                      <button onClick={() => { setChannel(ch); setView('files'); closeMobile(); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${channel?.id === ch.id ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        <Hash className="w-4 h-4 flex-shrink-0" /><span className="truncate text-right">{ch.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2"><HardDrive className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium">فضای استفاده‌شده</span></div>
              <p className="text-2xl font-bold">{formatFileSize(total)}</p>
              <p className="text-xs text-gray-500 mt-1">از نامحدود (تلگرام)</p>
            </div>
          </nav>
          <div className="p-3 border-t dark:border-gray-700">
            <button onClick={async () => { if (confirm('خروج از حساب؟')) { await logout(); location.reload(); } }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut className="w-5 h-5" /><span>خروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}