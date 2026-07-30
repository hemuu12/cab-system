import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi.js';
import authReducer, { accessTokenChanged, sessionCleared } from './slices/authSlice.js';
import toastReducer, { toastShown } from './slices/toastSlice.js';
import accountReducer from './slices/accountSlice.js';
import { persistAccountMiddleware } from './middleware/persistAccount.js';
import { subscribeToAccessToken } from '../api/tokenStore.js';
import { APP_EVENTS, onAppEvent } from '../api/events.js';

// Endpoint slices self-register on the base API via injectEndpoints.
import './api/authApi.js';
import './api/catalogApi.js';
import './api/bookingApi.js';
import './api/adminApi.js';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    toast: toastReducer,
    account: accountReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    // FormData uploads travel through mutation args and are not serializable.
    serializableCheck: { ignoredActionPaths: ['meta.arg', 'payload.file'] }
  }).prepend(persistAccountMiddleware.middleware).concat(baseApi.middleware)
});

setupListeners(store.dispatch);

/* Bridge the framework-agnostic API layer into redux. */
subscribeToAccessToken(token => store.dispatch(accessTokenChanged(token)));

onAppEvent(APP_EVENTS.sessionExpired, () => {
  store.dispatch(sessionCleared());
  store.dispatch(baseApi.util.resetApiState());
});

onAppEvent(APP_EVENTS.toast, event => {
  const { message, type, title } = event.detail || {};
  if (message) store.dispatch(toastShown({ message, type, title }));
});

if (typeof window !== 'undefined') {
  // The exact-design pages run inside the same origin and post messages up.
  window.addEventListener('message', event => {
    if (event.origin !== window.location.origin) return;
    const data = event.data || {};
    if (data.type === APP_EVENTS.toast && data.message) {
      store.dispatch(toastShown({ message: data.message, type: data.level, title: data.title }));
    }
  });
}
