import type { INode } from 'svgson';

/** Re-export svgson's INode as SvgJsonNode. */
export type SvgJsonNode = INode;

export type ColorTarget = 'fill' | 'stroke' | 'stop-color';

/** OKLAB offset stored as L/a/b deltas. */
export interface OklabOffset {
  deltaL: number;
  deltaA: number;
  deltaB: number;
}

export interface ImageEdit {
  url: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export type EditValue = string | ImageEdit;

export function isImageEdit(value: EditValue | undefined): value is ImageEdit {
  return typeof value === 'object' && value !== null && 'url' in value;
}

/** Extract the plain string from an edit value (string or ImageEdit). */
export function getEditValue(value: EditValue | undefined): string | undefined {
  if (!value) return undefined;
  return isImageEdit(value) ? value.url : value;
}

export const DEFAULT_IMAGE_POSITION = { zoom: 1, offsetX: 0, offsetY: 0 };
