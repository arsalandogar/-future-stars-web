import { Text } from '@mantine/core';

import { MAX_PACK_CARDS } from '@/types';

import styles from './pack-add-more-banner.module.css';

interface PackAddMoreBannerProps {
  totalQuantity: number;
}

export function PackAddMoreBanner({ totalQuantity }: PackAddMoreBannerProps) {
  const remaining = MAX_PACK_CARDS - totalQuantity;

  if (remaining <= 0) return null;

  return (
    <div className={styles.container}>
      <Text size="sm" c="white">
        You can still add <strong>{remaining} cards</strong> to your pack!
      </Text>
      <button type="button" className={styles.link}>
        Add more Cards
      </button>
    </div>
  );
}
