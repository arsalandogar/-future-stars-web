import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import * as v from 'valibot';

import { useRegister } from '../api/register';
import type { RegisterCredentials } from '../types';

const registerSchema = v.object({
  firstName: v.pipe(
    v.string(),
    v.nonEmpty('First name is required'),
    v.maxLength(64, 'First name must be at most 64 characters')
  ),
  lastName: v.pipe(
    v.string(),
    v.nonEmpty('Last name is required'),
    v.maxLength(64, 'Last name must be at most 64 characters')
  ),
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

const defaultValues: RegisterCredentials = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

export function RegisterForm() {
  const navigate = useNavigate();

  const registerMutation = useRegister({
    mutationConfig: {
      onSuccess: () => {
        void navigate({ to: '/' });
      },
    },
  });

  const form = useForm({
    defaultValues,
    validators: {
      onBlur: registerSchema,
    },
    onSubmit: ({ value }) => {
      registerMutation.mutate(value);
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
        <Group grow>
          <form.Field name="firstName">
            {(field) => (
              <TextInput
                label="First name"
                placeholder="John"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
          <form.Field name="lastName">
            {(field) => (
              <TextInput
                label="Last name"
                placeholder="Doe"
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>
        </Group>
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
              placeholder="Create a password"
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
          loading={registerMutation.isPending}
          mt="md"
        >
          Create account
        </Button>
        <Text size="sm" ta="center">
          Already have an account?{' '}
          <Anchor component={Link} to="/auth/login">
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
