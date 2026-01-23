import { Button, Modal, Text, Title } from '@mantine/core';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';

import { getStripePromise, stripeAppearance } from '@/lib/stripe';

import styles from './payment-modal.module.css';

interface PaymentFormInnerProps {
  onPaymentSuccess: () => void;
  amount: number;
}

function PaymentFormInner({ onPaymentSuccess, amount }: PaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/order-success',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message ?? 'An unexpected error occurred.');
      setIsProcessing(false);
    } else {
      onPaymentSuccess();
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.paymentElement}>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }}
        />
      </div>

      {errorMessage && (
        <Text c="red" size="sm" className={styles.errorMessage}>
          {errorMessage}
        </Text>
      )}

      <Button
        variant="filled"
        size="lg"
        radius="xl"
        fullWidth
        leftSection={<CreditCard size={20} />}
        onClick={() => void handleSubmit()}
        loading={isProcessing}
        disabled={!stripe || !elements}
        className={styles.payButton}
      >
        Pay ${(amount / 100).toFixed(2)}
      </Button>
    </div>
  );
}

interface PaymentModalProps {
  opened: boolean;
  onClose: () => void;
  clientSecret: string;
  customerSessionClientSecret?: string | null;
  amount: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  opened,
  onClose,
  clientSecret,
  customerSessionClientSecret,
  amount,
  onPaymentSuccess,
}: PaymentModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4} className={styles.modalTitle}>
          Complete Payment
        </Title>
      }
      centered
      size="md"
      classNames={{
        content: styles.content,
        body: styles.body,
        header: styles.header,
      }}
    >
      <Elements
        stripe={getStripePromise()}
        options={{
          clientSecret,
          customerSessionClientSecret: customerSessionClientSecret ?? undefined,
          appearance: stripeAppearance,
        }}
      >
        <PaymentFormInner onPaymentSuccess={onPaymentSuccess} amount={amount} />
      </Elements>
    </Modal>
  );
}
