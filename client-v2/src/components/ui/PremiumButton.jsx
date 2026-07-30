import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const styles = {
  primary: 'bg-gradient-to-br from-ember to-ember-light text-[#1b0d05] shadow-[0_16px_38px_-16px_rgba(242,107,29,.85)]',
  gold: 'bg-gradient-to-br from-champagne to-champagne-deep text-[#1a1309] shadow-[0_16px_36px_-18px_rgba(216,182,120,.8)]',
  ghost: 'border border-white/15 bg-white/[.025] text-ivory backdrop-blur hover:border-champagne/60 hover:text-champagne',
  muted: 'border border-white/10 bg-white/[.04] text-mist'
};

export default function PremiumButton({ variant = 'primary', className = '', to, children, disabled, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`;
  const motionProps = { whileHover: disabled ? undefined : { y: -2, scale: 1.015 }, whileTap: disabled ? undefined : { scale: .975 }, transition: { type: 'spring', stiffness: 420, damping: 28 } };
  if (to) return <motion.div {...motionProps} className="inline-flex"><Link className={classes} to={to} {...props}>{children}</Link></motion.div>;
  return <motion.button {...motionProps} className={classes} disabled={disabled} {...props}>{children}</motion.button>;
}
