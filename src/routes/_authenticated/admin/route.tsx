import { createFileRoute, redirect } from '@tanstack/react-router';

import { AdminLayout } from '@/app/layouts/admin';
import { NotFound } from '@/components/errors/not-found';

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.isAdmin) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: '/',
      });
    }
  },
  component: AdminLayout,
  notFoundComponent: NotFound,
});
