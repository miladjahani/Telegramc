import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, ChevronDown } from 'lucide-react';
import { getMessages, deleteMessages } from '../lib/telegram';
import { getFileName, getFileSize } from '../lib/fileUtils';
import { formatDate } from '../lib/formatters';
import { useUi } from '../store/ui';
import FileGrid from './FileGrid';
import FilePreview from './FilePreview';
import EmptyState from './EmptyState';
import StatsPanel from './StatsPanel';
import type { Api } from 'telegram';

export default function FileManager({ currentFolder, onUploadClick }: { currentFolder: string; onUploadClick: () => void }) {
  const { view, search, sortBy, sortOrder, starred, trash, restoreFile, toast, channel } = useUi();
  const qc = useQueryClient();
  const [preview, setPreview] = useState<Api.Message | null>(null);
  const [limit, setLimit] = useState(200);

  const entity = channel ? channel.entity : currentFolder;
  const { data, isLoading, error } = useQuery({ queryKey: ['messages', entity, limit], queryFn: () => getMessages(entity, limit) });

  const all = (data || []).filter((m) => m.media);

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="flex-1 flex items-center justify-center text-center p-4"><div><p className="text-red-500">خطا در بارگذاری</p><p className="text-sm text-gray-500 mt-1" dir="ltr">{(error as Error).message}</p></div></div>;

  if (view === 'stats') return <div className="flex-1 overflow-auto"><StatsPanel messages={all} /></div>;

  if (view === 'trash') {
    const trashed = all.filter((f) => trash.has(f.id));
    return (
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {trashed.length === 0 ? <EmptyState type="trash" /> : trashed.map((f) => (
          <div key={f.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700">
            <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" dir="ltr" style={{ textAlign: 'left' }}>{getFileName(f)}</p>
              <p className="text-[10px] text-gray-400">{formatDate(f.date)}</p>
            </div>
            <button onClick={() => { restoreFile(f.id); toast('بازگردانی شد ♻️', 'success'); }} className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg">بازگردانی</button>
            <button onClick={async () => { if (!confirm('حذف دائمی؟ غیرقابل بازگشت!')) return; try { await deleteMessages('me', [f.id]); restoreFile(f.id); qc.invalidateQueries({ queryKey: ['messages'] }); toast('برای همیشه حذف شد', 'success'); } catch { toast('خطا', 'error'); } }} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg">حذف دائمی</button>
          </div>
        ))}
      </div>
    );
  }

  let files = all.filter((f) => !trash.has(f.id));
  if (view === 'starred') files = files.filter((f) => starred.has(f.id));
  if (search) files = files.filter((f) => getFileName(f).toLowerCase().includes(search.toLowerCase()));
  files = [...files].sort((a, b) => {
    let c = 0;
    if (sortBy === 'date') c = a.date - b.date;
    if (sortBy === 'name') c = getFileName(a).localeCompare(getFileName(b));
    if (sortBy === 'size') c = getFileSize(a) - getFileSize(b);
    return sortOrder === 'asc' ? c : -c;
  });
  if (view === 'recent') files = files.slice(0, 60);

  return (
    <div className="flex-1 overflow-auto relative">
      {files.length === 0 ? (
        <EmptyState type={view === 'starred' ? 'starred' : search ? 'search' : 'folder'} action={search ? undefined : { label: 'آپلود فایل', onClick: onUploadClick }} />
      ) : (
        <>
          <FileGrid messages={files} onFileOpen={setPreview} />
          {all.length >= limit && (
            <div className="p-4 text-center">
              <button onClick={() => setLimit((l) => l + 200)} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
                <ChevronDown className="w-4 h-4" /> بارگذاری بیشتر
              </button>
            </div>
          )}
        </>
      )}
      {preview && <FilePreview message={preview} isOpen={true} onClose={() => setPreview(null)} />}
    </div>
  );
}