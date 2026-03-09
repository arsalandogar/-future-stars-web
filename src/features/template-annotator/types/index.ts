import type { EditableFieldId } from '@/features/templates';

import type { ColorTarget, TouchBounds } from '@/types/svg';
import type { OklabOffset } from '@/utils/color-math';

export type { ColorTarget, TouchBounds } from '@/types/svg';
export type { ClusterMember } from '@/utils/color-math';

export interface FieldAssignment {
  nodeId: string;
  fieldId: EditableFieldId;
  colorTarget?: ColorTarget;
  colorOffset?: OklabOffset;
  maxWidth?: number;
  maxHeight?: number;
  touchBounds?: TouchBounds;
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
