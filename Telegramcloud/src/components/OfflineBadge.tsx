import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBadge() {
  const [on, setOn] = useState(navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true); const b = () => setOn(false);
    window.addEventListener('online', a); window.addEventListener('offline', b);
    return () => { window.removeEventListener('online', a); window.removeEventListener('offline', b); };
  }, []);
  if (on) return null;
  return <div className="fixed top-0 left-0 right-0 z-[9998] bg-amber-500 text-black text-center text-xs font-bold py-1.5 flex items-center justify-center gap-2"><WifiOff className="w-3.5 h-3.5" />آفلاین — نسخه کش‌شده</div>;
}