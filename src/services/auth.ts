import { AuthSession, SignupResult } from '../models/Auth';
import { api } from './api';

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
