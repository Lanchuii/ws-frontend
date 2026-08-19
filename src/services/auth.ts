import axios from 'axios';
import { AuthSession, SignupResult } from '../models/Auth';
import { api } from './api';
import { getApiBaseUrl } from './api';

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

export const refreshSession = async (
  refreshToken: string,
): Promise<AuthSession> => {
  const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
    refreshToken,
  });
  return response.data.data;
};

export const resetPassword = async (
  password: string,
): Promise<AuthSession> => {
  const response = await api.post('/auth/reset-password', { password });
  return response.data.data;
};
