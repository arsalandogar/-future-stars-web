import { Image } from '@mantine/core';

import styles from './card-item.module.css';

interface CardItemProps {
  imageUrl: string;
  alt?: string;
  onClick?: () => void;
}

export function CardItem({ imageUrl, alt = 'Card', onClick }: CardItemProps) {
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
      <Image
        src={imageUrl}
        alt={alt}
        fit="cover"
        className={styles.image}
        loading="lazy"
      />
    </div>
  );
}
