'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BellRing, CheckCheck, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { requestJson } from '../../api/httpClient.js';
import { baseApi, TAGS } from '../../store/api/baseApi.js';
import {
  useAdminActivityQuery,
  useAdminPushConfigQuery,
  useAdminSubscribePushMutation,
  useAdminUnsubscribePushMutation
} from '../../store/api/adminApi.js';
import { useToast } from '../../hooks/useToast.js';

const TAGS_BY_TYPE = {
  booking: [TAGS.AdminBooking, TAGS.Booking],
  inquiry: [TAGS.AdminInquiry, TAGS.Inquiry],
  feedback: [TAGS.AdminFeedback, TAGS.Feedback],
  user: [TAGS.AdminUser]
};
const BACKGROUND_BODY = {
  booking: 'A booking update is ready for review.',
  inquiry: 'A new customer inquiry is ready for review.',
  feedback: 'A new guest review is waiting for moderation.',
  user: 'A new customer account was created.'
};

const storageKey = user => `wondertravel:admin-notifications:${user?.id || user?._id || user?.email}`;
const relativeTime = value => {
  const seconds = Math.max(0, Math.round((Date.now() - Number(new Date(value))) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const applicationServerKey = value => {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
};

export default function AdminNotifications({ user, onOpenSection }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false);
  const [incoming, setIncoming] = useState([]);
  const [deviceSubscribed, setDeviceSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [lastReadAt, setLastReadAt] = useState(() => {
    if (typeof window === 'undefined') return new Date().toISOString();
    return localStorage.getItem(storageKey(user)) || new Date(0).toISOString();
  });
  const wrapperRef = useRef(null);
  const { data } = useAdminActivityQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true
  });
  const { data: pushConfig } = useAdminPushConfigQuery();
  const [subscribePush] = useAdminSubscribePushMutation();
  const [unsubscribePush] = useAdminUnsubscribePushMutation();

  const activities = useMemo(() => {
    const unique = new Map();
    [...incoming, ...(data?.activity || [])].forEach(item => unique.set(item.id, item));
    return [...unique.values()]
      .sort((left, right) => Number(new Date(right.at)) - Number(new Date(left.at)))
      .slice(0, 20);
  }, [data, incoming]);
  const unread = activities.filter(item => Number(new Date(item.at)) > Number(new Date(lastReadAt))).length;

  useEffect(() => {
    if (!open) return undefined;
    const close = event => { if (!wrapperRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return undefined;
    let cancelled = false;
    navigator.serviceWorker.ready
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => { if (!cancelled) setDeviceSubscribed(Boolean(subscription)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!data?.realtime) return undefined;
    let cancelled = false;
    let realtime;
    let channels = [];

    import('ably').then(Ably => {
      if (cancelled) return;
      realtime = new Ably.Realtime({
        authCallback: async (_params, callback) => {
          try {
            callback(null, await requestJson({ url: '/admin/realtime-token', method: 'POST', skipErrorToast: true }));
          } catch (error) { callback(error, null); }
        }
      });
      realtime.connection.on(state => setLive(state.current === 'connected'));
      const receive = message => {
        const item = message.data;
        if (!item?.id) return;
        setIncoming(current => [item, ...current.filter(entry => entry.id !== item.id)].slice(0, 20));
        const resourceTags = (TAGS_BY_TYPE[item.type] || []).flatMap(type => [{ type, id: 'LIST' }]);
        dispatch(baseApi.util.invalidateTags([TAGS.AdminDashboard, TAGS.AdminActivity, ...resourceTags]));
        toast.info(item.message, item.title);
        if (!deviceSubscribed && 'Notification' in window && document.hidden && Notification.permission === 'granted') {
          new Notification(item.title, { body: BACKGROUND_BODY[item.type] || 'New customer activity is ready for review.', icon: '/branding/pwa-192.png', tag: item.id });
        }
      };
      const sections = (user?.adminSections || [])
        .filter(section => !['dashboard', 'audit'].includes(section));
      channels = sections.map(section => realtime.channels.get(`wondertravel:admin-activity:${section}`));
      channels.forEach(channel => channel.subscribe('activity', receive));
    }).catch(() => setLive(false));

    return () => {
      cancelled = true;
      channels.forEach(channel => channel.unsubscribe());
      if (realtime) realtime.close();
    };
  }, [data?.realtime, deviceSubscribed, dispatch, toast, user?.adminSections]);

  const markRead = () => {
    const value = new Date().toISOString();
    setLastReadAt(value);
    localStorage.setItem(storageKey(user), value);
  };
  const toggle = () => {
    setOpen(value => !value);
    if (!open) markRead();
  };
  const enableMobilePush = async () => {
    if (!pushConfig?.publicKey || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
    setPushBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.info('Allow notifications in your phone settings to receive admin alerts.', 'Notifications not enabled');
        return;
      }
      // navigator.serviceWorker.ready never resolves if no SW registration ever completes
      // (flaky mobile networks, dev builds) — without a timeout the button hangs on
      // "Saving…" forever instead of failing visibly.
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => window.setTimeout(() => reject(new Error('sw-timeout')), 8000))
      ]);
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey(pushConfig.publicKey)
      });
      await subscribePush({
        subscription: subscription.toJSON(),
        device: {
          locale: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }).unwrap();
      setDeviceSubscribed(true);
      toast.success('This phone will receive admin alerts even when the PWA is closed.', 'Mobile alerts enabled');
    } catch {
      toast.error('Could not enable mobile alerts on this device. Install the PWA and try again.', 'Push setup failed');
    } finally { setPushBusy(false); }
  };
  const disableMobilePush = async () => {
    setPushBusy(true);
    try {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => window.setTimeout(() => reject(new Error('sw-timeout')), 8000))
      ]);
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribePush(subscription.endpoint).unwrap();
        await subscription.unsubscribe();
      }
      setDeviceSubscribed(false);
      if (navigator.clearAppBadge) await navigator.clearAppBadge();
      toast.success('This phone will no longer receive admin push alerts.', 'Mobile alerts disabled');
    } catch {
      toast.error('Could not disable alerts. Please try again.', 'Push settings not saved');
    } finally { setPushBusy(false); }
  };

  return <div className="admin-notifications" ref={wrapperRef}>
    <button className="admin-notification-trigger" type="button" onClick={toggle} aria-label={`${unread} unread admin notifications`} aria-expanded={open}>
      {unread ? <BellRing /> : <Bell />}{unread > 0 && <b>{Math.min(99, unread)}</b>}
    </button>
    {open && <section className="admin-notification-panel">
      <header><div><strong>Live activity</strong><small className={live ? 'connected' : ''}>{live ? <><Wifi /> Connected</> : <><WifiOff /> 15-second backup sync</>}</small></div><button type="button" onClick={markRead}><CheckCheck /> Mark read</button></header>
      {pushConfig?.enabled && typeof window !== 'undefined' && 'PushManager' in window && <button className={`admin-enable-alerts${deviceSubscribed ? ' enabled' : ''}`} disabled={pushBusy} type="button" onClick={deviceSubscribed ? disableMobilePush : enableMobilePush}><Smartphone /> {pushBusy ? 'Saving…' : deviceSubscribed ? 'Mobile alerts on · Turn off' : 'Enable mobile alerts'}</button>}
      <div className="admin-notification-list">
        {activities.length ? activities.map(item => <button key={item.id} type="button" onClick={() => { onOpenSection(item.section); setOpen(false); }}>
          <span className={`admin-notification-dot type-${item.type}`} />
          <span><strong>{item.title}</strong><small>{item.message}</small><time>{relativeTime(item.at)}</time></span>
        </button>) : <p>No customer activity yet.</p>}
      </div>
    </section>}
  </div>;
}
