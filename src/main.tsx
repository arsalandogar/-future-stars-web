import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@/index.css';
import { AppProvider } from '@/app/provider';
import { AppRouter } from '@/app/router';
import { setAuthTokenGetter } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth';

// Initialize auth token getter for API client
setAuthTokenGetter(() => useAuthStore.getState().token);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppRouter />
    </AppProvider>
  </StrictMode>
);
