import { AspectRatio, Button, Loader, Text } from '@mantine/core';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';

import type { SvgJsonNode } from '@/types/svg';
import type { SvgRenderOptions } from '@/components/svg-renderer/svg-renderer';

import { useCardEditorStore } from '../stores/card-editor-store';
import { SvgRenderer } from './svg-renderer';
import styles from './card-preview.module.css';

interface CardPreviewProps {
  svgNode: SvgJsonNode | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasTemplate: boolean;
  onSelectTemplate?: () => void;
  options?: SvgRenderOptions;
}

type CardContentProps = Omit<CardPreviewProps, 'hasTemplate'>;

function CardContent({
  svgNode,
  isLoading,
  isError,
  onRetry,
  options,
}: CardContentProps) {
  // Used as key on SvgRenderer to force React to rebuild the SVG tree
  // after in-place text node mutations (React Compiler skips re-render
  // when only the interior of an unchanged object reference is mutated).
  const revision = useCardEditorStore((s) => s.revision);

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

  return (
    <SvgRenderer
      key={revision}
      node={svgNode}
      className={styles.svg}
      options={options}
    />
  );
}

export function CardPreview({
  svgNode,
  isLoading,
  isError,
  onRetry,
  hasTemplate,
  onSelectTemplate,
  options,
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
                options={options}
              />
            ) : (
              <div
                className={styles.placeholder}
                role="img"
                aria-label="No template selected"
              >
                <Plus
                  size={56}
                  strokeWidth={1.5}
                  color="#3a4258"
                  aria-hidden="true"
                />
                <Text size="xs" c="dark.3">
                  Choose a template
                </Text>
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
          onClick={onSelectTemplate}
        >
          Select a Template to start
        </Button>
      )}
    </div>
  );
}
