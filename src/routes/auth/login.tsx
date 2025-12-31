import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout, LoginForm } from '@/features/auth';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  );
}
