import { AspectRatio, Button, Loader, Text } from '@mantine/core';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';

import type { SvgJsonNode } from '@/types/svg';

import { SvgRenderer } from './svg-renderer';
import styles from './card-preview.module.css';

interface CardPreviewProps {
  svgNode: SvgJsonNode | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasTemplate: boolean;
}

type CardContentProps = Omit<CardPreviewProps, 'hasTemplate'>;

function CardContent({
  svgNode,
  isLoading,
  isError,
  onRetry,
}: CardContentProps) {
  if (isError) {
    return (
      <div className={styles.placeholder}>
        <Text c="dimmed" size="sm">
          Failed to load template
        </Text>
        <Button
          variant="subtle"
          size="xs"
          leftSection={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || !svgNode) {
    return (
      <div className={styles.placeholder}>
        <Loader color="gray" size="lg" />
      </div>
    );
  }

  return <SvgRenderer node={svgNode} className={styles.svg} />;
}

export function CardPreview({
  svgNode,
  isLoading,
  isError,
  onRetry,
  hasTemplate,
}: CardPreviewProps) {
  const frameClass = hasTemplate ? styles.frameless : '';

  return (
    <div className={styles.container}>
      <div className={`${styles.outerFrame} ${frameClass}`}>
        <div className={`${styles.innerFrame} ${frameClass}`}>
          <AspectRatio ratio={2.5 / 3.5}>
            {hasTemplate ? (
              <CardContent
                svgNode={svgNode}
                isLoading={isLoading}
                isError={isError}
                onRetry={onRetry}
              />
            ) : (
              <div className={styles.placeholder}>
                <Plus size={56} strokeWidth={1.5} color="#3a4258" />
              </div>
            )}
          </AspectRatio>
        </div>
      </div>

      {!hasTemplate && (
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
