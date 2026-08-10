import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UiProvider } from './store/ui';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import FileManager from './components/FileManager';
import FileUploader from './components/FileUploader';
import InstallPrompt from './components/InstallPrompt';
import OfflineBadge from './components/OfflineBadge';
import Toasts from './components/Toasts';
import InfoModal from './components/InfoModal';
import ShareModal from './components/ShareModal';
import SettingsModal from './components/SettingsModal';
import FloatingPlayer from './components/FloatingPlayer';
import { getMe, initClient } from './lib/telegram';
import { getSession, getApiCredentials } from './lib/storage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('saved-messages');
  const [showUploader, setShowUploader] = useState(false);

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: getMe, enabled: isAuthenticated, retry: false });

  useEffect(() => {
    const t = localStorage.getItem('theme') || 'system';
    const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    (async () => {
      const s = getSession(); const c = getApiCredentials();
      if (s && c) { try { await initClient(c); setIsAuthenticated(true); } catch {} }
      setChecking(false);
    })();
  }, []);

  return (
    <UiProvider>
      <OfflineBadge /><Toasts /><InfoModal /><ShareModal /><SettingsModal /><FloatingPlayer /><InstallPrompt />
      {checking ? (
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : !isAuthenticated ? (
        <AuthScreen onSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900" dir="rtl">
          <Sidebar currentFolder={currentFolder} onFolderChange={setCurrentFolder} user={user} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Toolbar currentFolder={currentFolder} onUploadClick={() => setShowUploader(true)} />
            <FileManager currentFolder={currentFolder} onUploadClick={() => setShowUploader(true)} />
          </div>
          <FileUploader isOpen={showUploader} onClose={() => setShowUploader(false)} />
        </div>
      )}
    </UiProvider>
  );
}

export default App;