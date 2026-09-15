import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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

let refreshPromise: Promise<ReturnType<typeof getStoredSession>> | null = null;
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

    const refreshToken = getRefreshToken();

    try {
      originalRequest._retry = true;
      const csrfToken = refreshToken ? undefined : await ensureCsrfToken();
      refreshPromise ??= axios.post(
        `${getApiBaseUrl()}/auth/refresh`,
        refreshToken ? { refreshToken } : {},
        {
          withCredentials: true,
          headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined,
        },
      ).then((response) => {
        const currentSession = getStoredSession();
        const nextSession = {
          ...response.data.data,
          user: response.data.data.user ?? currentSession?.user,
        };
        setStoredSession(nextSession);
        return nextSession;
      }).finally(() => {
        refreshPromise = null;
      });
      const nextSession = await refreshPromise;

      if (!nextSession) throw new Error('Session refresh failed');
      originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      return Promise.reject(refreshError);
    }
  },
);
