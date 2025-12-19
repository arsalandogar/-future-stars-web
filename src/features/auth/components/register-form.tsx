import { Anchor, Button, Divider, Group, Stack, Text } from '@mantine/core';

import {
  FloatingLabelInput,
  FloatingPasswordInput,
} from '@/components/form/floating-label-input';
import { revalidateLogic, useForm } from '@tanstack/react-form';
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
      onDynamic: registerSchema,
    },
    validationLogic: revalidateLogic(),
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
      <Stack gap="lg">
        <Stack gap="lg">
          <Group grow>
            <form.Field name="firstName">
              {(field) => (
                <FloatingLabelInput
                  label="First name"
                  size="md"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors[0]?.message}
                />
              )}
            </form.Field>
            <form.Field name="lastName">
              {(field) => (
                <FloatingLabelInput
                  label="Last name"
                  size="md"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors[0]?.message}
                />
              )}
            </form.Field>
          </Group>
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

        <Button
          type="submit"
          fullWidth
          size="md"
          loading={registerMutation.isPending}
        >
          Create account
        </Button>

        <Divider label="or" labelPosition="center" />

        <Text size="sm" ta="center" c="dimmed">
          Already have an account?{' '}
          <Anchor component={Link} to="/auth/login" fw={500}>
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </form>
  );
}
