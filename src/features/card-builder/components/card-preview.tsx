import { AspectRatio, Button, Loader } from '@mantine/core';
import { ArrowRight, Plus } from 'lucide-react';

import type { SvgJsonNode } from '../types';
import { useTemplateSvgJson } from '../api/get-template-svg-json';

import { SvgRenderer } from './svg-renderer';
import styles from './card-preview.module.css';

interface CardPreviewProps {
  templateId: number | null;
}

function CardContent({
  svgNode,
  isLoading,
}: {
  svgNode?: SvgJsonNode;
  isLoading: boolean;
}) {
  if (isLoading || !svgNode) {
    return (
      <div className={styles.placeholder}>
        <Loader color="gray" size="lg" />
      </div>
    );
  }

  return <SvgRenderer node={svgNode} className={styles.svg} />;
}

export function CardPreview({ templateId }: CardPreviewProps) {
  const { data: svgNode, isLoading } = useTemplateSvgJson({
    variables: templateId!,
    enabled: !!templateId,
  });

  const hasTemplate = !!templateId;
  const frameClass = hasTemplate ? styles.frameless : '';

  return (
    <div className={styles.container}>
      <div className={`${styles.outerFrame} ${frameClass}`}>
        <div className={`${styles.innerFrame} ${frameClass}`}>
          <AspectRatio ratio={2.5 / 3.5}>
            {hasTemplate ? (
              <CardContent svgNode={svgNode} isLoading={isLoading} />
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
