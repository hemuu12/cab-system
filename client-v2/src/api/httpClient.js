import axios from 'axios';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore.js';
import { emitSessionExpired, emitToast } from './events.js';
import { normalizeError } from './errors.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Paths that must never trigger a refresh-and-retry cycle (they *are* the cycle). */
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/logout-all'];
/** Failures on these paths are expected while probing an anonymous session, so they stay silent. */
const SILENT_PATHS = ['/auth/refresh', '/auth/me'];

const startsWithAny = (path = '', list) => list.some(entry => path === entry || path.startsWith(`${entry}/`));

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { Accept: 'application/json' }
});

/* ------------------------------------------------------------------ *
 * Request interceptor: auth header + content type
 * ------------------------------------------------------------------ */
httpClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Let the browser set the multipart boundary for FormData bodies.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) delete config.headers['Content-Type'];
  else if (config.data !== undefined) config.headers['Content-Type'] = 'application/json';
  return config;
});

/* ------------------------------------------------------------------ *
 * Refresh: single-flight so N parallel 401s cause exactly one refresh
 * ------------------------------------------------------------------ */
let refreshPromise = null;

async function performRefresh() {
  try {
    const { data } = await httpClient.post('/auth/refresh', undefined, { skipAuthRefresh: true });
    setAccessToken(data?.accessToken || '');
    return data;
  } catch {
    clearAccessToken();
    emitSessionExpired();
    return null;
  }
}

export function refreshSession() {
  if (!refreshPromise) refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

/* ------------------------------------------------------------------ *
 * Response interceptor: 401 refresh-and-retry, then error normalization
 * ------------------------------------------------------------------ */
httpClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error?.config;
    const path = config?.url || '';
    const status = error?.response?.status;
    const retryable = status === 401 && config && !config._retried && !config.skipAuthRefresh && !startsWithAny(path, AUTH_PATHS);

    if (retryable) {
      config._retried = true;
      const session = await refreshSession();
      if (session) return httpClient(config);
    }

    const normalized = normalizeError(error);
    if (!config?.skipErrorToast && !startsWithAny(path, SILENT_PATHS)) {
      emitToast({ type: 'error', message: normalized.message });
    }
    return Promise.reject(normalized);
  }
);

/** Thin promise helper for the rare call made outside RTK Query. */
export async function requestJson(config) {
  const response = await httpClient(config);
  return response.data;
}
