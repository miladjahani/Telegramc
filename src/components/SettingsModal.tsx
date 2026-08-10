import { X, Settings, Moon, Sun, Monitor, Trash2, LogOut } from 'lucide-react';
import { useUi } from '../store/ui';
import { logout } from '../lib/telegram';

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen, cardSize, setCardSize, toast } = useUi();
  if (!settingsOpen) return null;

  const theme = localStorage.getItem('theme') || 'system';
  const encDefault = localStorage.getItem('tg_enc_default') === '1';

  const setTheme = (t: string) => {
    localStorage.setItem('theme', t);
    const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    toast('تم اعمال شد', 'success');
  };

  const clearCache = async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      toast('کش پاک شد 🧹', 'success');
    } catch { toast('خطا', 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSettingsOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h3 className="font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-blue-500" /> تنظیمات</h3>
          <button onClick={() => setSettingsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-5">
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">پوسته</p>
            <div className="flex gap-1">
              {([['light', 'روشن', Sun], ['dark', 'تاریک', Moon], ['system', 'سیستم', Monitor]] as any[]).map(([k, l, Ic]) => (
                <button key={k} onClick={() => setTheme(k)} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${theme === k ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Ic className="w-3.5 h-3.5" />{l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">اندازه پیش‌فرض کارت: {cardSize}%</p>
            <input type="range" min={50} max={200} step={25} value={cardSize} onChange={(e) => setCardSize(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={encDefault} onChange={(e) => { localStorage.setItem('tg_enc_default', e.target.checked ? '1' : '0'); toast(e.target.checked ? 'رمزگذاری پیش‌فرض فعال شد 🔐' : 'رمزگذاری پیش‌فرض غیرفعال شد'); }} className="w-4 h-4" />
              <span className="text-sm">رمزگذاری پیش‌فرض آپلودها</span>
            </label>
          </div>
          <div className="space-y-2 pt-2 border-t dark:border-gray-700">
            <button onClick={clearCache} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"><Trash2 className="w-4 h-4" />پاک‌سازی کش آفلاین</button>
            <button onClick={async () => { if (confirm('خروج از حساب؟')) { await logout(); location.reload(); } }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"><LogOut className="w-4 h-4" />خروج از حساب</button>
          </div>
          <p className="text-center text-[10px] text-gray-400">Telegram Drive v4 Premium • PWA</p>
        </div>
      </div>
    </div>
  );
}