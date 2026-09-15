import { AuthSession } from '../models/Auth';

const sessionKey = 'ws_auth_session';
export const authSessionChangedEvent = 'ws-auth-session-changed';
let memorySession: AuthSession | null = null;

const notifySessionChanged = () => {
  window.dispatchEvent(new Event(authSessionChangedEvent));
};

export const getStoredSession = (): AuthSession | null => {
  if (memorySession) return memorySession;
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
  memorySession = { ...session, refreshToken: undefined };
  localStorage.removeItem(sessionKey);
  notifySessionChanged();
};

export const clearStoredSession = () => {
  memorySession = null;
  localStorage.removeItem(sessionKey);
  notifySessionChanged();
};

export const getAccessToken = () => getStoredSession()?.accessToken;

export const getRefreshToken = () => getStoredSession()?.refreshToken;
