import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: any) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { const el = document.getElementById('boot-error'); if (el) { el.style.display = 'block'; el.textContent = 'REACT ERROR: ' + error.message; } }
  render() {
    if (this.state.error) return <div style={{ padding: 20, direction: 'ltr', fontFamily: 'monospace', color: '#b91c1c' }}><h2>App crashed</h2><pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre></div>;
    return this.props.children;
  }
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false, staleTime: 30000 } } });

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode><QueryClientProvider client={queryClient}><ErrorBoundary><App /></ErrorBoundary></QueryClientProvider></React.StrictMode>
  );
  (window as any).__APP_OK__ = true;
  document.getElementById('boot-loading')?.remove();
  const e = document.getElementById('boot-error'); if (e) e.style.display = 'none';
} catch (e: any) {
  const el = document.getElementById('boot-error'); if (el) { el.style.display = 'block'; el.textContent = 'BOOT ERROR: ' + e.message; }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {}); });
}