import { AuthUser } from '../models/Auth';
import { api } from './api';

export const fetchUsers = async (): Promise<AuthUser[]> => {
  const response = await api.get('/users');
  const data = response.data.data;

  return Array.isArray(data) ? data : data.items ?? [];
};
