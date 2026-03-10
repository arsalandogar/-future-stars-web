import { AspectRatio, Button, Skeleton, Text } from '@mantine/core';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';

import { FlipIcon } from '@/components/icons/flip-icon';
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

type CardContentProps = Omit<
  CardPreviewProps,
  'hasTemplate' | 'onSelectTemplate'
>;

function CardContent({
  svgNode,
  isLoading,
  isError,
  onRetry,
  options,
}: CardContentProps) {
  // Passed through to SvgRenderer so React re-renders the mutated SVG tree
  // without remounting the entire preview subtree on each text edit.
  const revision = useCardEditorStore((s) => s.sides[s.activeSide].revision);

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
      <div className={styles.skeletonContainer} aria-hidden="true">
        <Skeleton radius={0} className={styles.skeletonFill} />
      </div>
    );
  }

  return (
    <SvgRenderer
      node={svgNode}
      revision={revision}
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
  const activeSide = useCardEditorStore((s) => s.activeSide);
  const hasBackWorkingCopy = useCardEditorStore(
    (s) => s.sides.back.workingCopy !== null
  );
  const setActiveSide = useCardEditorStore((s) => s.setActiveSide);

  const canFlip = hasTemplate && hasBackWorkingCopy && !isLoading;

  const handleFlip = () => {
    setActiveSide(activeSide === 'front' ? 'back' : 'front');
  };

  return (
    <div className={styles.container}>
      <Text className={styles.sideLabel}>
        {activeSide === 'front' ? 'FRONT' : 'BACK'}
      </Text>

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

      {canFlip && (
        <button
          type="button"
          className={styles.flipButton}
          onClick={handleFlip}
        >
          <FlipIcon size={18} />
          Flip
        </button>
      )}

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
