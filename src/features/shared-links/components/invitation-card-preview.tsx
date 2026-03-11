import { Image } from '@mantine/core';

import type { Card } from '@/types';

import styles from './invitation-card-preview.module.css';

interface InvitationCardPreviewProps {
  card: Card;
}

export function InvitationCardPreview({ card }: InvitationCardPreviewProps) {
  return (
    <div className={styles.cards}>
      <Image
        src={card.frontCardImage}
        alt="Card front"
        fit="contain"
        className={styles.cardImage}
      />
      <Image
        src={card.backCardImage}
        alt="Card back"
        fit="contain"
        className={styles.cardImage}
      />
    </div>
  );
}
