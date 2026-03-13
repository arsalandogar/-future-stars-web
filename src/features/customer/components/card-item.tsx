import {
  CardSidePreview,
  type CardSidePreviewProps,
} from '@/components/card-side-preview';

import styles from './card-item.module.css';

interface CardItemProps {
  card: CardSidePreviewProps['card'];
  onClick?: () => void;
}

export function CardItem({ card, onClick }: CardItemProps) {
  return (
    <div
      className={styles.card}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <CardSidePreview card={card} className={styles.image} />
    </div>
  );
}
