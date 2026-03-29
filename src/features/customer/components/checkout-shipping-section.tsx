import { Text, Title } from '@mantine/core';
import { Check, Plus } from 'lucide-react';

import type { Address } from '@/types';

import styles from './checkout-shipping-section.module.css';

interface CheckoutShippingSectionProps {
  address: Address | null;
  onEdit: () => void;
  error?: boolean;
}

export function CheckoutShippingSection({
  address,
  onEdit,
  error,
}: CheckoutShippingSectionProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title order={3} className={styles.title}>
          Shipping Address
        </Title>
        {address && (
          <button type="button" className={styles.editButton} onClick={onEdit}>
            Edit
          </button>
        )}
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
        <button
          type="button"
          className={styles.addAddressButton}
          onClick={onEdit}
        >
          <div className={styles.addAddressIcon}>
            <Plus size={20} />
          </div>
          <Text size="sm" fw={500} c="white">
            Add New Address
          </Text>
        </button>
      )}
      {error && (
        <Text size="xs" c="red">
          Please add a shipping address to continue
        </Text>
      )}
    </div>
  );
}
