import { useEffect, useRef } from 'react';
import { Download, Trash2, Pencil, Copy, MoveRight, Star, Share2, Info } from 'lucide-react';

export default function ContextMenu(props: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) props.onClose(); };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && props.onClose();
    document.addEventListener('mousedown', h); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', esc); };
  }, []);

  const items: any[] = [
    { icon: Download, label: 'دانلود', action: props.onDownload },
    'sep',
    { icon: Pencil, label: 'تغییر نام', action: props.onRename },
    { icon: Copy, label: 'کپی به چت', action: props.onCopy },
    { icon: MoveRight, label: 'انتقال', action: props.onMove },
    'sep',
    { icon: Star, label: 'ستاره', action: props.onStar },
    { icon: Share2, label: 'اشتراک', action: props.onShare },
    { icon: Info, label: 'اطلاعات', action: props.onInfo },
    'sep',
    { icon: Trash2, label: 'حذف', action: props.onDelete, danger: true },
  ];

  return (
    <div ref={ref} style={{ position: 'fixed', top: props.y, left: props.x, zIndex: 1000 }} className="w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 py-2">
      <div className="px-4 py-2 border-b dark:border-gray-700 mb-1"><p className="text-xs text-gray-500 truncate">{props.fileName}</p></div>
      {items.map((it, i) => it === 'sep' ? <div key={i} className="my-1 border-t dark:border-gray-700" /> : (
        <button key={it.label} onClick={() => { it.action(); props.onClose(); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${it.danger ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
          <it.icon className="w-4 h-4" /><span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}