import { useEffect, useState } from 'react';
import { Download, Loader2, AlertCircle, Star, Lock, Image as ImageIcon, Video, Music, FileText, Archive, File as FileIcon } from 'lucide-react';
import type { Api } from 'telegram';
import { formatFileSize, formatDate } from '../lib/formatters';
import { getFileName, getFileSize, isEncrypted } from '../lib/fileUtils';
import { downloadThumb, downloadMedia } from '../lib/telegram';
import { useUi } from '../store/ui';

function getType(m: Api.Message): { label: string; icon: any; color: string } {
  if (isEncrypted(m)) return { label: 'ENC', icon: Lock, color: 'text-cyan-500' };
  if (m.photo) return { label: 'IMG', icon: ImageIcon, color: 'text-green-500' };
  if (m.video) return { label: 'VID', icon: Video, color: 'text-purple-500' };
  if (m.audio || m.voice) return { label: 'AUD', icon: Music, color: 'text-pink-500' };
  if (m.document) {
    const mime = m.document.mimeType || '';
    if (mime.includes('pdf')) return { label: 'PDF', icon: FileText, color: 'text-red-500' };
    if (mime.includes('zip') || mime.includes('rar')) return { label: 'ZIP', icon: Archive, color: 'text-orange-500' };
    if (mime.startsWith('image/')) return { label: 'IMG', icon: ImageIcon, color: 'text-green-500' };
    if (mime.startsWith('video/')) return { label: 'VID', icon: Video, color: 'text-purple-500' };
  }
  return { label: 'DOC', icon: FileIcon, color: 'text-gray-400' };
}

export default function FileItem({ message, viewMode, isSelected, onToggleSelect, onOpen, onContextMenu }: { message: Api.Message; viewMode: 'grid' | 'list'; isSelected: boolean; onToggleSelect: () => void; onOpen: () => void; onContextMenu: (e: React.MouseEvent) => void }) {
  const { starred, toggleStar, toast } = useUi();
  const [thumb, setThumb] = useState<string | null>(null);
  const [dl, setDl] = useState<'idle' | 'loading' | 'error'>('idle');
  const type = getType(message);
  const Icon = type.icon;
  const size = getFileSize(message);
  const isStar = starred.has(message.id);
  const enc = isEncrypted(message);

  useEffect(() => {
    if (enc) return;
    let a = true;
    downloadThumb(message).then((u) => { if (a && u) setThumb(u); });
    return () => { a = false; };
  }, [message.id]);

  const download = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dl === 'loading') return;
    setDl('loading');
    try {
      const b = await downloadMedia(message);
      const u = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = u; a.download = getFileName(message); a.click();
      setTimeout(() => URL.revokeObjectURL(u), 4000);
      setDl('idle'); toast('دانلود کامل شد ✅', 'success');
    } catch { setDl('error'); toast('خطا در دانلود', 'error'); setTimeout(() => setDl('idle'), 2000); }
  };

  const star = (e: React.MouseEvent) => { e.stopPropagation(); toggleStar(message.id); toast(isStar ? 'حذف از ستاره‌ها' : 'ستاره‌دار شد ⭐', 'success'); };

  if (viewMode === 'list') {
    return (
      <div onClick={onOpen} onContextMenu={onContextMenu} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border-2 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400' : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
        <button onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>{isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</button>
        {thumb ? <img src={thumb} className="w-9 h-9 rounded object-cover" /> : <Icon className={`w-6 h-6 ${type.color}`} />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate" dir="ltr" style={{ textAlign: 'left' }}>{getFileName(message)}</p>
          <p className="text-[10px] text-gray-400">{formatDate(message.date)}</p>
        </div>
        {enc && <Lock className="w-3.5 h-3.5 text-cyan-500" />}
        {size > 0 && <span className="text-[10px] text-gray-400">{formatFileSize(size)}</span>}
        <button onClick={star} className="p-1.5"><Star className={`w-4 h-4 ${isStar ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} /></button>
        <button onClick={download} className="p-1.5">{dl === 'loading' ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Download className="w-4 h-4 text-gray-400" />}</button>
      </div>
    );
  }

  return (
    <div onClick={onOpen} onContextMenu={onContextMenu} className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white dark:bg-gray-800 ${isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md'}`}>
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center overflow-hidden">
        {thumb && !enc ? <img src={thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <Icon className={`w-12 h-12 ${type.color}`} />}
        <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${enc ? 'bg-cyan-600' : 'bg-black/60'} text-white`}>{type.label}</span>
        <button onClick={star} className={`absolute top-2 right-9 p-1.5 rounded-lg bg-black/50 ${isStar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}><Star className={`w-3.5 h-3.5 ${isStar ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} /></button>
        <button onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100'}`}>{isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</button>
        <button onClick={download} className="absolute bottom-2 left-2 p-2 rounded-lg bg-black/60 text-white hover:bg-blue-600">{dl === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : dl === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Download className="w-4 h-4" />}</button>
        {size > 0 && <span className="absolute bottom-2 right-2 text-[10px] text-white bg-black/60 px-1.5 py-0.5 rounded">{formatFileSize(size)}</span>}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium truncate" dir="ltr" style={{ textAlign: 'left' }}>{getFileName(message)}</p>
        <p className="text-[10px] text-gray-400 mt-1">{formatDate(message.date)}</p>
      </div>
    </div>
  );
}