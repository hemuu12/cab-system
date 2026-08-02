'use client';

import { ChevronDown, LayoutDashboard, LogOut, Menu, Settings, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth.js';
import { firstNameOf, initialsOf } from '../lib/format.js';
import BrandLogo from './BrandLogo.jsx';
import { smoothLogout } from '../lib/smoothLogout.js';

const headerMotion = { initial: { opacity: 0, y: -14 }, animate: { opacity: 1, y: 0 }, transition: { duration: .38, ease: [0.22, 1, 0.36, 1] } };

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => { setOpen(false); setProfileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') { setOpen(false); setProfileOpen(false); } };
    const closeProfile = event => { if (!event.target.closest('[data-profile-menu]')) setProfileOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('click', closeProfile);
    return () => { window.removeEventListener('keydown', closeOnEscape); window.removeEventListener('click', closeProfile); };
  }, []);

  const signOut = async () => {
    setOpen(false);
    setProfileOpen(false);
    await smoothLogout(logout);
  };

  return <motion.header {...headerMotion} className="site-header">
    <div className="container nav-inner">
      <BrandLogo className="header-brand" onClick={() => setOpen(false)} />
      <button className="menu-btn" type="button" onClick={() => setOpen(value => !value)} aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="site-navigation">{open ? <X /> : <Menu />}</button>
      <nav id="site-navigation" className={open ? 'nav-links open' : 'nav-links'}>
        <Link className={pathname === '/' ? 'active' : ''} href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link className={pathname === '/intercity-cab-guide' ? 'active' : ''} href="/intercity-cab-guide" onClick={() => setOpen(false)}>Travel guide</Link>
        <a href="/#fleet" onClick={() => setOpen(false)}>Vehicles</a>
        <a href="/#stories" onClick={() => setOpen(false)}>Guest stories</a>
        <a href="/#partner" onClick={() => setOpen(false)}>Drive with us</a>
        <Link className={pathname === '/help' ? 'active' : ''} href="/help" onClick={() => setOpen(false)}>Help</Link>
        <div className="nav-mobile-actions">
          {user ? <>
            {user.role === 'admin' && <Link className="mobile-account-link" href="/admin" onClick={() => setOpen(false)}><LayoutDashboard /> Admin dashboard</Link>}
            <Link className="mobile-account-link" href="/account" onClick={() => setOpen(false)}>{user.name} · Account</Link>
            {pathname === '/account' && <Link href="/account?section=preferences" onClick={() => setOpen(false)}><Settings /> Preferences</Link>}
            <button type="button" className="mobile-logout-button" onClick={signOut}><LogOut /> Log out</button>
          </> : <Link className="mobile-account-link" href="/login" onClick={() => setOpen(false)}>Member login</Link>}
          <Link className="mobile-book-link" href="/#book" onClick={() => setOpen(false)}>Plan a journey</Link>
        </div>
      </nav>
      <div className="nav-auth-desktop">
        {user ? <div className="relative" data-profile-menu>
          <button type="button" className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[.025] py-1.5 pl-1.5 pr-3 text-sm font-bold text-ivory transition hover:border-champagne/60" onClick={() => setProfileOpen(value => !value)} aria-haspopup="menu" aria-expanded={profileOpen}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-ember text-xs font-extrabold text-[#1a1209]">{initialsOf(user.name)}</span>
            <span>{firstNameOf(user.name)}</span><ChevronDown size={15} className={`text-slate-muted transition ${profileOpen ? 'rotate-180' : ''}`}/>
          </button>
          <AnimatePresence>{profileOpen && <motion.div role="menu" initial={{ opacity: 0, y: -8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: .98 }} className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-2xl border border-white/15 bg-charcoal/95 p-2 shadow-premium backdrop-blur-xl">
            <div className="border-b border-white/10 px-3 py-2.5"><strong className="block truncate text-xs text-ivory">{user.name}</strong><span className="block truncate text-[10px] text-slate-muted">{user.email}</span></div>
            {user.role === 'admin' && <Link role="menuitem" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-champagne transition hover:bg-champagne/10 hover:text-ivory" href="/admin" onClick={() => setProfileOpen(false)}><LayoutDashboard size={16}/> Admin dashboard</Link>}
            <Link role="menuitem" className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-mist transition hover:bg-champagne/10 hover:text-ivory" href="/account" onClick={() => setProfileOpen(false)}><UserRound size={16}/> My profile & trips</Link>
            <button role="menuitem" className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#ff9c79] transition hover:bg-ember/10" onClick={signOut}><LogOut size={16}/> Log out</button>
          </motion.div>}</AnimatePresence>
        </div> : <Link className="button button-ghost" href="/login">Member login</Link>}
        <Link className="button button-gold nav-book" href="/#book">Plan a journey</Link>
      </div>
    </div>
  </motion.header>;
}
