import type { EditableFieldId } from '@/features/templates';

import type { ColorTarget, TouchBounds } from '@/types/svg';
import type { OklabOffset } from '@/utils/color-math';

export type { ColorTarget, TouchBounds } from '@/types/svg';
export type { ClusterMember } from '@/utils/color-math';

export type TextAlign = 'left' | 'center' | 'right';
export type SvgTextAnchor = 'start' | 'middle' | 'end';

export const ALIGN_TO_TEXT_ANCHOR: Record<TextAlign, SvgTextAnchor> = {
  left: 'start',
  center: 'middle',
  right: 'end',
};

export const TEXT_ANCHOR_TO_ALIGN: Record<SvgTextAnchor, TextAlign> = {
  start: 'left',
  middle: 'center',
  end: 'right',
};

export interface FieldAssignment {
  nodeId: string;
  fieldId: EditableFieldId;
  colorTarget?: ColorTarget;
  colorOffset?: OklabOffset;
  maxWidth?: number;
  maxHeight?: number;
  multiline?: boolean;
  touchBounds?: TouchBounds;
  textAlign?: TextAlign;
  /** Links this text element to a color area for foreground color application. */
  textColorArea?: EditableFieldId;
}

export interface NodeMeta {
  nodeId: string;
  tagName: string;
  label: string;
  hasFill: boolean;
  hasStroke: boolean;
  hasStopColor: boolean;
  isTextElement: boolean;
  isImageElement: boolean;
  parentNodeId: string | null;
  depth: number;
}

export interface ColorOccurrence {
  nodeId: string;
  colorTarget: ColorTarget;
}

export interface DetectedColor {
  hex: string; // normalized 6-digit lowercase hex
  occurrences: ColorOccurrence[];
}

export interface DetectedText {
  nodeId: string;
  textContent: string;
  tagName: string;
}

export interface DetectedImage {
  nodeId: string;
  href: string;
  width: string | undefined;
  height: string | undefined;
}
