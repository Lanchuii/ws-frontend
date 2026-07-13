import { AuthSession } from '../models/Auth';

const sessionKey = 'ws_auth_session';

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
};

export const clearStoredSession = () => {
  localStorage.removeItem(sessionKey);
};

export const getAccessToken = () => getStoredSession()?.accessToken;

export const getRefreshToken = () => getStoredSession()?.refreshToken;
