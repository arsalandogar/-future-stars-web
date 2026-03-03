import { Check } from 'lucide-react';

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
        <img
          src={card.frontCardImage}
          alt="Created card front"
          className={`${styles.cardImage} ${styles.frontCard}`}
        />
        <img
          src={card.backCardImage}
          alt="Created card back"
          className={`${styles.cardImage} ${styles.backCard}`}
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
