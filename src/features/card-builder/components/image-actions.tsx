import { Text } from '@mantine/core';
import { CloudUpload, Trash2 } from 'lucide-react';

import styles from './image-actions.module.css';

interface ImageActionsProps {
  hasImage: boolean;
  disabled: boolean;
  onUpload: () => void;
  onDelete: () => void;
}

export function ImageActions({
  hasImage,
  disabled,
  onUpload,
  onDelete,
}: ImageActionsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionCard}
          onClick={onUpload}
          disabled={disabled}
          aria-label="Upload image"
        >
          <CloudUpload size={24} />
          <Text size="xs">Upload</Text>
        </button>

        <button
          type="button"
          className={styles.actionCard}
          onClick={onDelete}
          disabled={disabled || !hasImage}
          aria-label="Delete image"
        >
          <Trash2 size={24} />
          <Text size="xs">Delete</Text>
        </button>
      </div>

      <Text size="xs" c="dimmed" ta="center" mt="md">
        *High resolution images work best
      </Text>
    </div>
  );
}
