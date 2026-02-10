import { Anchor, Group, Stack } from '@mantine/core';

import { useAppForm } from '@/lib/form';
import { revalidateLogic } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import * as v from 'valibot';

import { useAuth } from '../hooks/use-auth';
import type { LoginCredentials } from '../types';

const loginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Email is required'),
    v.email('Invalid email address')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Password is required'),
    v.minLength(8, 'Password must be at least 8 characters'),
    v.maxLength(64, 'Password must be at most 64 characters')
  ),
});

const defaultValues: LoginCredentials = {
  email: '',
  password: '',
};

export function LoginForm() {
  const { login } = useAuth();

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: loginSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      await login(value);
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="lg">
          <Stack gap="lg">
            <form.AppField name="email">
              {(field) => (
                <field.FloatingTextField
                  label="Email address"
                  type="email"
                  size="md"
                  required
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.FloatingPasswordField
                  label="Password"
                  size="md"
                  required
                />
              )}
            </form.AppField>
          </Stack>

          <Group justify="flex-end">
            <Anchor component={Link} to="/admin/login" size="sm" c="dimmed">
              Forgot password?
            </Anchor>
          </Group>

          <form.SubmitButton fullWidth size="md">
            Sign in
          </form.SubmitButton>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
