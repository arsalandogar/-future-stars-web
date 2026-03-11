import { Button, Divider, Stack, Text } from '@mantine/core';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { revalidateLogic } from '@tanstack/react-form';
import * as v from 'valibot';

import { useAppForm } from '@/lib/form';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/utils/get-error-message';

import { useCheckPhone } from '../api/check-phone';
import { useGuestLogin } from '../api/guest-login';
import { useCustomerAuthStore } from '../stores/customer-auth-store';

const phoneSchema = v.object({
  phone: v.pipe(
    v.string(),
    v.nonEmpty('Phone number is required'),
    v.minLength(10, 'Enter a valid phone number')
  ),
});

const routeApi = getRouteApi('/login');

export function PhoneLoginForm() {
  const navigate = useNavigate();
  const { redirectTo } = routeApi.useSearch();
  const checkPhone = useCheckPhone();
  const guestLogin = useGuestLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { setPhone, setFlow, setExpiresIn, goToStep } = useCustomerAuthStore();

  const form = useAppForm({
    defaultValues: { phone: '' },
    validators: { onDynamic: phoneSchema },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      const result = await checkPhone.mutateAsync({
        phone: `1${value.phone}`,
      });
      setPhone(value.phone);

      if (result.exists) {
        setFlow('login');
        if (result.expiresIn) setExpiresIn(result.expiresIn);
        goToStep('otp-verify');
      } else {
        setFlow('signup');
        goToStep('signup');
      }
    },
  });

  const handleContinueAsGuest = () => {
    guestLogin.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: redirectTo || '/' });
      },
    });
  };

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

            {checkPhone.isError && (
              <Text size="sm" c="red">
                {getErrorMessage(checkPhone.error)}
              </Text>
            )}

            <form.SubmitButton fullWidth size="md">
              Sign in with Phone
            </form.SubmitButton>
          </Stack>
        </form.Form>
      </form.AppForm>

      {!isAuthenticated && (
        <>
          <Divider label="or" labelPosition="center" />

          <Button
            variant="subtle"
            fullWidth
            size="md"
            onClick={handleContinueAsGuest}
            loading={guestLogin.isPending}
          >
            <Text size="sm" c="dimmed">
              Continue as Guest
            </Text>
          </Button>
        </>
      )}
    </Stack>
  );
}
