import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { selectToasts, toastDismissed } from '../store/slices/toastSlice.js';

const styles = {
  success: { icon: CheckCircle2, accent: 'text-success', border: 'border-success/35', glow: 'bg-success/10' },
  error: { icon: AlertCircle, accent: 'text-ember-light', border: 'border-ember/40', glow: 'bg-ember/10' },
  info: { icon: Info, accent: 'text-champagne', border: 'border-champagne/35', glow: 'bg-champagne/10' }
};

export default function Toaster() {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();
  const timers = useRef(new Map());

  useEffect(() => {
    toasts.forEach(toast => {
      if (timers.current.has(toast.id)) return;
      const timer = window.setTimeout(() => {
        timers.current.delete(toast.id);
        dispatch(toastDismissed(toast.id));
      }, toast.type === 'error' ? 6500 : 4500);
      timers.current.set(toast.id, timer);
    });
    // Drop timers for toasts dismissed early so the map cannot grow unbounded.
    const live = new Set(toasts.map(toast => toast.id));
    timers.current.forEach((timer, id) => {
      if (live.has(id)) return;
      window.clearTimeout(timer);
      timers.current.delete(id);
    });
  }, [dispatch, toasts]);

  useEffect(() => {
    const pending = timers.current;
    return () => { pending.forEach(window.clearTimeout); pending.clear(); };
  }, []);

  // Desktop toasts clear the fixed site header (up to 84px tall) so they never
  // sit on top of the navigation controls.
  return <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[300] flex flex-col gap-3 sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-24 sm:w-[380px]" aria-live="polite" aria-atomic="true">
    <AnimatePresence initial={false}>{toasts.map(toast => {
      const theme = styles[toast.type] || styles.info;
      const Icon = theme.icon;
      return <motion.div key={toast.id} layout initial={{ opacity: 0, y: -14, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 28, scale: .96 }} className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${theme.border} bg-[#141b24]/95 p-4 shadow-premium backdrop-blur-xl`}>
        <div className={`absolute inset-y-0 left-0 w-1 ${theme.glow}`}/><div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-full p-1.5 ${theme.glow} ${theme.accent}`}><Icon size={18}/></div>
          <div className="min-w-0 flex-1"><strong className="block text-sm text-ivory">{toast.title}</strong><p className="mb-0 mt-1 text-xs leading-relaxed text-mist">{toast.message}</p></div>
          <button type="button" className="rounded-lg p-1 text-slate-muted transition hover:bg-white/5 hover:text-ivory" onClick={() => dispatch(toastDismissed(toast.id))} aria-label="Dismiss notification"><X size={16}/></button>
        </div>
      </motion.div>;
    })}</AnimatePresence>
  </div>;
}
