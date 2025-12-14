import { createFileRoute } from '@tanstack/react-router';
import { AuthLayout, RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthLayout title="Create account" description="Sign up to get started">
      <RegisterForm />
    </AuthLayout>
  );
}
