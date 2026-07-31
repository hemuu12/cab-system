import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import BrandLogo from './BrandLogo.jsx';

export default function LoadingScreen({
  message = 'Preparing your journey…',
  detail = 'India, beautifully driven.',
  compact = false,
  overlay = false
}) {
  return <div
    className={`wonder-loading${compact ? ' compact' : ''}${overlay ? ' overlay' : ''}`}
    role="status"
    aria-live="polite"
    aria-label={message}
  >
    <div className="wonder-loading-glow" aria-hidden="true" />
    <div className="wonder-loading-content">
      <BrandLogo linked={false} className="wonder-loading-logo" />
      <div className="wonder-loading-mark" aria-hidden="true">
        <span className="wonder-loading-orbit" />
        <span className="wonder-loading-pin" />
        <span className="wonder-loading-road"><i /><i /><i /></span>
      </div>
      <p className="wonder-loading-message">{message}</p>
      <p className="wonder-loading-detail">{detail}</p>
      <div className="wonder-loading-progress" aria-hidden="true"><span /></div>
    </div>
  </div>;
}

export function LogoutTransition() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const begin = () => setActive(true);
    window.addEventListener('wondertravel:logout-start', begin);
    return () => window.removeEventListener('wondertravel:logout-start', begin);
  }, []);

  return <AnimatePresence>{active && <motion.div
    className="wonder-logout-layer"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: .28, ease: 'easeOut' }}
  >
    <LoadingScreen overlay message="Signing you out securely…" detail="See you on the next journey." />
  </motion.div>}</AnimatePresence>;
}
