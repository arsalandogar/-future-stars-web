import {
  ActionIcon,
  Anchor,
  Button,
  Loader,
  Modal,
  PinInput,
  Radio,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Elements } from '@stripe/react-stripe-js';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Address, CreateAddressParams } from '@/types';

import { getStripePromise, stripeAppearance } from '@/lib/stripe';
import { useAuthStore } from '@/stores/auth-store';
import { formatPhone } from '@/utils/format-phone';
import { getErrorMessage } from '@/utils/get-error-message';

import {
  useCheckPhone,
  useMergeGuest,
  useSendOtp,
  useVerifyOtp,
} from '@/features/customer-auth';

import { useCreateAddress } from '../api/create-address';
import { useDeleteAddress } from '../api/delete-address';
import { useAddresses } from '../api/get-addresses';
import { useSetDefaultAddress } from '../api/set-default-address';

import { AddressFormInner } from './address-form-inner';
import styles from './address-modal.module.css';

interface AddressModalProps {
  opened: boolean;
  onClose: () => void;
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
}

type ModalView = 'list' | 'add-new' | 'verify-phone';

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AddressModal({
  opened,
  onClose,
  selectedAddress,
  onSelectAddress,
}: AddressModalProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const checkPhone = useCheckPhone();
  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const mergeGuest = useMergeGuest();

  const addresses = data?.data ?? [];

  // Use null to indicate "use computed default", explicit value for user choice
  const [viewOverride, setViewOverride] = useState<ModalView | null>(null);
  const [addressData, setAddressData] = useState<CreateAddressParams | null>(
    null
  );
  const [isAddressComplete, setIsAddressComplete] = useState(false);

  // OTP verification state
  const [otpValue, setOtpValue] = useState('');
  const [otpFlow, setOtpFlow] = useState<'login' | 'signup'>('signup');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Compute effective view: user choice or default based on addresses
  const view = viewOverride ?? (addresses.length === 0 ? 'add-new' : 'list');

  const handleAddressChange = (
    data: CreateAddressParams | null,
    complete: boolean
  ) => {
    setIsAddressComplete(complete);
    setAddressData(data);
  };

  const saveAddress = () => {
    if (!addressData) return;

    createAddress.mutate(addressData, {
      onSuccess: (newAddress) => {
        onSelectAddress(newAddress);
        setViewOverride('list');
        setAddressData(null);
        setIsAddressComplete(false);
        resetOtpState();
      },
    });
  };

  const handleSaveAddress = () => {
    if (!addressData) return;

    // If user is a guest and phone is provided, verify phone first
    if (user?.isGuest && addressData.phone) {
      const phone = addressData.phone;
      checkPhone.mutate(
        { phone },
        {
          onSuccess: (data) => {
            if (data.exists) {
              // Existing user — OTP was sent by check-phone
              setOtpFlow('login');
              if (data.expiresIn) setCountdown(data.expiresIn);
            } else {
              // New user — send OTP
              setOtpFlow('signup');
              sendOtp.mutate(
                { phone, type: 'new' },
                {
                  onSuccess: (otpData) => {
                    setCountdown(otpData.expiresIn);
                  },
                }
              );
            }
            setViewOverride('verify-phone');
          },
        }
      );
      return;
    }

    saveAddress();
  };

  const handleVerifyOtp = (value: string) => {
    if (!addressData) return;
    const phone = addressData.phone;

    const onSuccess = () => {
      void queryClient.clear();
      saveAddress();
    };

    const onError = () => {
      setOtpValue('');
    };

    if (otpFlow === 'login') {
      mergeGuest.mutate({ phone, otp: value }, { onSuccess, onError });
    } else {
      verifyOtp.mutate(
        {
          phone,
          otp: value,
          type: 'new',
          firstName: addressData.firstName,
          lastName: addressData.lastName,
        },
        { onSuccess, onError }
      );
    }
  };

  const handleResendOtp = () => {
    if (!addressData || countdown > 0) return;
    const phone = addressData.phone;

    if (otpFlow === 'login') {
      checkPhone.mutate(
        { phone },
        {
          onSuccess: (data) => {
            if (data.expiresIn) setCountdown(data.expiresIn);
          },
        }
      );
    } else {
      sendOtp.mutate(
        { phone, type: 'new' },
        {
          onSuccess: (data) => {
            setCountdown(data.expiresIn);
          },
        }
      );
    }
    setOtpValue('');
  };

  const resetOtpState = () => {
    setOtpValue('');
    setCountdown(0);
  };

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
    onClose();
  };

  const handleDeleteAddress = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAddress.mutate(address.id);
  };

  const handleSetDefault = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    setDefaultAddress.mutate(address.id);
  };

  const handleBack = () => {
    if (view === 'verify-phone') {
      setViewOverride('add-new');
      resetOtpState();
    } else if (view === 'add-new' && addresses.length > 0) {
      setViewOverride('list');
      setAddressData(null);
      setIsAddressComplete(false);
    } else {
      onClose();
    }
  };

  const otpMutation = otpFlow === 'login' ? mergeGuest : verifyOtp;
  const resendPending = checkPhone.isPending || sendOtp.isPending;
  const resendDisabled = resendPending || countdown > 0;

  const headerTitle =
    view === 'list'
      ? 'SELECT ADDRESS'
      : view === 'add-new'
        ? 'ADD NEW ADDRESS'
        : 'VERIFY PHONE';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="lg"
      classNames={{
        content: styles.content,
        body: styles.body,
      }}
    >
      <div className={styles.header}>
        <Title order={4} className={styles.headerTitle}>
          {headerTitle}
        </Title>
        <ActionIcon
          variant="transparent"
          size="lg"
          onClick={onClose}
          className={styles.closeButton}
        >
          <X size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentSection}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="md" />
          </div>
        ) : view === 'list' ? (
          <>
            <div className={styles.addressList}>
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`${styles.addressItem} ${
                    selectedAddress?.id === address.id
                      ? styles.addressItemSelected
                      : ''
                  }`}
                  onClick={() => handleSelectAddress(address)}
                >
                  <Radio
                    checked={selectedAddress?.id === address.id}
                    onChange={() => handleSelectAddress(address)}
                    className={styles.radioButton}
                  />
                  <div className={styles.addressDetails}>
                    <Text className={styles.addressName}>
                      {address.firstName} {address.lastName}
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </Text>
                    <Text className={styles.addressLine}>
                      {address.addressLine1}
                    </Text>
                    {address.addressLine2 && (
                      <Text className={styles.addressLine}>
                        {address.addressLine2}
                      </Text>
                    )}
                    <Text className={styles.addressLine}>
                      {address.city}, {address.state} {address.postalCode}
                    </Text>
                    {address.phone && (
                      <Text className={styles.addressLine}>
                        {address.phone}
                      </Text>
                    )}
                  </div>
                  <div className={styles.addressActions}>
                    {!address.isDefault && (
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={(e) => handleSetDefault(address, e)}
                        title="Set as default"
                        loading={setDefaultAddress.isPending}
                      >
                        <Check size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => handleDeleteAddress(address, e)}
                      title="Delete address"
                      loading={deleteAddress.isPending}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="subtle"
              leftSection={<Plus size={18} />}
              onClick={() => setViewOverride('add-new')}
              className={styles.addNewButton}
              fullWidth
            >
              Add new address
            </Button>
          </>
        ) : view === 'verify-phone' ? (
          <Stack gap="lg" align="center" py="xl">
            <Stack gap={4} align="center">
              <Text size="sm" c="dimmed">
                Enter the 6-digit code sent to
              </Text>
              <Text size="sm" fw={600} c="white">
                +{addressData?.phone.slice(0, 1)}{' '}
                {formatPhone(addressData?.phone.slice(1) ?? '')}
              </Text>
            </Stack>

            <PinInput
              length={6}
              type="number"
              size="md"
              value={otpValue}
              onChange={setOtpValue}
              onComplete={handleVerifyOtp}
              disabled={otpMutation.isPending}
            />

            {otpMutation.isPending && (
              <Text size="sm" c="dimmed">
                Verifying...
              </Text>
            )}

            {otpMutation.isError && (
              <Text size="sm" c="red">
                {getErrorMessage(otpMutation.error)}
              </Text>
            )}

            {countdown > 0 && (
              <Text size="sm" c="dimmed">
                Code expires in {formatCountdown(countdown)}
              </Text>
            )}

            <Anchor
              size="sm"
              c="dimmed"
              onClick={handleResendOtp}
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
          </Stack>
        ) : (
          <div className={styles.addressForm}>
            <Elements
              stripe={getStripePromise()}
              options={{ appearance: stripeAppearance }}
            >
              <AddressFormInner
                addressCount={addresses.length}
                defaultPhone={user?.phone}
                onAddressChange={handleAddressChange}
              />
            </Elements>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="transparent"
          color="white"
          leftSection={<ArrowLeft size={18} />}
          onClick={handleBack}
          className={styles.cancelButton}
        >
          {view === 'add-new' && addresses.length > 0 ? 'Back' : 'Cancel'}
        </Button>
        {view === 'add-new' && (
          <Button
            variant="filled"
            onClick={handleSaveAddress}
            loading={createAddress.isPending || checkPhone.isPending}
            disabled={!isAddressComplete}
          >
            Save Address
          </Button>
        )}
      </div>
    </Modal>
  );
}
