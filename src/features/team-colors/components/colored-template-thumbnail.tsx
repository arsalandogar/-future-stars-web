import { useMemo } from 'react';
import { Loader, Text } from '@mantine/core';
import {
  prepareTemplate,
  withPresetColors,
  withPresetTextColors,
  applyEditsForRender,
  hasBleeds,
  getCardBounds,
} from '@fs-card-engine';

import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';
import { useTemplateSvgJson } from '@/features/templates';

import type { ColorPair } from '@/features/color-palettes';
import type { SvgJsonNode, TouchBounds } from '@/types/svg';

function parseViewBox(viewBox: string | undefined): TouchBounds | null {
  if (!viewBox) return null;
  const parts = viewBox.split(/[\s,]+/).map(Number);
  if (parts.length < 4 || parts.some((p) => !Number.isFinite(p))) return null;
  const [x, y, width, height] = parts;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

function formatViewBox(bounds: TouchBounds): string {
  return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
}

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
      applyEditsForRender(fields, edits);
      withPresetTextColors(fields.textFields, fields.colorFields, colorPairs);
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
        getRootProps: (node: SvgJsonNode) => {
          const viewBox = parseViewBox(node.attributes.viewBox);
          if (!viewBox || !hasBleeds(viewBox)) {
            return { 'aria-label': templateName, overflow: 'hidden' };
          }
          return {
            'aria-label': templateName,
            viewBox: formatViewBox(getCardBounds(viewBox)),
            overflow: 'hidden',
          };
        },
      }}
    />
  );
}
