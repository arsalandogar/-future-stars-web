import { useMemo } from 'react';
import { Loader, Text } from '@mantine/core';
import {
  prepareTemplate,
  withPresetColors,
  withPresetTextColors,
  applyEditsForRender,
} from '@fs-card-engine';

import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';
import { useTemplateSvgJson } from '@/features/templates';

import type { ColorPair } from '@/features/color-palettes';

interface ColoredTemplateThumbnailProps {
  templateId: number;
  templateName: string;
  /** Color pairs from the palette (bg + fg per area). */
  colorPairs: ColorPair[];
}

export function ColoredTemplateThumbnail({
  templateId,
  templateName,
  colorPairs,
}: ColoredTemplateThumbnailProps) {
  const { data: svgNode, isLoading } = useTemplateSvgJson({
    variables: templateId,
  });

  const renderedNode = useMemo(() => {
    if (!svgNode) return null;

    const { workingCopy, fields } = prepareTemplate(svgNode, {
      includeTouchTargets: false,
    });

    if (fields.colorFields.length > 0 && colorPairs.length > 0) {
      const bgColors = colorPairs.map((p) => p.bg);
      const edits = withPresetColors({}, fields.colorFields, bgColors);
      withPresetTextColors(fields.textFields, fields.colorFields, colorPairs);
      applyEditsForRender(fields, edits);
    }

    return workingCopy;
  }, [svgNode, colorPairs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="xs" />
      </div>
    );
  }

  if (!renderedNode) {
    return (
      <div className="flex items-center justify-center h-full">
        <Text c="dimmed" size="xs">
          No preview
        </Text>
      </div>
    );
  }

  return (
    <SvgRenderer
      node={renderedNode}
      revision={0}
      options={{
        getRootProps: () => ({
          'aria-label': templateName,
        }),
      }}
    />
  );
}
