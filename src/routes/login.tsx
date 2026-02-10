import { createFileRoute, redirect } from '@tanstack/react-router';

import { CustomerLoginPage } from '@/features/customer-auth';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated && !context.auth.user?.isGuest) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/' });
    }
  },
  component: CustomerLoginPage,
});
