import { Anchor, Divider, Group, Stack, Text } from '@mantine/core';

import { useAppForm } from '@/lib/form';
import { revalidateLogic } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import * as v from 'valibot';

import { useAuth } from '../hooks/use-auth';
import type { RegisterCredentials } from '../types';

const policyVersionsSchema = v.object({
  privacyPolicy: v.string(),
  terms: v.string(),
});

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
  acceptPolicies: v.boolean(),
  policyVersions: policyVersionsSchema,
});

const defaultValues: RegisterCredentials = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  acceptPolicies: false,
  policyVersions: {
    privacyPolicy: '',
    terms: '',
  },
};

export function RegisterForm() {
  const { register } = useAuth();

  const form = useAppForm({
    defaultValues,
    validators: {
      onDynamic: registerSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      await register(value);
    },
  });

  return (
    <form.AppForm>
      <form.Form>
        <Stack gap="lg">
          <Stack gap="lg">
            <Group grow>
              <form.AppField name="firstName">
                {(field) => (
                  <field.FloatingTextField
                    label="First name"
                    size="md"
                    required
                  />
                )}
              </form.AppField>
              <form.AppField name="lastName">
                {(field) => (
                  <field.FloatingTextField
                    label="Last name"
                    size="md"
                    required
                  />
                )}
              </form.AppField>
            </Group>
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

          <form.SubmitButton fullWidth size="md">
            Create account
          </form.SubmitButton>

          <Divider label="or" labelPosition="center" />

          <Text size="sm" ta="center" c="dimmed">
            Already have an account?{' '}
            <Anchor component={Link} to="/auth/login" fw={500}>
              Sign in
            </Anchor>
          </Text>
        </Stack>
      </form.Form>
    </form.AppForm>
  );
}
