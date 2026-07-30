import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Open state for the design's mobile nav: locks body scroll while open, closes
 * on Escape and returns focus to the toggle, exactly like the design script.
 */
export function useMobileMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(value => !value), []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = event => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  return { open, close, toggle, toggleRef };
}
