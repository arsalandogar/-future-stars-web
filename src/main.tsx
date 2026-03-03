import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/nprogress/styles.css';
import '@/index.css';
import { AuthInitializer } from '@/app/auth-initializer';
import { AppProvider } from '@/app/provider';
import { AppRouter } from '@/app/router';
import { configureApiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

configureApiClient({
  getAuthToken: () => useAuthStore.getState().token?.token ?? null,
  clearAuth: () => useAuthStore.getState().clearAuth(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </AppProvider>
  </StrictMode>
);
