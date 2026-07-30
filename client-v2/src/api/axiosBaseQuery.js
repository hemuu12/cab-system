import { httpClient } from './httpClient.js';
import { normalizeError } from './errors.js';

/**
 * RTK Query base query backed by the shared axios instance, so every endpoint
 * inherits the auth header, the 401 refresh-and-retry, and error normalization.
 *
 * Endpoint `query` functions return either a string path or:
 *   { url, method, body, params, headers, skipErrorToast, responseType }
 */
export const axiosBaseQuery = () => async (args, api) => {
  const config = typeof args === 'string' ? { url: args } : args;
  const { url, method = 'GET', body, data, params, headers, skipErrorToast, ...rest } = config;
  try {
    const response = await httpClient({
      url,
      method,
      data: body ?? data,
      params,
      headers,
      skipErrorToast,
      signal: api?.signal,
      ...rest
    });
    return { data: response.data };
  } catch (error) {
    const normalized = normalizeError(error);
    return { error: { status: normalized.status, data: normalized.data, message: normalized.message } };
  }
};
