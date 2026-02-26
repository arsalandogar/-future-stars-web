import type { EditableFieldId } from '@/features/templates';

export type ColorTarget = 'fill' | 'stroke' | 'stop-color';

export interface FieldAssignment {
  nodeId: string;
  fieldId: EditableFieldId;
  colorTarget?: ColorTarget;
  maxWidth?: number;
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

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationResult {
  severity: ValidationSeverity;
  code: string;
  message: string;
  nodeId?: string;
  fieldId?: EditableFieldId;
}
