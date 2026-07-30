import { motion } from 'motion/react';

export default function PremiumCard({ children, className = '', interactive = false, delay = 0, as = 'section', ...props }) {
  const Component = motion[as] || motion.section;
  return <Component
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={interactive ? { y: -4, borderColor: 'rgba(216,182,120,.34)' } : undefined}
    transition={{ duration: .42, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-2xl border border-white/[.09] bg-charcoal/90 shadow-premium backdrop-blur-xl ${className}`}
    {...props}
  >{children}</Component>;
}
