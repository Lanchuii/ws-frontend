import { createContext, ReactNode, useMemo, useState } from 'react';
import { AuthSession, AuthUser } from '../models/Auth';
import { login as loginRequest, signup as signupRequest, LoginPayload, SignupPayload } from '../services/auth';
import { clearStoredSession, getStoredSession, setStoredSession } from '../services/tokenStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  const value = useMemo<AuthContextValue>(() => {
    const saveSession = (nextSession: AuthSession) => {
      setStoredSession(nextSession);
      setSession(nextSession);
    };

    return {
      user: session?.user ?? null,
      isAdmin: session?.user.role === 'admin',
      isAuthenticated: Boolean(session?.accessToken),
      login: async (payload) => {
        const nextSession = await loginRequest(payload);
        saveSession(nextSession);
      },
      signup: async (payload) => {
        const nextSession = await signupRequest(payload);
        saveSession(nextSession);
      },
      logout: () => {
        clearStoredSession();
        setSession(null);
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
