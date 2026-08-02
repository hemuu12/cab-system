'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { selectToasts, toastDismissed } from '../store/slices/toastSlice.js';

const styles = {
  success: { icon: CheckCircle2, accent: 'text-success', border: 'border-success/35', glow: 'bg-success/10', progress: 'bg-success' },
  error: { icon: AlertCircle, accent: 'text-ember-light', border: 'border-ember/40', glow: 'bg-ember/10', progress: 'bg-ember-light' },
  info: { icon: Info, accent: 'text-champagne', border: 'border-champagne/35', glow: 'bg-champagne/10', progress: 'bg-champagne' }
};

const TOAST_DURATION = { success: 3200, info: 3800, error: 4800 };
const durationFor = type => TOAST_DURATION[type] || TOAST_DURATION.info;

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
      }, durationFor(toast.type));
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

  return <div className="pointer-events-none fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-[300] flex w-[calc(100%-24px)] max-w-[440px] -translate-x-1/2 flex-col gap-3 sm:bottom-[calc(24px+env(safe-area-inset-bottom))] sm:left-auto sm:right-6 sm:w-[410px] sm:translate-x-0" aria-live="polite" aria-atomic="true">
    {toasts.map(toast => {
      const theme = styles[toast.type] || styles.info;
      const Icon = theme.icon;
      const duration = durationFor(toast.type);
      return <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} className={`toast-card pointer-events-auto relative overflow-hidden rounded-[20px] border ${theme.border} bg-[linear-gradient(135deg,rgba(20,28,37,.98),rgba(13,19,26,.97))] p-4 shadow-[0_22px_65px_rgba(0,0,0,.52)] ring-1 ring-white/[.035] backdrop-blur-xl sm:p-[18px]`}>
        <div className="flex items-start gap-3.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ring-1 ring-inset ring-white/[.05] ${theme.glow} ${theme.accent}`}><Icon size={19}/></div>
          <div className="min-w-0 flex-1 py-0.5 pr-1"><strong className="block text-[14px] font-bold leading-[1.35] tracking-[-.01em] text-ivory">{toast.title}</strong><p className="mb-0 mt-1 text-[12.5px] leading-[1.55] text-mist">{toast.message}</p></div>
          <button type="button" className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-slate-muted transition duration-200 hover:bg-white/[.07] hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne" onClick={() => dispatch(toastDismissed(toast.id))} aria-label="Dismiss notification"><X size={17}/></button>
        </div>
        <div className={`toast-progress absolute inset-x-0 bottom-0 h-[3px] origin-left ${theme.progress}`} style={{ animationDuration: `${duration}ms` }}/>
      </div>;
    })}
  </div>;
}
