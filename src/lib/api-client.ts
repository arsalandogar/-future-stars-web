import Axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { notifications } from '@mantine/notifications';

import { env } from '@/config/env';

interface ApiErrorResponse {
  errors?: Array<{ message: string }>;
}

let getAuthToken: () => string | null = () => null;
let clearAuth: () => void = () => {};

interface ApiClientConfig {
  getAuthToken: () => string | null;
  clearAuth: () => void;
}

export function configureApiClient(config: ApiClientConfig) {
  getAuthToken = config.getAuthToken;
  clearAuth = config.clearAuth;
}

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse<unknown> => {
    return response.data as AxiosResponse<unknown>;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const errorResponse = error.response?.data;
    const message = errorResponse?.errors?.[0]?.message ?? error.message;
    const isAuthPage =
      window.location.pathname === '/login' ||
      window.location.pathname === '/admin/login';
    const isGuestLogin = error.config?.url === 'auth/guest';

    if (!isGuestLogin) {
      notifications.show({
        color: 'red',
        title: 'Error',
        message,
      });
    }

    if (error.response?.status === 401 && !isAuthPage && !isGuestLogin) {
      clearAuth();
      const redirectTo = window.location.pathname + window.location.search;
      window.location.href = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
    }

    return Promise.reject(error);
  }
);
