import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout, LoginForm } from '@/features/auth';
import * as v from 'valibot';

export const Route = createFileRoute('/auth/login')({
  validateSearch: v.object({
    redirectTo: v.optional(v.string()),
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  );
}
