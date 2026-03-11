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

export interface TouchBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageEdit {
  url: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  sourceWidth?: number;
  sourceHeight?: number;
  /** Pre-computed cover-aware SVG attributes from frontend. */
  computedX?: number;
  computedY?: number;
  computedWidth?: number;
  computedHeight?: number;
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

/** Minimum zoom level for image fields. */
export const ZOOM_MIN = 0.5;

/** Maximum zoom level for image fields. */
export const ZOOM_MAX = 2;

/** Standard card dimensions (safe zone). */
export const CARD_WIDTH = 750;
export const CARD_HEIGHT = 1050;

/** Card dimensions with bleeds (extra area trimmed during printing). */
export const CARD_BLEED_WIDTH = 833.34;
export const CARD_BLEED_HEIGHT = 1133.34;

/** Returns true when the viewBox is larger than the standard card safe zone. */
export function hasBleeds(vb: TouchBounds): boolean {
  return vb.width > CARD_WIDTH || vb.height > CARD_HEIGHT;
}

/** Returns the card safe zone within a (possibly larger) viewBox. */
export function getCardBounds(vb: TouchBounds): TouchBounds {
  if (!hasBleeds(vb)) return vb;
  return {
    x: vb.x + (vb.width - CARD_WIDTH) / 2,
    y: vb.y + (vb.height - CARD_HEIGHT) / 2,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  };
}
