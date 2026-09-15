import { AuthSession, SignupResult } from '../models/Auth';
import { api, refreshStoredSession } from './api';

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
  const response = await api.post('/auth/login', payload);
  return response.data.data;
};

export const signup = async (payload: SignupPayload): Promise<SignupResult> => {
  const response = await api.post('/auth/signup', payload);
  return response.data.data;
};

export const requestPasswordReset = async (
  email: string,
): Promise<string> => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data.data.message;
};

export const refreshSession = async (
  refreshToken?: string,
): Promise<AuthSession> => {
  return await refreshStoredSession(refreshToken);
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const resetPassword = async (
  password: string,
): Promise<AuthSession> => {
  const response = await api.post('/auth/reset-password', { password });
  return response.data.data;
};
