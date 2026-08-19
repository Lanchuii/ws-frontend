import { AuthSession } from '../models/Auth';

const sessionKey = 'ws_auth_session';
export const authSessionChangedEvent = 'ws-auth-session-changed';

const notifySessionChanged = () => {
  window.dispatchEvent(new Event(authSessionChangedEvent));
};

export const getStoredSession = (): AuthSession | null => {
  const rawSession = localStorage.getItem(sessionKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    localStorage.removeItem(sessionKey);
    return null;
  }
};

export const setStoredSession = (session: AuthSession) => {
  localStorage.setItem(sessionKey, JSON.stringify(session));
  notifySessionChanged();
};

export const clearStoredSession = () => {
  localStorage.removeItem(sessionKey);
  notifySessionChanged();
};

export const getAccessToken = () => getStoredSession()?.accessToken;

export const getRefreshToken = () => getStoredSession()?.refreshToken;
