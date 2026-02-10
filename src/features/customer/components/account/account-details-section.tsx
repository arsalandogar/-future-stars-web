import {
  Anchor,
  Button,
  PinInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth-store';
import { formatPhone } from '@/utils/format-phone';
import { getErrorMessage } from '@/utils/get-error-message';

import type { UpdateProfileParams } from '../../api/update-profile';
import { useRequestPhoneOtp } from '../../api/request-phone-otp';
import { useUpdateProfile } from '../../api/update-profile';
import { useVerifyPhoneOtp } from '../../api/verify-phone-otp';
import { AccountSectionHeader } from './account-section-header';
import styles from './account-section.module.css';

const GUEST_EMAIL_PATTERN = /^guest-\d+@guest\.local$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PHONE_DIGITS = 10;

const INPUT_STYLES = {
  input: {
    backgroundColor: 'var(--customer-input-bg)',
    borderColor: 'var(--customer-input-bg)',
    color: 'white',
    fontSize: 'var(--mantine-font-size-md)',
    height: '48px',
    '&:focus': {
      borderColor: 'var(--mantine-color-primary-4)',
    },
  },
  label: {
    color: 'var(--mantine-color-dimmed)',
    fontSize: 'var(--mantine-font-size-md)',
    fontWeight: 600,
    marginBottom: 6,
  },
};

type Step = 'view' | 'edit' | 'verify-phone';

function stripCountryCode(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '').replace(/^1/, '');
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AccountDetailsSection() {
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState<Step>('view');
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: stripCountryCode(user?.phone),
    email: user?.email ?? '',
  }));
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);

  const updateProfile = useUpdateProfile();
  const requestOtp = useRequestPhoneOtp();
  const verifyOtp = useVerifyPhoneOtp();

  const originalPhone = stripCountryCode(user?.phone);
  const phoneChanged = formData.phone !== originalPhone;
  const newFullPhone = `1${formData.phone}`;

  const phoneError =
    formData.phone.length > 0 && formData.phone.length < MAX_PHONE_DIGITS
      ? 'Phone number must be 10 digits'
      : undefined;

  const emailValue = GUEST_EMAIL_PATTERN.test(formData.email)
    ? ''
    : formData.email;
  const emailError =
    emailValue.length > 0 && !EMAIL_PATTERN.test(emailValue)
      ? 'Please enter a valid email address'
      : undefined;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: stripCountryCode(user?.phone),
      email: user?.email ?? '',
    });
    setStep('edit');
  };

  const handleCancel = () => {
    setStep('view');
    setOtpValue('');
    setCountdown(0);
    requestOtp.reset();
    verifyOtp.reset();
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, MAX_PHONE_DIGITS);
    setFormData((prev) => ({ ...prev, phone: digits }));
  };

  const getChangedFields = (): UpdateProfileParams => {
    const changes: UpdateProfileParams = {};
    if (formData.firstName !== (user?.firstName ?? ''))
      changes.firstName = formData.firstName;
    if (formData.lastName !== (user?.lastName ?? ''))
      changes.lastName = formData.lastName;
    const isGuestEmail = GUEST_EMAIL_PATTERN.test(formData.email);
    if (!isGuestEmail && formData.email !== (user?.email ?? ''))
      changes.email = formData.email;
    return changes;
  };

  const saveProfileFields = (onDone: () => void) => {
    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      onDone();
      return;
    }
    updateProfile.mutate(changes, {
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        onDone();
      },
    });
  };

  const hasValidationErrors = !!phoneError || !!emailError;

  const handleSave = () => {
    if (hasValidationErrors) return;
    if (phoneChanged && formData.phone.length === MAX_PHONE_DIGITS) {
      // Phone changed — request OTP for new phone first
      requestOtp.mutate(
        { phone: newFullPhone, type: 'new' },
        {
          onSuccess: (data) => {
            setCountdown(data.expiresIn);
            setStep('verify-phone');
          },
        }
      );
    } else {
      const changes = getChangedFields();
      if (Object.keys(changes).length === 0) {
        // Nothing changed — just exit edit mode
        setStep('view');
        return;
      }
      updateProfile.mutate(changes, {
        onSuccess: (updatedUser) => {
          setUser(updatedUser);
          setStep('view');
        },
      });
    }
  };

  const handleVerifyOtp = (value: string) => {
    verifyOtp.mutate(
      { phone: newFullPhone, otp: value, type: 'new' },
      {
        onSuccess: () => {
          // Phone updated via verify-otp, now patch name/email
          saveProfileFields(() => {
            setStep('view');
            setOtpValue('');
            setCountdown(0);
          });
        },
        onError: () => {
          setOtpValue('');
        },
      }
    );
  };

  const resendPending = requestOtp.isPending;
  const resendDisabled = resendPending || countdown > 0;

  const handleResend = () => {
    if (resendDisabled) return;
    requestOtp.mutate(
      { phone: newFullPhone, type: 'new' },
      {
        onSuccess: (data) => {
          setCountdown(data.expiresIn);
        },
      }
    );
    setOtpValue('');
    verifyOtp.reset();
  };

  if (step === 'verify-phone') {
    return (
      <div>
        <AccountSectionHeader
          title="Verify Phone Number"
          description="Enter the code sent to your new phone number"
        />

        <div className={styles.card}>
          <Stack gap="lg" align="center">
            <Stack gap={4} align="center">
              <Text size="sm" c="dimmed">
                Enter the 6-digit code sent to
              </Text>
              <Text size="sm" fw={600} c="white">
                +1 {formatPhone(formData.phone)}
              </Text>
            </Stack>

            <PinInput
              length={6}
              type="number"
              size="md"
              value={otpValue}
              onChange={setOtpValue}
              onComplete={handleVerifyOtp}
              disabled={verifyOtp.isPending || updateProfile.isPending}
            />

            {(verifyOtp.isPending || updateProfile.isPending) && (
              <Text size="sm" c="dimmed">
                {verifyOtp.isPending ? 'Verifying...' : 'Updating profile...'}
              </Text>
            )}

            {verifyOtp.isError && (
              <Text size="sm" c="red">
                {getErrorMessage(verifyOtp.error)}
              </Text>
            )}

            {updateProfile.isError && (
              <Text size="sm" c="red">
                {getErrorMessage(updateProfile.error)}
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
              <Anchor size="sm" c="dimmed" onClick={handleCancel}>
                Cancel
              </Anchor>
            </Stack>
          </Stack>
        </div>
      </div>
    );
  }

  if (step === 'edit') {
    return (
      <div>
        <AccountSectionHeader
          title="Account Details"
          description="Manage your personal information and account settings"
        />

        <div className={styles.card}>
          <div className={styles.fieldGroup}>
            <TextInput
              label="First name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              styles={INPUT_STYLES}
            />
            <TextInput
              label="Last name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              styles={INPUT_STYLES}
            />
            <TextInput
              label="Phone"
              type="tel"
              value={formatPhone(formData.phone)}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              error={phoneError}
              leftSection={
                <Text size="sm" fw={500} lh={1} style={{ margin: 0 }}>
                  🇺🇸 +1
                </Text>
              }
              leftSectionWidth={64}
              styles={INPUT_STYLES}
            />
            <TextInput
              label="Email"
              value={emailValue}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              error={emailError}
              styles={INPUT_STYLES}
            />
          </div>

          {requestOtp.isError && (
            <Text size="sm" c="red" mt="md">
              {getErrorMessage(requestOtp.error)}
            </Text>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            variant="filled"
            radius="xl"
            size="lg"
            onClick={handleCancel}
            disabled={updateProfile.isPending || requestOtp.isPending}
            styles={{
              root: {
                backgroundColor: 'var(--customer-button-secondary-bg)',
                '&:hover': {
                  backgroundColor: 'var(--customer-button-secondary-bg)',
                  opacity: 0.9,
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            radius="xl"
            size="lg"
            onClick={handleSave}
            loading={updateProfile.isPending || requestOtp.isPending}
            disabled={hasValidationErrors}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AccountSectionHeader
        title="Account Details"
        description="Manage your personal information and account settings"
        action={
          <Button
            variant="transparent"
            className={styles.editButton}
            onClick={handleEdit}
          >
            Edit
          </Button>
        }
      />

      <div className={styles.card}>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>First name</span>
            <span className={styles.fieldValue}>
              {user?.firstName || 'Not set'}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Last name</span>
            <span className={styles.fieldValue}>
              {user?.lastName || 'Not set'}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Phone</span>
            <span className={styles.fieldValue}>
              {user?.phone
                ? `+1 ${formatPhone(stripCountryCode(user.phone))}`
                : 'Not set'}
            </span>
          </div>
          {user?.email && !GUEST_EMAIL_PATTERN.test(user.email) && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <span className={styles.fieldValue}>{user.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
