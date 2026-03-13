import { CardSidePreview } from '@/components/card-side-preview';
import type { Card } from '@/types';

import styles from './invitation-card-preview.module.css';

interface InvitationCardPreviewProps {
  card: Card;
}

export function InvitationCardPreview({ card }: InvitationCardPreviewProps) {
  return (
    <div className={styles.cards}>
      <CardSidePreview card={card} className={styles.cardImage} />
      <CardSidePreview card={card} side="back" className={styles.cardImage} />
    </div>
  );
}
