'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { firstNameOf, initialsOf } from '../../lib/format.js';
import { IconChevronDownSmall, IconLogout, IconProfile, IconShield } from './icons.jsx';

/**
 * Desktop auth control in the design nav: a "Member login" ghost button when
 * signed out, and an avatar trigger with a dropdown when signed in.
 */
export default function NavProfile({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = event => { if (!wrapperRef.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  useEffect(() => { if (!user) setOpen(false); }, [user]);

  if (!user) return <Link className="btn btn-ghost" href="/login">Member login</Link>;

  const name = String(user.name || 'My account').trim();
  const initials = initialsOf(name) || firstNameOf(name).charAt(0).toUpperCase();

  return <span ref={wrapperRef} style={{ display: 'contents' }}>
    <button
      type="button"
      className="btn btn-ghost profile-trigger"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(value => !value)}
    >
      <span className="profile-avatar">{initials}</span>
      <span>{firstNameOf(name)}</span>
      <span className="profile-chevron"><IconChevronDownSmall /></span>
    </button>
    <div className={`profile-menu${open ? ' open' : ''}`} role="menu">
      <div className="profile-menu-user">
        <strong>{name}</strong>
        <small>{user.email || user.phone || 'WonderTravel member'}</small>
      </div>
      {user.role === 'admin' && <Link href="/admin" role="menuitem" onClick={() => setOpen(false)}><IconShield /><span>Admin dashboard</span></Link>}
      <Link href="/account" role="menuitem" onClick={() => setOpen(false)}><IconProfile /><span>My profile &amp; trips</span></Link>
      <button type="button" role="menuitem" onClick={() => { setOpen(false); onLogout(); }}><IconLogout /><span>Log out</span></button>
    </div>
  </span>;
}
