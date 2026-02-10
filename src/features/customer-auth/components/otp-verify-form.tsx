import { Anchor, PinInput, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getErrorMessage } from '@/utils/get-error-message';
import { formatPhone } from '@/utils/format-phone';

import { useCheckPhone } from '../api/check-phone';
import { useMergeGuest } from '../api/guest-register';
import { useSendOtp } from '../api/send-otp';
import { useVerifyOtp } from '../api/verify-otp';
import { useCustomerAuthStore } from '../stores/customer-auth-store';

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function OtpVerifyForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mergeGuest = useMergeGuest();
  const verifyOtp = useVerifyOtp();
  const checkPhone = useCheckPhone();
  const sendOtp = useSendOtp();
  const { phone, flow, firstName, lastName, expiresIn, setExpiresIn, reset } =
    useCustomerAuthStore();
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(expiresIn ?? 0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const fullPhone = `1${phone}`;
  const mutation = flow === 'login' ? mergeGuest : verifyOtp;

  const handleVerify = (value: string) => {
    const onSuccess = () => {
      void queryClient.clear();
      reset();
      void navigate({ to: '/' });
    };

    const onError = () => {
      setOtpValue('');
    };

    if (flow === 'login') {
      mergeGuest.mutate(
        { phone: fullPhone, otp: value },
        { onSuccess, onError }
      );
    } else {
      verifyOtp.mutate(
        { phone: fullPhone, otp: value, type: 'new', firstName, lastName },
        { onSuccess, onError }
      );
    }
  };

  const resendPending = checkPhone.isPending || sendOtp.isPending;
  const resendDisabled = resendPending || countdown > 0;

  const handleResend = () => {
    if (resendDisabled) return;

    if (flow === 'login') {
      checkPhone.mutate(
        { phone: fullPhone },
        {
          onSuccess: (data) => {
            if (data.expiresIn) {
              setExpiresIn(data.expiresIn);
              setCountdown(data.expiresIn);
            }
          },
        }
      );
    } else {
      sendOtp.mutate(
        { phone: fullPhone, type: 'new' },
        {
          onSuccess: (data) => {
            setExpiresIn(data.expiresIn);
            setCountdown(data.expiresIn);
          },
        }
      );
    }
    setOtpValue('');
  };

  const handleChangeNumber = () => {
    reset();
  };

  return (
    <Stack gap="lg" align="center">
      <Stack gap={4} align="center">
        <Text size="sm" c="dimmed">
          Enter the 6-digit code sent to
        </Text>
        <Text size="sm" fw={600} c="white">
          +{fullPhone.slice(0, 1)} {formatPhone(fullPhone.slice(1))}
        </Text>
      </Stack>

      <PinInput
        length={6}
        type="number"
        size="md"
        value={otpValue}
        onChange={setOtpValue}
        onComplete={handleVerify}
        disabled={mutation.isPending}
      />

      {mutation.isPending && (
        <Text size="sm" c="dimmed">
          Verifying...
        </Text>
      )}

      {mutation.isError && (
        <Text size="sm" c="red">
          {getErrorMessage(mutation.error)}
        </Text>
      )}

      {countdown > 0 && (
        <Text size="sm" c="dimmed">
          Code expires in {formatCountdown(countdown)}
        </Text>
      )}

      <Stack gap="xs" align="center">
        <Anchor
          size="sm"
          c="dimmed"
          onClick={handleResend}
          style={{
            cursor: resendDisabled ? 'not-allowed' : 'pointer',
            opacity: resendDisabled ? 0.5 : 1,
          }}
        >
          {resendPending
            ? 'Sending...'
            : countdown > 0
              ? `Resend code (${formatCountdown(countdown)})`
              : 'Resend code'}
        </Anchor>
        <Anchor size="sm" c="dimmed" onClick={handleChangeNumber}>
          Change number
        </Anchor>
      </Stack>
    </Stack>
  );
}
