import { CardSidePreview } from '@/components/card-side-preview';

import type { PackCard } from '@/types';

import styles from './pack-cards-preview.module.css';

interface PackCardsPreviewProps {
  packCards: PackCard[];
}

export function PackCardsPreview({ packCards }: PackCardsPreviewProps) {
  if (packCards.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        {packCards.map((pc) => (
          <div key={pc.card.id} className={styles.card}>
            <CardSidePreview
              card={pc.card}
              className={styles.cardImage}
              badgeSize="xs"
            />
            {pc.quantity > 1 && (
              <span className={styles.quantityBadge}>{pc.quantity}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
