import { AuthUser, UserRole } from '../models/Auth';
import { api } from './api';

export const fetchUsers = async (): Promise<AuthUser[]> => {
  const response = await api.get('/users');
  const data = response.data.data;

  return Array.isArray(data) ? data : data.items ?? [];
};

export const fetchLinkableUsers = async (): Promise<AuthUser[]> => {
  const response = await api.get('/users/linkable');
  const data = response.data.data;

  return Array.isArray(data) ? data : data.items ?? [];
};

export interface CreateUserPayload {
  email: string;
  username?: string;
  password: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
}

export const createUser = async (
  payload: CreateUserPayload,
): Promise<AuthUser> => {
  const response = await api.post('/users', payload);
  return response.data.data;
};

export const updateUserRole = async (
  id: string,
  role: UserRole,
): Promise<AuthUser> => {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data.data;
};

export const updateUserStatus = async (
  id: string,
  isActive: boolean,
): Promise<AuthUser> => {
  const response = await api.patch(`/users/${id}`, {
    is_active: isActive,
  });
  return response.data.data;
};

export const updateUserVerification = async (
  id: string,
  isVerified: boolean,
): Promise<AuthUser> => {
  const response = await api.patch(`/users/${id}/verification`, {
    is_verified: isVerified,
  });
  return response.data.data;
};

export interface PasswordResetRequest {
  _id: string;
  email: string;
  username?: string;
  requested_at: string;
}

export const fetchPasswordResetRequests = async (): Promise<
  PasswordResetRequest[]
> => {
  const response = await api.get('/users/password-reset-requests');
  return response.data.data;
};

export const approvePasswordResetRequest = async (
  id: string,
  temporaryPassword: string,
): Promise<void> => {
  await api.patch(`/users/${id}/password-reset-request/approve`, {
    temporary_password: temporaryPassword,
  });
};

export const rejectPasswordResetRequest = async (
  id: string,
): Promise<void> => {
  await api.patch(`/users/${id}/password-reset-request/reject`);
};
