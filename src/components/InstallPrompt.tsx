import { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, Cloud, MoreVertical, Monitor } from 'lucide-react';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(() => (window as any).__deferredPrompt || null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-dismissed') === '1');

  useEffect(() => {
    const b = (e: any) => { e.preventDefault(); (window as any).__deferredPrompt = e; setDeferred(e); };
    const i = () => { setInstalled(true); (window as any).__deferredPrompt = null; setDeferred(null); };
    window.addEventListener('beforeinstallprompt', b);
    window.addEventListener('appinstalled', i);
    return () => { window.removeEventListener('beforeinstallprompt', b); window.removeEventListener('appinstalled', i); };
  }, []);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  if (installed || standalone || dismissed) return null;

  const install = async () => {
    const evt = deferred || (window as any).__deferredPrompt;
    if (evt) {
      try { evt.prompt(); const c = await evt.userChoice; if (c.outcome === 'accepted') { setInstalled(true); return; } } catch {}
      (window as any).__deferredPrompt = null; setDeferred(null); setShowHelp(true);
    } else setShowHelp(true);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><Cloud className="w-7 h-7 text-white" /></div>
          <div className="flex-1"><p className="font-bold text-sm">نصب Telegram Drive</p><p className="text-xs text-gray-500 mt-0.5">آفلاین، تمام‌صفحه، سریع</p></div>
          <button onClick={install} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"><Download className="w-4 h-4 inline ml-1" />نصب</button>
          <button onClick={() => { setDismissed(true); localStorage.setItem('pwa-dismissed', '1'); }} className="p-1"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
      </div>
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold mb-4">نصب دستی</h3>
            {isIOS ? (
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3"><Share className="w-5 h-5 text-blue-500" />۱. دکمه Share</li>
                <li className="flex gap-3"><PlusSquare className="w-5 h-5 text-blue-500" />۲. Add to Home Screen</li>
                <li className="flex gap-3"><Download className="w-5 h-5 text-blue-500" />۳. Add</li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3"><MoreVertical className="w-5 h-5 text-blue-500" />۱. منوی مرورگر (⋮)</li>
                <li className="flex gap-3"><Download className="w-5 h-5 text-blue-500" />۲. «Install app» / «Add to Home screen»</li>
                <li className="flex gap-3"><Cloud className="w-5 h-5 text-blue-500" />۳. تأیید نصب</li>
              </ol>
            )}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex gap-2"><Monitor className="w-4 h-4 text-gray-500 mt-0.5" /><p className="text-xs text-gray-500">دسکتاپ: آیکون نصب در نوار آدرس</p></div>
            <button onClick={() => setShowHelp(false)} className="w-full mt-5 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">بستن</button>
          </div>
        </div>
      )}
    </>
  );
}