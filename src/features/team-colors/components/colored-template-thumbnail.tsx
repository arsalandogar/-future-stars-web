import { useMemo } from 'react';
import { Loader, Text } from '@mantine/core';
import {
  prepareTemplate,
  withPresetColors,
  applyEditsForRender,
} from '@fs-card-engine';

import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';
import { useTemplateSvgJson } from '@/features/templates';

interface ColoredTemplateThumbnailProps {
  templateId: number;
  templateName: string;
  /** Flat array of color hex strings (bg values from color pairs). */
  presetColors: string[];
}

export function ColoredTemplateThumbnail({
  templateId,
  templateName,
  presetColors,
}: ColoredTemplateThumbnailProps) {
  const { data: svgNode, isLoading } = useTemplateSvgJson({
    variables: templateId,
  });

  const renderedNode = useMemo(() => {
    if (!svgNode) return null;

    const { workingCopy, fields } = prepareTemplate(svgNode, {
      includeTouchTargets: false,
    });

    if (fields.colorFields.length > 0 && presetColors.length > 0) {
      const edits = withPresetColors({}, fields.colorFields, presetColors);
      applyEditsForRender(fields, edits);
    }

    return workingCopy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgNode, JSON.stringify(presetColors)]);

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
