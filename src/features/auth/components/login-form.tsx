import { Anchor, Button, Divider, Group, Stack, Text } from '@mantine/core';

import {
  FloatingLabelInput,
  FloatingPasswordInput,
} from '@/components/form/floating-label-input';
import { revalidateLogic, useForm } from '@tanstack/react-form';
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
  const { login, isLoggingIn } = useAuth();

  const form = useForm({
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack gap="lg">
        <Stack gap="lg">
          <form.Field name="email">
            {(field) => (
              <FloatingLabelInput
                label="Email address"
                type="email"
                size="md"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <FloatingPasswordInput
                label="Password"
                size="md"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
        </Stack>

        <Group justify="flex-end">
          <Anchor component={Link} to="/auth/login" size="sm" c="dimmed">
            Forgot password?
          </Anchor>
        </Group>

        <Button type="submit" fullWidth size="md" loading={isLoggingIn}>
          Sign in
        </Button>

        <Divider label="or" labelPosition="center" />

        <Text size="sm" ta="center" c="dimmed">
          Don&apos;t have an account?{' '}
          <Anchor component={Link} to="/auth/register" fw={500}>
            Create account
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
