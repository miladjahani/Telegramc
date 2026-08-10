import { X, Music } from 'lucide-react';
import { useUi } from '../store/ui';

export default function FloatingPlayer() {
  const { nowPlaying, setNowPlaying } = useUi();
  if (!nowPlaying) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 sm:right-auto sm:w-96 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center"><Music className="w-4 h-4 text-white" /></div>
        <p className="flex-1 text-xs font-medium truncate" dir="ltr">{nowPlaying.name}</p>
        <button onClick={() => setNowPlaying(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-4 h-4 text-gray-400" /></button>
      </div>
      <audio src={nowPlaying.url} controls autoPlay className="w-full h-9" />
    </div>
  );
}