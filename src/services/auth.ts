import { AuthSession, SignupResult } from '../models/Auth';
import {
  api,
  firstPartyAuthHeaders,
  getAuthBaseUrl,
  refreshStoredSession,
} from './api';

export interface LoginPayload {
  login: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  username?: string;
  password: string;
}

export const login = async (payload: LoginPayload): Promise<AuthSession> => {
  const response = await api.post(`${getAuthBaseUrl()}/auth/login`, payload, {
    headers: firstPartyAuthHeaders,
  });
  return response.data.data;
};

export const signup = async (payload: SignupPayload): Promise<SignupResult> => {
  const response = await api.post(`${getAuthBaseUrl()}/auth/signup`, payload, {
    headers: firstPartyAuthHeaders,
  });
  return response.data.data;
};

export const requestPasswordReset = async (
  email: string,
): Promise<string> => {
  const response = await api.post(
    `${getAuthBaseUrl()}/auth/forgot-password`,
    { email },
    { headers: firstPartyAuthHeaders },
  );
  return response.data.data.message;
};

export const refreshSession = async (
  refreshToken?: string,
): Promise<AuthSession> => {
  return await refreshStoredSession(refreshToken);
};

export const logout = async () => {
  await api.post(`${getAuthBaseUrl()}/auth/logout`, undefined, {
    headers: firstPartyAuthHeaders,
  });
};

export const resetPassword = async (
  password: string,
): Promise<AuthSession> => {
  const response = await api.post(
    `${getAuthBaseUrl()}/auth/reset-password`,
    { password },
    { headers: firstPartyAuthHeaders },
  );
  return response.data.data;
};
