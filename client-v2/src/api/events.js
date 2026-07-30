/**
 * Cross-cutting browser events used by the API layer to talk to the UI without
 * importing React or the redux store (keeps the interceptor framework-agnostic).
 */
export const APP_EVENTS = {
  toast: 'wondertravel:toast',
  sessionExpired: 'wondertravel:session-expired',
  settings: 'meridian:settings'
};

const canDispatch = () => typeof window !== 'undefined';

export function emitToast({ type = 'info', title = 'We could not complete that', message }) {
  if (!canDispatch() || !message) return;
  window.dispatchEvent(new CustomEvent(APP_EVENTS.toast, { detail: { type, title, message } }));
}

export function emitSessionExpired() {
  if (!canDispatch()) return;
  window.dispatchEvent(new Event(APP_EVENTS.sessionExpired));
}

export function onAppEvent(name, handler) {
  if (!canDispatch()) return () => {};
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}
