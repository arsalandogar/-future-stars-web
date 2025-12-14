import {
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import * as v from 'valibot';

import { useLogin } from '../api/login';
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
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/login' });
  const redirectTo = search.redirectTo || '/';

  const loginMutation = useLogin({
    mutationConfig: {
      onSuccess: () => {
        void navigate({ to: redirectTo });
      },
    },
  });

  const form = useForm({
    defaultValues,
    validators: {
      onBlur: loginSchema,
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack gap="md">
        <form.Field name="email">
          {(field) => (
            <TextInput
              label="Email"
              placeholder="you@example.com"
              type="email"
              required
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.message}
            />
          )}
        </form.Field>
        <Button
          type="submit"
          fullWidth
          loading={loginMutation.isPending}
          mt="md"
        >
          Sign in
        </Button>
        <Text size="sm" ta="center">
          Don&apos;t have an account?{' '}
          <Anchor component={Link} to="/auth/register">
            Sign up
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
