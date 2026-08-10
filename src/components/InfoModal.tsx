import { X, Info } from 'lucide-react';
import { useUi } from '../store/ui';
import { getFileName, getFileSize, getFileCategory } from '../lib/fileUtils';
import { formatFileSize, formatDate } from '../lib/formatters';

export default function InfoModal() {
  const { infoFile, setInfoFile, starred } = useUi();
  if (!infoFile) return null;
  const rows = [
    ['نام', getFileName(infoFile)], ['نوع', getFileCategory(infoFile)], ['اندازه', formatFileSize(getFileSize(infoFile))],
    ['تاریخ', formatDate(infoFile.date)], ['شناسه', String(infoFile.id)], ['MIME', infoFile.document?.mimeType || '—'],
    ['ستاره‌دار', starred.has(infoFile.id) ? 'بله ⭐' : 'خیر'],
  ];
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setInfoFile(null)}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="font-bold flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" />اطلاعات فایل</h3>
          <button onClick={() => setInfoFile(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          {rows.map(([k, v]) => <div key={k as string} className="flex justify-between text-sm gap-4"><span className="text-gray-500">{k}</span><span className="font-medium truncate" dir="ltr">{v}</span></div>)}
        </div>
      </div>
    </div>
  );
}