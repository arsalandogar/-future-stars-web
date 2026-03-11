import type { EditableFieldId } from '@/features/templates';
import type { SvgJsonNode, TouchBounds } from '@/types/svg';
import type { SvgRenderOptions } from '@/components/svg-renderer/svg-renderer';

import {
  TOUCH_TARGET_ATTR,
  TOUCH_TARGET_TYPE_ATTR,
  getCardBounds,
  hasBleeds,
} from '@fs-card-engine';

import { IMAGE_FIELD_ATTR } from './use-preview-gestures';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';

function parseViewBox(viewBox: string | undefined): TouchBounds | null {
  if (!viewBox) return null;

  const parts = viewBox.split(/[\s,]+/).map(Number);
  if (parts.length < 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [x, y, width, height] = parts;
  if (width <= 0 || height <= 0) return null;

  return { x, y, width, height };
}

function formatViewBox(bounds: TouchBounds): string {
  return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
}

export function useCardPreviewRenderOptions(
  wasDragRef: React.RefObject<boolean>
): SvgRenderOptions {
  const setActiveTab = useCardBuilderStore((s) => s.setActiveTab);
  const setSelectedImageFieldId = useCardBuilderStore(
    (s) => s.setSelectedImageFieldId
  );
  const setFocusedFieldId = useCardEditorStore((s) => s.setFocusedFieldId);

  const imageProps = (fieldId: string) => ({
    [IMAGE_FIELD_ATTR]: fieldId,
    style: { cursor: 'pointer', touchAction: 'none' } as const,
    onClick: () => {
      if (wasDragRef.current) return;
      setActiveTab('photo');
      setSelectedImageFieldId(fieldId as EditableFieldId);
    },
  });

  const textProps = (fieldId: string) => ({
    style: { cursor: 'pointer' } as const,
    onClick: () => {
      setActiveTab('content');
      setFocusedFieldId(fieldId as EditableFieldId);
    },
  });

  return {
    getRootProps: (node: SvgJsonNode) => {
      const viewBox = parseViewBox(node.attributes.viewBox);
      if (!viewBox || !hasBleeds(viewBox)) return undefined;

      return {
        viewBox: formatViewBox(getCardBounds(viewBox)),
      };
    },
    getNodeProps: (node: SvgJsonNode) => {
      // Touch target overlay rects injected by prepareTemplate
      const touchTarget = node.attributes[TOUCH_TARGET_ATTR] as
        | string
        | undefined;
      if (touchTarget) {
        const targetType = node.attributes[TOUCH_TARGET_TYPE_ATTR];
        if (targetType === 'image') return imageProps(touchTarget);
        if (targetType === 'text') return textProps(touchTarget);
      }

      const imageFieldId = node.attributes['data-image-field'] as
        | string
        | undefined;
      if (imageFieldId) return imageProps(imageFieldId);

      if (node.name !== 'text') return undefined;

      const fieldId = node.attributes['data-text-field'] as string | undefined;
      if (!fieldId) return undefined;

      return textProps(fieldId);
    },
  };
}
