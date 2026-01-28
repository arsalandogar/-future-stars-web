import { Text } from '@mantine/core';

import type { Pack } from '@/types';
import { MAX_PACK_CARDS } from '@/types';

import { usePackAutofillModalStore } from '../stores/pack-autofill-modal-store';

import styles from './pack-add-more-banner.module.css';

interface PackAddMoreBannerProps {
  pack: Pack;
  totalQuantity: number;
}

export function PackAddMoreBanner({
  pack,
  totalQuantity,
}: PackAddMoreBannerProps) {
  const openAutofillModal = usePackAutofillModalStore((state) => state.open);
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
        onClick={() => openAutofillModal(pack)}
      >
        Add more Cards
      </button>
    </div>
  );
}
