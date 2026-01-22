import { Text, Title } from '@mantine/core';
import { Check } from 'lucide-react';

import type { Address } from '@/types';

import styles from './checkout-shipping-section.module.css';

interface CheckoutShippingSectionProps {
  address: Address | null;
  onEdit: () => void;
}

export function CheckoutShippingSection({
  address,
  onEdit,
}: CheckoutShippingSectionProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title order={3} className={styles.title}>
          Shipping Address
        </Title>
        <button type="button" className={styles.editButton} onClick={onEdit}>
          Edit
        </button>
      </div>

      {address ? (
        <div className={styles.addressCard}>
          <div className={styles.addressInfo}>
            <Text className={styles.addressName}>
              {address.firstName} {address.lastName}
            </Text>
            <Text className={styles.addressLine}>{address.addressLine1}</Text>
            {address.addressLine2 && (
              <Text className={styles.addressLine}>{address.addressLine2}</Text>
            )}
            <Text className={styles.addressLine}>
              {address.city}, {address.state} {address.postalCode}
            </Text>
            {address.phone && (
              <Text className={styles.addressLine}>{address.phone}</Text>
            )}
          </div>
          <div className={styles.checkIcon}>
            <Check size={16} strokeWidth={3} />
          </div>
        </div>
      ) : (
        <div className={styles.addressCard}>
          <Text c="dimmed">No address added yet. Click Edit to add one.</Text>
        </div>
      )}
    </div>
  );
}
