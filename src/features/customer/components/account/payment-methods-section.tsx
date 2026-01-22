import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { Button, Group, Loader, Modal, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ArrowLeft, CreditCard, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { stripeAppearance, stripePromise } from '@/lib/stripe';

import { useCreateSetupIntent } from '../../api/create-setup-intent';
import { useDeletePaymentMethod } from '../../api/delete-payment-method';
import {
  type PaymentMethod,
  usePaymentMethods,
} from '../../api/get-payment-methods';
import { useSetDefaultPayment } from '../../api/set-default-payment';
import styles from './account-section.module.css';
import paymentModalStyles from '../payment-modal.module.css';

function formatCardBrand(brand: string): string {
  const brands: Record<string, string> = {
    visa: 'VISA',
    mastercard: 'MASTERCARD',
    amex: 'AMEX',
    discover: 'DISCOVER',
    diners: 'DINERS',
    jcb: 'JCB',
    unionpay: 'UNIONPAY',
  };
  return brands[brand.toLowerCase()] ?? brand.toUpperCase();
}

export function PaymentMethodsSection() {
  const { data, isLoading } = usePaymentMethods();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSetupIntent, setIsLoadingSetupIntent] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  const deletePaymentMethod = useDeletePaymentMethod();
  const setDefaultPayment = useSetDefaultPayment();
  const createSetupIntent = useCreateSetupIntent();

  // Fetch SetupIntent when modal opens
  useEffect(() => {
    if (modalOpened && !clientSecret) {
      setIsLoadingSetupIntent(true);
      createSetupIntent.mutateAsync(undefined)
        .then((response) => {
          setClientSecret(response.data.setupIntentSecret);
        })
        .finally(() => {
          setIsLoadingSetupIntent(false);
        });
    }
  }, [modalOpened]);

  const handleCloseModal = () => {
    closeModal();
    // Reset clientSecret when modal closes so a fresh one is fetched next time
    setClientSecret(null);
  };

  const paymentMethods = data?.data ?? [];
  const defaultMethod = paymentMethods.find((pm) => pm.isDefault);
  const otherMethods = paymentMethods.filter((pm) => !pm.isDefault);

  const handleDeleteClick = (method: PaymentMethod) => {
    setMethodToDelete(method);
    openDeleteModal();
  };

  const handleConfirmDelete = () => {
    if (!methodToDelete) return;
    deletePaymentMethod.mutate(methodToDelete.id, {
      onSuccess: () => {
        closeDeleteModal();
        setMethodToDelete(null);
      },
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultPayment.mutate(id);
  };

  if (isLoading) {
    return (
      <div>
        <div className={styles.header}>
          <div>
            <Title order={2} c="white" fw={800} className={styles.title}>
              Payment Methods
            </Title>
            <Text component="span" c="dimmed" size="md" display="block">
              Manage your payment methods
            </Text>
          </div>
        </div>
        <div className={styles.card} style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <Title order={2} c="white" fw={800} className={styles.title}>
            Payment Methods
          </Title>
          <Text component="span" c="dimmed" size="md" display="block">
            Manage your payment methods
          </Text>
        </div>
      </div>

      <div className={styles.cardsList}>
        {defaultMethod && (
          <PaymentMethodCard
            method={defaultMethod}
            isDefault
            onDelete={() => handleDeleteClick(defaultMethod)}
          />
        )}

        {otherMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onDelete={() => handleDeleteClick(method)}
            onSetDefault={() => handleSetDefault(method.id)}
          />
        ))}

        {paymentMethods.length === 0 && (
          <div className={styles.card}>
            <Text c="dimmed" ta="center" py="xl">
              No payment methods saved yet
            </Text>
          </div>
        )}
      </div>

      <div className={styles.actions} style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
        <Button
          variant="filled"
          radius="xl"
          leftSection={<CreditCard size={18} />}
          onClick={openModal}
        >
          Add Payment Method
        </Button>
      </div>

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={
          <Title order={4} className={paymentModalStyles.modalTitle}>
            Add Payment Method
          </Title>
        }
        centered
        size="md"
        classNames={{
          content: paymentModalStyles.content,
          body: paymentModalStyles.body,
          header: paymentModalStyles.header,
        }}
      >
        {isLoadingSetupIntent ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader size="lg" />
          </div>
        ) : clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: stripeAppearance,
            }}
          >
              <AddPaymentMethodForm onSuccess={handleCloseModal} />
            </Elements>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={
          <Title order={4} c="white">
            Delete Payment Method
          </Title>
        }
        centered
        size="sm"
        classNames={{
          content: paymentModalStyles.content,
          body: paymentModalStyles.body,
          header: paymentModalStyles.header,
        }}
        styles={{
          header: {
            borderBottom: '1px solid var(--mantine-color-primary-4)',
          },
        }}
      >
        <Text c="dimmed" size="md">
          Are you sure you want to delete{' '}
          <Text component="span" c="white" fw={500}>
            {methodToDelete?.card ? `${formatCardBrand(methodToDelete.card.brand)} (••••${methodToDelete.card.last4})` : 'this payment method'}
          </Text>
          ?
        </Text>
        <Group justify="space-between" mt="xl">
          <Button
            variant="transparent"
            color="white"
            leftSection={<ArrowLeft size={18} />}
            onClick={closeDeleteModal}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="red"
            radius="xl"
            leftSection={<Trash2 size={18} />}
            onClick={handleConfirmDelete}
            loading={deletePaymentMethod.isPending}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </div>
  );
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isDefault?: boolean;
  onDelete: () => void;
  onSetDefault?: () => void;
}

function PaymentMethodCard({
  method,
  isDefault,
  onDelete,
  onSetDefault,
}: PaymentMethodCardProps) {
  if (!method.card) return null;

  const { brand, last4, exp_month, exp_year } = method.card;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mantine-spacing-sm)' }}>
          <Text c="white" fw={500} size="md" style={{ margin: 0 }}>
            Credit Card {formatCardBrand(brand)} ({last4})
          </Text>
          {isDefault ? (
            <Button size="compact-xs" radius="xl" variant="filled">
              Default
            </Button>
          ) : (
            onSetDefault && (
              <Button size="compact-xs" radius="xl" variant="outline" onClick={onSetDefault}>
                Default
              </Button>
            )
          )}
        </div>
        <Button
          size="compact-xs"
          variant="transparent"
          onClick={onDelete}
          fw={700}
          style={{ color: 'var(--mantine-primary-color-light-color)' }}
        >
          Remove
        </Button>
      </div>
      <Text c="dimmed" size="sm" style={{ margin: 0 }}>
        Exp {exp_month.toString().padStart(2, '0')}/{exp_year}
      </Text>
    </div>
  );
}

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
}

function AddPaymentMethodForm({ onSuccess }: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/account',
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message ?? 'An error occurred');
      setIsLoading(false);
    } else {
      // Invalidate payment methods query to refetch
      void queryClient.invalidateQueries({ queryKey: ['customer', 'payment-methods'] });
      onSuccess();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mantine-spacing-lg)' }}>
      <div style={{ minHeight: 200 }}>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
            defaultValues: {
              billingDetails: {
                address: {
                  country: 'US',
                },
              },
            },
            terms: {
              card: 'always',
            },
          }}
        />
      </div>

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      <div style={{ display: 'flex', gap: 'var(--mantine-spacing-sm)', justifyContent: 'flex-end' }}>
        <Button
          variant="filled"
          radius="xl"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!stripe || !elements}
        >
          Add Payment Method
        </Button>
      </div>
    </div>
  );
}
