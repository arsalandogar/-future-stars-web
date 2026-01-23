import { Button, Modal, Text, Title } from '@mantine/core';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';

import styles from './payment-modal.module.css';

interface PaymentFormProps {
  onPaymentSuccess: () => void;
  amount: number;
  orderId: number;
}

function PaymentForm({ onPaymentSuccess, amount, orderId }: PaymentFormProps) {
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
        return_url: `${window.location.origin}/order-success/${orderId}`,
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
        <PaymentElement options={{ layout: 'tabs' }} />
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
  amount: number;
  orderId: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  opened,
  onClose,
  amount,
  orderId,
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
      <PaymentForm
        onPaymentSuccess={onPaymentSuccess}
        amount={amount}
        orderId={orderId}
      />
    </Modal>
  );
}
