import { AspectRatio, Button } from '@mantine/core';
import { ArrowRight, Plus } from 'lucide-react';

import type { BrowseTemplate } from '@/features/templates-browse';

import styles from './card-preview.module.css';

interface CardPreviewProps {
  template: BrowseTemplate | null;
}

export function CardPreview({ template }: CardPreviewProps) {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.outerFrame} ${template ? styles.frameless : ''}`}
      >
        <div
          className={`${styles.innerFrame} ${template ? styles.frameless : ''}`}
        >
          <AspectRatio ratio={2.5 / 3.5}>
            {template ? (
              <img
                src={template.templateImage}
                alt={template.label}
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>
                <Plus size={56} strokeWidth={1.5} color="#3a4258" />
              </div>
            )}
          </AspectRatio>
        </div>
      </div>

      {!template && (
        <Button
          fullWidth
          size="md"
          radius="xl"
          rightSection={<ArrowRight size={18} />}
        >
          Select a Template to start
        </Button>
      )}
    </div>
  );
}
