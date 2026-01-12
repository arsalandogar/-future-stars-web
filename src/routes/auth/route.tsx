import {
  createFileRoute,
  Outlet,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router';
import * as v from 'valibot';

const defaultValues = {
  redirectTo: '/',
};

export const Route = createFileRoute('/auth')({
  validateSearch: v.object({
    redirectTo: v.optional(v.string()),
  }),
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      const redirectTo = search?.redirectTo;
      const destination = redirectTo ?? '/';

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: destination });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return <Outlet />;
}
