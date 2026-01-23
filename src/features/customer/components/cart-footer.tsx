import { Text } from '@mantine/core';

import styles from './cart-footer.module.css';

interface CartFooterProps {
  packCount: number;
  totalPrice: number;
}

export function CartFooter({ packCount, totalPrice }: CartFooterProps) {
  return (
    <div className={styles.container}>
      <Text size="xl" c="white" fw={500}>
        {packCount} {packCount === 1 ? 'Pack' : 'Packs'} Added
      </Text>
      <Text size="xl" c="white" fw={700}>
        Total: ${totalPrice.toFixed(2)}
      </Text>
    </div>
  );
}
