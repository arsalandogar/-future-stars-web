import { createFileRoute, redirect } from '@tanstack/react-router';
import * as v from 'valibot';

import { CustomerLoginPage } from '@/features/customer-auth';

function isSafeRedirect(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

const searchSchema = v.object({
  redirectTo: v.optional(v.pipe(v.string(), v.check(isSafeRedirect))),
});

export const Route = createFileRoute('/login')({
  validateSearch: (search) => v.parse(searchSchema, search),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated && !context.auth.user?.isGuest) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: search.redirectTo || '/' });
    }
  },
  component: CustomerLoginPage,
});
