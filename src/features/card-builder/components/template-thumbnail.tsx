import { AspectRatio } from '@mantine/core';

import styles from './template-thumbnail.module.css';

interface TemplateThumbnailProps {
  imageUrl: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function TemplateThumbnail({
  imageUrl,
  label,
  selected,
  onClick,
}: TemplateThumbnailProps) {
  return (
    <button
      type="button"
      className={styles.thumbnail}
      data-selected={selected || undefined}
      onClick={onClick}
    >
      <AspectRatio ratio={2.5 / 3.5}>
        <img
          src={imageUrl}
          alt={label}
          className={styles.image}
          loading="lazy"
          decoding="async"
        />
      </AspectRatio>
    </button>
  );
}
