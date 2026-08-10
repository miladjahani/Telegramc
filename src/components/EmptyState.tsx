import { Cloud, FolderOpen, Search, Star, Trash2, Upload } from 'lucide-react';

const CFG: any = {
  folder: { icon: FolderOpen, t: 'این پوشه خالی است', d: 'فایلی آپلود کنید', c: 'text-blue-500' },
  search: { icon: Search, t: 'نتیجه‌ای یافت نشد', d: 'عبارت دیگری جستجو کنید', c: 'text-gray-400' },
  starred: { icon: Star, t: 'ستاره‌دار ندارید', d: 'فایل‌ها را ستاره‌دار کنید', c: 'text-yellow-500' },
  trash: { icon: Trash2, t: 'سطل زباله خالی است', d: 'فایل‌های حذف‌شده اینجا هستند', c: 'text-gray-400' },
  default: { icon: Cloud, t: 'فایلی ندارید', d: 'اولین فایل را آپلود کنید', c: 'text-blue-500' },
};

export default function EmptyState({ type = 'default', action }: { type?: string; action?: { label: string; onClick: () => void } }) {
  const c = CFG[type]; const Icon = c.icon;
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-4">
      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 bg-gray-100 dark:bg-gray-800 ${c.c}`}><Icon className="w-12 h-12" /></div>
      <h3 className="text-xl font-bold mb-2">{c.t}</h3>
      <p className="text-sm text-gray-500 mb-6">{c.d}</p>
      {action && <button onClick={action.onClick} className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"><Upload className="w-5 h-5" />{action.label}</button>}
    </div>
  );
}