import { createFileRoute, redirect } from '@tanstack/react-router';

import { AuthLayout, LoginForm } from '@/features/auth';

export const Route = createFileRoute('/admin/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated && context.auth.user?.isAdmin) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/admin', search: { period: 'month' } });
    }
  },
  component: AdminLoginPage,
});

function AdminLoginPage() {
  return (
    <AuthLayout title="Admin Login" description="Sign in to the admin panel">
      <LoginForm />
    </AuthLayout>
  );
}
