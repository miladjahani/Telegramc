import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import { useUploadFile } from '../hooks/useTelegram';
import { useUi } from '../store/ui';
import { encryptBlob } from '../lib/crypto';

export default function FileUploader({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast, channel } = useUi();
  const [queue, setQueue] = useState<any[]>([]);
  const [drag, setDrag] = useState(false);
  const [up, setUp] = useState(false);
  const [encrypt, setEncrypt] = useState(() => localStorage.getItem('tg_enc_default') === '1');
  const [pass, setPass] = useState('');
  const upMutation = useUploadFile();
  const entity = channel ? channel.entity : 'me';

  const add = useCallback((f: FileList | File[]) => {
    setQueue((p) => [...p, ...Array.from(f).map((file) => ({ id: `${file.name}-${Date.now()}`, file, status: 'pending', progress: 0 }))]);
  }, []);

  const start = async () => {
    if (encrypt && !pass) { toast('برای رمزگذاری، رمز عبور لازم است', 'error'); return; }
    setUp(true);
    for (const it of queue) {
      if (it.status !== 'pending') continue;
      setQueue((p) => p.map((q) => (q.id === it.id ? { ...q, status: 'uploading' } : q)));
      try {
        let file = it.file;
        if (encrypt) {
          toast(`رمزگذاری ${file.name}... 🔐`);
          const enc = await encryptBlob(file, pass, file.name);
          file = new File([enc], file.name + '.tdenc2', { type: 'application/octet-stream' });
        }
        await upMutation.mutateAsync({ file, entity, onProgress: (pr) => setQueue((p) => p.map((q) => (q.id === it.id ? { ...q, progress: pr } : q))) });
        setQueue((p) => p.map((q) => (q.id === it.id ? { ...q, status: 'completed', progress: 100 } : q)));
        toast(`${it.file.name} آپلود شد ✅`, 'success');
      } catch (e: any) {
        setQueue((p) => p.map((q) => (q.id === it.id ? { ...q, status: 'error', error: e.message } : q)));
      }
    }
    setUp(false);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold">آپلود {channel ? `به «${channel.title}»` : 'فایل'}</h2>
          <button onClick={() => { setQueue([]); onClose(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onClick={() => document.getElementById('fi')?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer ${drag ? 'border-blue-500 bg-blue-50' : 'border-gray-300 dark:border-gray-600'}`}>
            <input id="fi" type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }} />
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300">بکشید اینجا یا کلیک کنید</p>
            <p className="text-xs text-gray-400 mt-1">حداکثر ۲ گیگابایت</p>
          </div>

          {/* 🔐 رمزگذاری پرمیوم */}
          <div className="mt-4 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)} className="w-4 h-4" />
              <Lock className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-400">رمزگذاری سرتاسری (AES-256-GCM)</span>
            </label>
            {encrypt && (
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="رمز عبور رمزگذاری" className="input mt-2 py-2 text-sm" />
            )}
          </div>

          {queue.length > 0 && (
            <div className="mt-4 space-y-2">
              {queue.map((it) => (
                <div key={it.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {it.status === 'pending' && <Loader2 className="w-5 h-5 text-gray-400" />}
                    {it.status === 'uploading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                    {it.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {it.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    <div className="flex-1 min-w-0"><p className="text-sm truncate">{it.file.name}</p><p className="text-xs text-gray-500">{(it.file.size / 1048576).toFixed(2)} MB{it.status === 'uploading' && ` • ${it.progress}%`}</p></div>
                    {it.status === 'pending' && <button onClick={() => setQueue((p) => p.filter((q) => q.id !== it.id))}><X className="w-4 h-4 text-gray-400" /></button>}
                  </div>
                  {it.status === 'uploading' && <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${it.progress}%` }} /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <button onClick={() => { setQueue([]); onClose(); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600">انصراف</button>
          <button onClick={start} disabled={!queue.length || up} className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white disabled:opacity-50">{up ? 'در حال آپلود...' : `آپلود (${queue.length})`}</button>
        </div>
      </div>
    </div>
  );
}