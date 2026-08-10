import { useState } from 'react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { Download, Loader2, Archive } from 'lucide-react';
import FileItem from './FileItem';
import ContextMenu from './ContextMenu';
import { downloadMedia } from '../lib/telegram';
import { getFileName, isEncrypted } from '../lib/fileUtils';
import { decryptBlob } from '../lib/crypto';
import { useUi } from '../store/ui';
import type { Api } from 'telegram';

export default function FileGrid({ messages, onFileOpen }: { messages: Api.Message[]; onFileOpen: (m: Api.Message) => void }) {
  const { cardSize, viewMode, starred, toggleStar, trashFile, toast, setInfoFile, setShareFile } = useUi();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<'idle' | 'dl' | 'zip'>('idle');
  const [ctx, setCtx] = useState<{ x: number; y: number; id: number; name: string } | null>(null);

  const min = Math.round(150 * (cardSize / 100));
  const toggle = (id: number) => setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const saveBlob = (blob: Blob, name: string) => {
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 5000);
  };

  const smartDownload = async (m: Api.Message) => {
    const raw = await downloadMedia(m);
    if (isEncrypted(m)) {
      const pass = prompt('🔐 رمز عبور فایل رمزگذاری‌شده:');
      if (!pass) return;
      const dec = await decryptBlob(raw, pass);
      saveBlob(dec.blob, dec.name);
    } else {
      saveBlob(raw, getFileName(m));
    }
  };

  const softDelete = (ids: number[]) => {
    if (!confirm(`انتقال ${ids.length} فایل به سطل زباله؟`)) return;
    ids.forEach((id) => trashFile(id));
    setSelected(new Set());
    toast('به سطل زباله منتقل شد 🗑️', 'success');
  };

  const bulkDownload = async () => {
    setBusy('dl');
    toast(`دانلود ${selected.size} فایل شروع شد`);
    for (const id of Array.from(selected)) {
      const m = messages.find((x) => x.id === id);
      if (!m) continue;
      try { await smartDownload(m); } catch { toast('خطا در یکی از دانلودها', 'error'); }
    }
    setBusy('idle');
    toast('تمام شد ✅', 'success');
  };

  const bulkZip = async () => {
    setBusy('zip');
    toast('در حال ساخت ZIP...');
    try {
      const zip = new JSZip();
      for (const id of Array.from(selected)) {
        const m = messages.find((x) => x.id === id);
        if (!m) continue;
        zip.file(getFileName(m), await downloadMedia(m));
      }
      saveBlob(await zip.generateAsync({ type: 'blob' }), 'telegram-drive.zip');
      toast('ZIP آماده شد 📦', 'success');
    } catch { toast('خطا در ساخت ZIP', 'error'); }
    setBusy('idle');
  };

  const ctxMsg = ctx ? messages.find((m) => m.id === ctx.id) : null;

  return (
    <>
      <div className={viewMode === 'grid' ? 'gap-3 p-4' : 'flex flex-col gap-1 p-4'} style={viewMode === 'grid' ? { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))` } : undefined}>
        {messages.map((msg, i) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
            <FileItem message={msg} viewMode={viewMode} isSelected={selected.has(msg.id)} onToggleSelect={() => toggle(msg.id)} onOpen={() => onFileOpen(msg)} onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, id: msg.id, name: getFileName(msg) }); }} />
          </motion.div>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 flex items-center gap-2 z-40 border dark:border-gray-700">
          <span className="text-sm font-medium px-2">{selected.size} انتخاب</span>
          <button onClick={bulkDownload} disabled={busy !== 'idle'} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50">{busy === 'dl' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}دانلود</button>
          <button onClick={bulkZip} disabled={busy !== 'idle'} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm disabled:opacity-50">{busy === 'zip' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}ZIP</button>
          <button onClick={() => softDelete(Array.from(selected))} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">حذف</button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">لغو</button>
        </div>
      )}

      {ctx && (
        <ContextMenu
          x={ctx.x} y={ctx.y} fileId={ctx.id} fileName={ctx.name} isEncrypted={false}
          onClose={() => setCtx(null)}
          onDownload={async () => { if (!ctxMsg) return; toast('دانلود شروع شد'); try { await smartDownload(ctxMsg); toast('کامل شد ✅', 'success'); } catch (e: any) { toast(e.message || 'خطا', 'error'); } }}
          onDelete={() => softDelete([ctx.id])}
          onRename={() => toast('تلگرام اجازه تغییر نام نمی‌دهد', 'info')}
          onCopy={() => setShareFile(ctxMsg)}
          onMove={() => setShareFile(ctxMsg)}
          onStar={() => { toggleStar(ctx.id); toast(starred.has(ctx.id) ? 'حذف از ستاره‌ها' : 'ستاره‌دار شد ⭐', 'success'); }}
          onShare={() => ctxMsg && setShareFile(ctxMsg)}
          onInfo={() => ctxMsg && setInfoFile(ctxMsg)}
        />
      )}
    </>
  );
}