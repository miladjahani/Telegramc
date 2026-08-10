import { Image as ImageIcon, Video, Music, Archive, FileText, HardDrive, Copy } from 'lucide-react';
import type { Api } from 'telegram';
import { getFileCategory, getFileSize, getFileName } from '../lib/fileUtils';
import { formatFileSize } from '../lib/formatters';

const CATS = [
  { key: 'image', label: 'تصاویر', icon: ImageIcon, color: 'bg-green-500', text: 'text-green-500' },
  { key: 'video', label: 'ویدیوها', icon: Video, color: 'bg-purple-500', text: 'text-purple-500' },
  { key: 'audio', label: 'صوت‌ها', icon: Music, color: 'bg-pink-500', text: 'text-pink-500' },
  { key: 'archive', label: 'آرشیوها', icon: Archive, color: 'bg-orange-500', text: 'text-orange-500' },
  { key: 'doc', label: 'اسناد', icon: FileText, color: 'bg-blue-500', text: 'text-blue-500' },
];

export default function StatsPanel({ messages }: { messages: Api.Message[] }) {
  const stats = CATS.map((c) => {
    const items = messages.filter((m) => getFileCategory(m) === c.key);
    return { ...c, count: items.length, bytes: items.reduce((a, m) => a + getFileSize(m), 0) };
  });
  const total = stats.reduce((a, s) => a + s.bytes, 0);
  const map = new Map<string, number>();
  messages.forEach((m) => { const k = `${getFileName(m)}|${getFileSize(m)}`; map.set(k, (map.get(k) || 0) + 1); });
  const dups = Array.from(map.entries()).filter(([, c]) => c > 1);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="bg-gradient-to-l from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg flex items-center gap-4">
        <HardDrive className="w-10 h-10" />
        <div><p className="text-sm opacity-80">مجموع فضای استفاده‌شده</p><p className="text-3xl font-bold">{formatFileSize(total)}</p><p className="text-xs opacity-80 mt-1">{messages.length} فایل</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const pct = total ? Math.round((s.bytes / total) * 100) : 0;
          return (
            <div key={s.key} className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}><Icon className="w-5 h-5 text-white" /></div>
                <div className="flex-1"><p className="font-medium text-sm">{s.label}</p><p className="text-xs text-gray-500">{s.count} فایل</p></div>
                <span className={`text-sm font-bold ${s.text}`}>{formatFileSize(s.bytes)}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }} /></div>
              <p className="text-[10px] text-gray-400 mt-1">{pct}% از کل</p>
            </div>
          );
        })}
      </div>
      {dups.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
          <p className="font-bold text-sm flex items-center gap-2 mb-3"><Copy className="w-4 h-4 text-amber-500" />فایل‌های تکراری ({dups.length} گروه)</p>
          <div className="space-y-1">{dups.slice(0, 8).map(([k, c]) => <p key={k} className="text-xs text-gray-500 truncate" dir="ltr">{k.split('|')[0]} × {c}</p>)}</div>
        </div>
      )}
    </div>
  );
}