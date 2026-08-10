import { useEffect, useState } from 'react';
import { X, Send, Loader2, Users } from 'lucide-react';
import { useUi } from '../store/ui';
import { getDialogs, forwardMessage } from '../lib/telegram';
import { getFileName } from '../lib/fileUtils';

export default function ShareModal() {
  const { shareFile, setShareFile, toast } = useUi();
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (shareFile) { setLoading(true); getDialogs().then(setDialogs).catch(() => toast('خطا در دریافت گفتگوها', 'error')).finally(() => setLoading(false)); }
  }, [shareFile]);

  if (!shareFile) return null;

  const send = async (d: any) => {
    setSending(d.title);
    try { await forwardMessage([shareFile.id], d.entity); toast(`به «${d.title}» ارسال شد 📤`, 'success'); setShareFile(null); }
    catch { toast('خطا در ارسال', 'error'); }
    finally { setSending(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShareFile(null)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div><h3 className="font-bold flex items-center gap-2"><Send className="w-4 h-4 text-blue-500" />اشتراک‌گذاری</h3><p className="text-xs text-gray-500 mt-1 truncate" dir="ltr">{getFileName(shareFile)}</p></div>
          <button onClick={() => setShareFile(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {loading && <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>}
          {!loading && dialogs.length === 0 && <div className="p-8 text-center text-gray-500 text-sm"><Users className="w-8 h-8 mx-auto mb-2" />گفتگویی یافت نشد</div>}
          {dialogs.map((d) => (
            <button key={d.title} onClick={() => send(d)} disabled={!!sending} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold">{d.title[0]}</div>
              <span className="flex-1 text-right text-sm font-medium truncate">{d.title}</span>
              {sending === d.title ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-gray-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}