import axios from 'axios';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { AuthSession, AuthUser, SignupResult } from '../models/Auth';
import { login as loginRequest, refreshSession, resetPassword as resetPasswordRequest, signup as signupRequest, LoginPayload, SignupPayload } from '../services/auth';
import { authSessionChangedEvent, clearStoredSession, getStoredSession, setStoredSession } from '../services/tokenStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<AuthSession>;
  resetPassword: (password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<SignupResult>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  useEffect(() => {
    let active = true;
    const syncSession = () => setSession(getStoredSession());
    const syncSessionFromServer = () => {
      const current = getStoredSession();
      if (!current?.refreshToken) {
        return;
      }

      const expectedRefreshToken = current.refreshToken;
      refreshSession(expectedRefreshToken)
        .then((nextSession) => {
          if (
            active &&
            getStoredSession()?.refreshToken === expectedRefreshToken
          ) {
            setStoredSession(nextSession);
          }
        })
        .catch((error) => {
          if (
            active &&
            axios.isAxiosError(error) &&
            error.response?.status === 401 &&
            getStoredSession()?.refreshToken === expectedRefreshToken
          ) {
            clearStoredSession();
          }
        });
    };
    window.addEventListener(authSessionChangedEvent, syncSession);
    window.addEventListener('storage', syncSession);
    window.addEventListener('focus', syncSessionFromServer);
    syncSessionFromServer();

    return () => {
      active = false;
      window.removeEventListener(authSessionChangedEvent, syncSession);
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('focus', syncSessionFromServer);
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const saveSession = (nextSession: AuthSession) => {
      setStoredSession(nextSession);
      setSession(nextSession);
    };

    return {
      user: session?.user ?? null,
      isAdmin:
        session?.user.role === 'admin' ||
        session?.user.role === 'super_admin',
      isSuperAdmin: session?.user.role === 'super_admin',
      isAuthenticated: Boolean(session?.accessToken),
      login: async (payload) => {
        const nextSession = await loginRequest(payload);
        saveSession(nextSession);
        return nextSession;
      },
      resetPassword: async (password) => {
        const nextSession = await resetPasswordRequest(password);
        saveSession(nextSession);
      },
      signup: async (payload) => {
        return await signupRequest(payload);
      },
      logout: () => {
        clearStoredSession();
        setSession(null);
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
