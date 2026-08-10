import React, { createContext, useContext, useState, useCallback } from 'react';

const UiContext = createContext<any>(null);
export const useUi = () => useContext(UiContext);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [view, setView] = useState<'files' | 'recent' | 'starred' | 'trash' | 'stats'>('files');
  const [viewMode, setViewModeState] = useState<'grid' | 'list'>(() => (localStorage.getItem('tg_viewmode') as any) || 'grid');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [cardSize, setCardSizeState] = useState(() => Number(localStorage.getItem('tg_cardsize')) || 100);
  const [starred, setStarred] = useState<Set<number>>(() => new Set(JSON.parse(localStorage.getItem('tg_starred') || '[]')));
  const [trash, setTrash] = useState<Set<number>>(() => new Set(JSON.parse(localStorage.getItem('tg_trash') || '[]')));
  const [toasts, setToasts] = useState<any[]>([]);
  const [infoFile, setInfoFile] = useState<any>(null);
  const [shareFile, setShareFile] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);

  const persist = (k: string, s: Set<number>) => localStorage.setItem(k, JSON.stringify(Array.from(s)));
  const toggleStar = useCallback((id: number) => setStarred((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); persist('tg_starred', n); return n; }), []);
  const trashFile = useCallback((id: number) => setTrash((p) => { const n = new Set(p); n.add(id); persist('tg_trash', n); return n; }), []);
  const restoreFile = useCallback((id: number) => setTrash((p) => { const n = new Set(p); n.delete(id); persist('tg_trash', n); return n; }), []);
  const toast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, text, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);
  const setCardSize = (v: number) => { setCardSizeState(v); localStorage.setItem('tg_cardsize', String(v)); };
  const setViewMode = (v: 'grid' | 'list') => { setViewModeState(v); localStorage.setItem('tg_viewmode', v); };

  return (
    <UiContext.Provider value={{
      sidebarOpen, setSidebarOpen, view, setView, viewMode, setViewMode, search, setSearch,
      sortBy, setSortBy, sortOrder, setSortOrder, cardSize, setCardSize, starred, toggleStar,
      trash, trashFile, restoreFile, toasts, toast, infoFile, setInfoFile, shareFile, setShareFile,
      settingsOpen, setSettingsOpen, nowPlaying, setNowPlaying, channel, setChannel,
    }}>
      {children}
    </UiContext.Provider>
  );
}