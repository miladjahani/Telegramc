import { useState, useEffect, useRef } from 'react';
import { X, Download, Trash2, Loader2, AlertCircle, RefreshCw, Star, Info, Send, Lock, Headphones } from 'lucide-react';
import type { Api } from 'telegram';
import { downloadMedia } from '../lib/telegram';
import { getFileName, getFileSize, isEncrypted } from '../lib/fileUtils';
import { decryptBlob } from '../lib/crypto';
import { formatFileSize, formatDate } from '../lib/formatters';
import { useUi } from '../store/ui';

export default function FilePreview({ message, isOpen, onClose }: { message: Api.Message; isOpen: boolean; onClose: () => void }) {
  const { starred, toggleStar, toast, setInfoFile, setShareFile, trashFile, setNowPlaying } = useUi();
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [dispName, setDispName] = useState(getFileName(message));
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const handedOff = useRef(false);
  const isStar = starred.has(message.id);
  const enc = isEncrypted(message);

  useEffect(() => { if (isOpen) load(); return () => { if (url && !handedOff.current) URL.revokeObjectURL(url); }; }, [isOpen, message]);

  const load = async () => {
    setLoading(true); setError(null); setProgress(0);
    try {
      const raw = await downloadMedia(message, setProgress);
      let b = raw; let name = getFileName(message);
      if (enc) {
        const pass = prompt('🔐 این فایل رمزگذاری‌شده است. رمز عبور:');
        if (!pass) throw new Error('لغو شد');
        const dec = await decryptBlob(raw, pass);
        b = dec.blob; name = dec.name;
      }
      setBlob(b); setDispName(name);
      setUrl(URL.createObjectURL(b));
    } catch (e: any) { setError(e?.message || 'failed'); }
    finally { setLoading(false); }
  };

  const mime = blob?.type || message.document?.mimeType || (message.photo ? 'image/jpeg' : 'video/mp4');

  const download = async () => {
    try {
      let b = blob;
      if (!b) { const raw = await downloadMedia(message, setProgress); b = enc ? (await decryptBlob(raw, prompt('🔐 رمز عبور:') || '')).blob : raw; }
      const u = URL.createObjectURL(b);
      const a = document.createElement('a'); a.href = u; a.download = dispName; a.click();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
      toast('دانلود کامل شد ✅', 'success');
    } catch (e: any) { toast(e.message || 'خطا', 'error'); }
  };

  const playBackground = () => {
    if (url) { handedOff.current = true; setNowPlaying({ url, name: dispName }); onClose(); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate flex items-center gap-2" dir="ltr" style={{ textAlign: 'left' }}>{enc && <Lock className="w-4 h-4 text-cyan-500 flex-shrink-0" />}{dispName}</h3>
            <p className="text-xs text-gray-500 mt-1">{formatFileSize(getFileSize(message))} • {formatDate(message.date)}</p>
          </div>
          <div className="flex gap-1 mr-3">
            {mime?.startsWith('audio/') && url && <button onClick={playBackground} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="پخش پس‌زمینه"><Headphones className="w-5 h-5" /></button>}
            <button onClick={() => toggleStar(message.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Star className={`w-5 h-5 ${isStar ? 'text-yellow-400 fill-yellow-400' : ''}`} /></button>
            <button onClick={() => setShareFile(message)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Send className="w-5 h-5" /></button>
            <button onClick={() => setInfoFile(message)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Info className="w-5 h-5" /></button>
            <button onClick={download} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Download className="w-5 h-5" /></button>
            <button onClick={() => { if (confirm('به سطل زباله؟')) { trashFile(message.id); onClose(); toast('به سطل زباله رفت 🗑️', 'success'); } }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500"><Trash2 className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>
        {loading && <div className="h-1 bg-gray-200 dark:bg-gray-700"><div className="h-full bg-blue-500" style={{ width: `${progress}%` }} /></div>}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[400px]">
          {loading && <div className="text-center"><Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" /><p className="text-sm text-gray-500">دانلود... {progress}%</p></div>}
          {!loading && error && <div className="text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><p className="text-red-500 text-sm mb-4" dir="ltr">{error}</p><button onClick={load} className="px-4 py-2 bg-blue-500 text-white rounded-lg inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" />تلاش مجدد</button></div>}
          {!loading && !error && url && (
            <>
              {mime?.startsWith('image/') && <img src={url} className="max-w-full max-h-full object-contain rounded-lg" />}
              {mime?.startsWith('video/') && <video src={url} controls className="max-w-full max-h-full rounded-lg" />}
              {mime?.startsWith('audio/') && <audio controls className="w-full max-w-md"><source src={url} type={mime} /></audio>}
              {mime === 'application/pdf' && <iframe src={url} className="w-full h-full rounded-lg" />}
              {!mime?.startsWith('image/') && !mime?.startsWith('video/') && !mime?.startsWith('audio/') && mime !== 'application/pdf' && <div className="text-center"><p className="text-gray-500 mb-4">پیش‌نمایش پشتیبانی نمی‌شود</p><button onClick={download} className="px-6 py-3 bg-blue-500 text-white rounded-lg">دانلود</button></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}