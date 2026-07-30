/**
 * In-memory access token holder.
 *
 * The refresh token lives in an httpOnly cookie handled by the server, so the
 * access token is deliberately kept out of localStorage. Subscribers let the
 * redux auth slice mirror the token without importing the store here (which
 * would create a cycle: store -> api -> tokenStore -> store).
 */
let accessToken = '';
const subscribers = new Set();

export const getAccessToken = () => accessToken;

export function setAccessToken(token = '') {
  if (accessToken === token) return token;
  accessToken = token;
  subscribers.forEach(listener => listener(accessToken));
  return accessToken;
}

export function clearAccessToken() {
  return setAccessToken('');
}

export function subscribeToAccessToken(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}
