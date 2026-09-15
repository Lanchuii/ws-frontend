import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthSession } from '../models/Auth';
import {
  clearStoredSession,
  getAccessToken,
  getRefreshToken,
  getStoredSession,
  setStoredSession,
} from './tokenStorage';

export const getApiBaseUrl = () => {
  return import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_REACT_APP_API_URL
    : import.meta.env.VITE_REACT_APP_DEV_API_URL;
};

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

let refreshPromise: Promise<AuthSession> | null = null;
let csrfPromise: Promise<string> | null = null;

const getCsrfToken = () => {
  const sessionToken = getStoredSession()?.csrfToken;
  if (sessionToken) return sessionToken;
  const prefix = 'ws_csrf=';
  const item = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : undefined;
};

export const ensureCsrfToken = async () => {
  const existingToken = getCsrfToken();
  if (existingToken) return existingToken;
  csrfPromise ??= axios
    .get(`${getApiBaseUrl()}/auth/csrf`, { withCredentials: true })
    .then((response) => response.data.data.csrfToken as string)
    .finally(() => {
      csrfPromise = null;
    });
  return await csrfPromise;
};

const performSessionRefresh = async (
  refreshToken?: string,
): Promise<AuthSession> => {
  const csrfToken = refreshToken ? undefined : await ensureCsrfToken();
  const response = await axios.post(
    `${getApiBaseUrl()}/auth/refresh`,
    refreshToken ? { refreshToken } : {},
    {
      withCredentials: true,
      headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
    },
  );
  const currentSession = getStoredSession();
  const nextSession = {
    ...response.data.data,
    user: response.data.data.user ?? currentSession?.user,
  } as AuthSession;
  setStoredSession(nextSession);
  return nextSession;
};

export const refreshStoredSession = (
  refreshToken = getRefreshToken(),
): Promise<AuthSession> => {
  refreshPromise ??= performSessionRefresh(refreshToken).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const responseData = error.response?.data as {
      errors?: { code?: string };
    } | undefined;
    if (
      error.response?.status === 403 &&
      responseData?.errors?.code === 'PASSWORD_RESET_REQUIRED'
    ) {
      const currentSession = getStoredSession();
      if (currentSession) {
        setStoredSession({
          ...currentSession,
          user: {
            ...currentSession.user,
            password_reset_required: true,
          },
        });
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const nextSession = await refreshStoredSession();
      originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      return Promise.reject(refreshError);
    }
  },
);
