import Axios, { type InternalAxiosRequestConfig } from 'axios';

import { notifications } from '@mantine/notifications';

import { env } from '@/config/env';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    notifications.show({
      color: 'red',
      title: 'Error',
      message,
    });

    if (error.response?.status === 401) {
      const redirectTo = window.location.pathname;
      window.location.href = `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`;
    }

    return Promise.reject(error);
  }
);
