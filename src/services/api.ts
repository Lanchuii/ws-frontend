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
});

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
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearStoredSession();
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;
      const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
        refreshToken,
      });
      const currentSession = getStoredSession();
      const nextSession = {
        ...response.data.data,
        user: response.data.data.user ?? currentSession?.user,
      };

      setStoredSession(nextSession);
      originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearStoredSession();
      return Promise.reject(refreshError);
    }
  },
);
