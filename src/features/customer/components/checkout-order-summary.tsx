import { Checkbox, Text } from '@mantine/core';

import styles from './checkout-order-summary.module.css';

interface CheckoutOrderSummaryProps {
  subtotal: number; // in cents
  shipping: number; // in cents
  total: number; // in cents
  acceptTerms?: boolean;
  onAcceptTermsChange?: (accept: boolean) => void;
  showTerms?: boolean;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CheckoutOrderSummary({
  subtotal,
  shipping,
  total,
  acceptTerms = false,
  onAcceptTermsChange,
  showTerms = false,
}: CheckoutOrderSummaryProps) {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <Text size="lg" className={styles.label}>
          Subtotal
        </Text>
        <Text size="lg" className={styles.value}>
          {formatPrice(subtotal)}
        </Text>
      </div>

      <div className={styles.row}>
        <Text size="lg" className={styles.label}>
          Shipping
        </Text>
        <Text size="lg" className={styles.value}>
          {shipping === 0 ? 'Free' : formatPrice(shipping)}
        </Text>
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <Text size="lg" className={styles.totalLabel}>
          Total
        </Text>
        <Text className={styles.totalValue}>{formatPrice(total)}</Text>
      </div>

      {showTerms && onAcceptTermsChange && (
        <div className={styles.termsSection}>
          <Checkbox
            checked={acceptTerms}
            onChange={(e) => onAcceptTermsChange(e.currentTarget.checked)}
            label={
              <Text size="sm" c="dimmed">
                I agree to the{' '}
                <a href="/terms" target="_blank" className={styles.termsLink}>
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className={styles.termsLink}>
                  Privacy Policy
                </a>
              </Text>
            }
          />
        </div>
      )}
    </div>
  );
}
