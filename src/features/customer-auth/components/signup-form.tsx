import { Stack, Text } from '@mantine/core';
import { revalidateLogic } from '@tanstack/react-form';
import * as v from 'valibot';

import { useAppForm } from '@/lib/form';
import { getErrorMessage } from '@/utils/get-error-message';

import { useSendOtp } from '../api/send-otp';
import { useCustomerAuthStore } from '../stores/customer-auth-store';

const signupSchema = v.object({
  phone: v.pipe(
    v.string(),
    v.nonEmpty('Phone number is required'),
    v.minLength(10, 'Enter a valid phone number')
  ),
  firstName: v.pipe(
    v.string(),
    v.nonEmpty('First name is required'),
    v.maxLength(64, 'First name is too long')
  ),
  lastName: v.pipe(
    v.string(),
    v.nonEmpty('Last name is required'),
    v.maxLength(64, 'Last name is too long')
  ),
});

export function SignupForm() {
  const sendOtp = useSendOtp();
  const { phone, setPhone, setName, setExpiresIn, goToStep } =
    useCustomerAuthStore();

  const form = useAppForm({
    defaultValues: { phone, firstName: '', lastName: '' },
    validators: { onDynamic: signupSchema },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      setPhone(value.phone);
      setName(value.firstName, value.lastName);
      const result = await sendOtp.mutateAsync({
        phone: `1${value.phone}`,
        type: 'new',
      });
      setExpiresIn(result.expiresIn);
      goToStep('otp-verify');
    },
  });

  return (
    <Stack gap="lg">
      <form.AppForm>
        <form.Form>
          <Stack gap="lg">
            <form.AppField name="phone">
              {(field) => (
                <field.PhoneField label="Phone number" size="md" required />
              )}
            </form.AppField>

            <form.AppField name="firstName">
              {(field) => (
                <field.TextField
                  label="First name"
                  size="md"
                  placeholder="Enter your first name"
                  required
                />
              )}
            </form.AppField>

            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  label="Last name"
                  size="md"
                  placeholder="Enter your last name"
                  required
                />
              )}
            </form.AppField>

            {sendOtp.isError && (
              <Text size="sm" c="red">
                {getErrorMessage(sendOtp.error)}
              </Text>
            )}

            <form.SubmitButton fullWidth size="md">
              Sign Up
            </form.SubmitButton>
          </Stack>
        </form.Form>
      </form.AppForm>
    </Stack>
  );
}
