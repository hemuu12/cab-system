'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function PageTransition({ children }) {
  const reduced = useReducedMotion();
  return <motion.div
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: 'blur(4px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
    transition={{ duration: reduced ? .15 : .38, ease: [0.22, 1, 0.36, 1] }}
  >{children}</motion.div>;
}
