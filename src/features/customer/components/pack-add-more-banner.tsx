import { Text } from '@mantine/core';

import type { Pack } from '@/types';
import { MAX_PACK_CARDS } from '@/types';

import { useCreatePackModalStore } from '../stores/create-pack-modal-store';

import styles from './pack-add-more-banner.module.css';

interface PackAddMoreBannerProps {
  pack: Pack;
  totalQuantity: number;
}

export function PackAddMoreBanner({
  pack,
  totalQuantity,
}: PackAddMoreBannerProps) {
  const openEdit = useCreatePackModalStore((state) => state.openEdit);
  const remaining = MAX_PACK_CARDS - totalQuantity;

  if (remaining <= 0) return null;

  return (
    <div className={styles.container}>
      <Text size="sm" c="white" m={0}>
        You can still add <strong>{remaining} cards</strong> to your pack!
      </Text>
      <button
        type="button"
        className={styles.link}
        onClick={() => openEdit(pack)}
      >
        Add more Cards
      </button>
    </div>
  );
}
