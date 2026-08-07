'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Download, PlusSquare, RefreshCw, Share, WifiOff, X } from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

const INSTALL_REMINDER_KEY = 'wondertravel-install-reminder-after';
const INSTALL_REMINDER_DELAY = 3 * 24 * 60 * 60 * 1000;

const installedDisplayMode = () =>
  typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  );

const iosDevice = () => typeof navigator !== 'undefined' && (
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
);

const installReminderAvailable = () => {
  if (typeof window === 'undefined') return false;
  try {
    return Date.now() >= Number(localStorage.getItem(INSTALL_REMINDER_KEY) || 0);
  } catch {
    return true;
  }
};

export default function PwaExperience() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showInstallReminder, setShowInstallReminder] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const registrationRef = useRef(null);
  const reloadingRef = useRef(false);

  // These read window/navigator/localStorage, which don't exist during SSR — the
  // server-rendered pass keeps the safe defaults above, then this effect syncs the
  // real client-only state right after mount.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setInstalled(installedDisplayMode());
      setShowInstallReminder(installReminderAvailable());
      setOnline(navigator.onLine);
      setIsIos(iosDevice());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const captureInstall = event => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const markInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowInstall(false);
      try { localStorage.removeItem(INSTALL_REMINDER_KEY); } catch { /* Storage may be unavailable. */ }
    };
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const syncDisplayMode = () => setInstalled(installedDisplayMode());
    window.addEventListener('beforeinstallprompt', captureInstall);
    window.addEventListener('appinstalled', markInstalled);
    displayMode.addEventListener?.('change', syncDisplayMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', captureInstall);
      window.removeEventListener('appinstalled', markInstalled);
      displayMode.removeEventListener?.('change', syncDisplayMode);
    };
  }, []);

  useEffect(() => {
    if (showInstallReminder) return undefined;

    let reminderAt = 0;
    try {
      reminderAt = Number(localStorage.getItem(INSTALL_REMINDER_KEY) || 0);
    } catch { /* Show the reminder on the next timer tick. */ }

    const remaining = reminderAt - Date.now();
    const timer = window.setTimeout(() => setShowInstallReminder(true), Math.max(0, remaining));
    return () => window.clearTimeout(timer);
  }, [showInstallReminder]);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !(process.env.NODE_ENV === 'production')) return undefined;
    let updateTimer;
    const watchRegistration = registration => {
      registrationRef.current = registration;
      if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
      updateTimer = window.setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    };
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then(watchRegistration).catch(() => {});
    const reloadForUpdate = () => {
      if (!reloadingRef.current) return;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', reloadForUpdate);
    return () => {
      if (updateTimer) window.clearInterval(updateTimer);
      navigator.serviceWorker.removeEventListener('controllerchange', reloadForUpdate);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setShowInstall(true);
      return;
    }
    setInstalling(true);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      try { localStorage.removeItem(INSTALL_REMINDER_KEY); } catch { /* Storage may be unavailable. */ }
    } else {
      remindLater();
    }
    setInstalling(false);
    setShowInstall(false);
  };

  const remindLater = () => {
    try {
      localStorage.setItem(INSTALL_REMINDER_KEY, String(Date.now() + INSTALL_REMINDER_DELAY));
    } catch { /* Storage may be unavailable. */ }
    setShowInstallReminder(false);
    setShowInstall(false);
  };

  const applyUpdate = () => {
    const worker = registrationRef.current?.waiting;
    if (!worker) return;
    reloadingRef.current = true;
    worker.postMessage({ type: 'SKIP_WAITING' });
  };

  const canOfferInstall = showInstallReminder && !installed && (Boolean(installPrompt) || isIos);

  return <>
    {!online && <div className="pwa-network-status" role="status"><WifiOff /> You’re offline. Previously opened pages remain available.</div>}

    {updateReady && <aside className="pwa-update" aria-live="polite">
      <img src="/branding/wondertravel-icon.png" alt="" />
      <div><b>WonderTravel is ready to update</b><span>Refresh once to use the latest version.</span></div>
      <button type="button" onClick={applyUpdate}><RefreshCw /> Update</button>
      <button type="button" className="pwa-close" aria-label="Dismiss update" onClick={() => setUpdateReady(false)}><X /></button>
    </aside>}

    {canOfferInstall && <button type="button" className="pwa-install-fab" onClick={() => setShowInstall(true)}>
      <img src="/branding/wondertravel-icon.png" alt="" />
      <span><small>Take WonderTravel with you</small><b>Install app</b></span>
      <Download />
    </button>}

    {showInstall && <div className="pwa-modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget) setShowInstall(false);
    }}>
      <section className="pwa-install-modal" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
        <button type="button" className="pwa-modal-close" aria-label="Close install dialog" onClick={() => setShowInstall(false)}><X /></button>
        <div className="pwa-app-icon"><img src="/branding/pwa-192.png" alt="WonderTravel app icon" /></div>
        <BrandLogo linked={false} className="pwa-modal-logo" />
        <h2 id="pwa-install-title">Your journeys, one tap away.</h2>
        <p>Install WonderTravel for quick booking access, a full-screen experience, and reliable access to previously opened pages when your connection drops.</p>
        <ul>
          <li><Check /> Launch from your home screen</li>
          <li><Check /> Faster return to bookings and trips</li>
          <li><Check /> Automatic app updates</li>
        </ul>
        {isIos && !installPrompt ? <div className="pwa-ios-steps">
          <b>Install on iPhone or iPad</b>
          <span><Share /> Tap Safari’s Share button</span>
          <span><PlusSquare /> Choose “Add to Home Screen”</span>
        </div> : <button type="button" className="pwa-install-primary" disabled={installing} onClick={install}>
          <Download /> {installing ? 'Opening installer…' : 'Install WonderTravel'}
        </button>}
        <button type="button" className="pwa-install-later" onClick={remindLater}>Maybe later</button>
      </section>
    </div>}
  </>;
}
