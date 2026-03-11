import { CardSidePreview } from '@/components/card-side-preview';

import type { Card } from '@/types';

import styles from './pack-cards-preview.module.css';

interface PackCardsPreviewProps {
  cards: Card[];
}

export function PackCardsPreview({ cards }: PackCardsPreviewProps) {
  if (cards.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        {cards.map((card) => (
          <div key={card.id} className={styles.card}>
            <CardSidePreview
              imageUrl={card.frontCardImage}
              svgString={card.svgString}
              status={card.status}
              alt="Card"
              className={styles.cardImage}
              badgeSize="xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
