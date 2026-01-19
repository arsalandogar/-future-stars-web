import { Image } from '@mantine/core';

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
            <Image
              src={card.frontCardImage}
              alt="Card"
              fit="cover"
              className={styles.cardImage}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
