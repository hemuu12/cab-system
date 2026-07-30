/**
 * Single place that turns any transport failure into the shape the UI renders:
 * { status, message, data }. `message` is always human-readable.
 */
export const NETWORK_ERROR_MESSAGE = 'We could not reach WonderTravel. Check your internet connection and try again.';

const STATUS_MESSAGES = {
  400: 'Some information is incomplete or invalid. Please review it and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you requested.',
  409: 'Those details are already being used by another account.',
  429: 'Too many attempts. Please wait a moment and try again.'
};

export function friendlyError(status, serverMessage) {
  if (serverMessage) return serverMessage;
  return STATUS_MESSAGES[status] || 'Something went wrong on our side. Please try again shortly.';
}

export function normalizeError(error) {
  if (error?.normalized) return error;
  const status = error?.response?.status ?? 0;
  const data = error?.response?.data ?? null;
  const message = status
    ? friendlyError(status, typeof data?.message === 'string' ? data.message : '')
    : NETWORK_ERROR_MESSAGE;
  return { normalized: true, status, data, message };
}

/** Reads a message out of an RTK Query `error` object for rendering in a page. */
export const errorMessage = (error, fallback = '') => error?.data?.message || error?.message || fallback;
