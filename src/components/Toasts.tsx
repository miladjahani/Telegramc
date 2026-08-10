import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUi } from '../store/ui';

export default function Toasts() {
  const { toasts } = useUi();
  return (
    <div className="fixed bottom-4 left-4 z-[9999] space-y-2 w-72">
      <AnimatePresence>
        {toasts.map((t: any) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm text-white ${t.type === 'success' ? 'bg-green-600/90' : t.type === 'error' ? 'bg-red-600/90' : 'bg-gray-800/90'}`}>
            {t.type === 'success' ? <CheckCircle className="w-4 h-4" /> : t.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            <span className="truncate">{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}