import { Check } from 'lucide-react';

import { CardSidePreview } from '@/components/card-side-preview';
import {
  BuyCardButton,
  EditCardButton,
  ShareCardButton,
} from '@/components/ui/card-actions';
import type { Card } from '@/types';

import styles from './card-success.module.css';

interface CardSuccessProps {
  card: Card;
}

export function CardSuccess({ card }: CardSuccessProps) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>
        <span className={styles.checkBadge} aria-hidden="true">
          <Check size={40} strokeWidth={3} />
        </span>
        Your Card is Created!
      </h2>

      <div className={styles.cardsStage}>
        <CardSidePreview
          imageUrl={card.frontCardImage}
          svgString={card.svgString}
          status={card.status}
          alt="Created card front"
          className={`${styles.cardImage} ${styles.frontCard}`}
          style={{ width: 'auto' }}
        />
        <CardSidePreview
          imageUrl={card.backCardImage}
          svgString={card.backSvgString}
          status={card.status}
          alt="Created card back"
          className={`${styles.cardImage} ${styles.backCard}`}
          style={{ width: 'auto' }}
        />
      </div>

      <div className={styles.actionsRow}>
        <EditCardButton cardId={card.id} />
        <ShareCardButton disabled />
      </div>

      <BuyCardButton cardId={card.id} className={styles.buyButton} />
    </div>
  );
}
