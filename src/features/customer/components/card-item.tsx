import { CardSidePreview } from '@/components/card-side-preview';
import type { CardPreviewStatus } from '@/types';

import styles from './card-item.module.css';

interface CardItemProps {
  imageUrl: string | null;
  svgString: string | null;
  status: CardPreviewStatus;
  alt?: string;
  onClick?: () => void;
}

export function CardItem({
  imageUrl,
  svgString,
  status,
  alt = 'Card',
  onClick,
}: CardItemProps) {
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
      <CardSidePreview
        imageUrl={imageUrl}
        svgString={svgString}
        status={status}
        alt={alt}
        className={styles.image}
      />
    </div>
  );
}
