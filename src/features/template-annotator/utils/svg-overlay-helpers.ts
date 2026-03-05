import type { TouchBounds } from '../types';
import { ANNOTATOR_SVG_WRAPPER_CLASS } from './svg-node-helpers';

export {
  CARD_WIDTH,
  CARD_HEIGHT,
  hasBleeds,
  getCardBounds,
} from '@fs-card-engine';

export type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const MIN_SIZE = 10;

export const HANDLES: {
  id: HandleId;
  cx: (b: TouchBounds) => number;
  cy: (b: TouchBounds) => number;
}[] = [
  { id: 'nw', cx: (b) => b.x, cy: (b) => b.y },
  { id: 'n', cx: (b) => b.x + b.width / 2, cy: (b) => b.y },
  { id: 'ne', cx: (b) => b.x + b.width, cy: (b) => b.y },
  { id: 'e', cx: (b) => b.x + b.width, cy: (b) => b.y + b.height / 2 },
  { id: 'se', cx: (b) => b.x + b.width, cy: (b) => b.y + b.height },
  { id: 's', cx: (b) => b.x + b.width / 2, cy: (b) => b.y + b.height },
  { id: 'sw', cx: (b) => b.x, cy: (b) => b.y + b.height },
  { id: 'w', cx: (b) => b.x, cy: (b) => b.y + b.height / 2 },
];

export const HANDLE_CURSORS: Record<HandleId, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

export function clampToViewBox(
  bounds: TouchBounds,
  vb: TouchBounds
): TouchBounds {
  let { x, y, width, height } = bounds;
  width = Math.min(width, vb.width);
  height = Math.min(height, vb.height);
  x = Math.max(vb.x, Math.min(x, vb.x + vb.width - width));
  y = Math.max(vb.y, Math.min(y, vb.y + vb.height - height));
  return { x, y, width, height };
}

export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): { svgPt: DOMPoint; ctmInverse: DOMMatrix } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const ctmInverse = ctm.inverse();
  const svgPt = new DOMPoint(clientX, clientY).matrixTransform(ctmInverse);
  return { svgPt, ctmInverse };
}

export function parseViewBox(viewBox: string): TouchBounds {
  const parts = viewBox.split(/[\s,]+/).map(Number);
  return {
    x: parts[0] || 0,
    y: parts[1] || 0,
    width: parts[2] || 500,
    height: parts[3] || 500,
  };
}

export function applyResizeDelta(
  handle: HandleId,
  startBounds: TouchBounds,
  dx: number,
  dy: number
): TouchBounds {
  let { x, y, width, height } = startBounds;

  if (handle === 'nw' || handle === 'w' || handle === 'sw') {
    const newX = x + dx;
    const newW = width - dx;
    if (newW >= MIN_SIZE) {
      x = newX;
      width = newW;
    }
  }
  if (handle === 'ne' || handle === 'e' || handle === 'se') {
    const newW = width + dx;
    if (newW >= MIN_SIZE) {
      width = newW;
    }
  }

  if (handle === 'nw' || handle === 'n' || handle === 'ne') {
    const newY = y + dy;
    const newH = height - dy;
    if (newH >= MIN_SIZE) {
      y = newY;
      height = newH;
    }
  }
  if (handle === 'sw' || handle === 's' || handle === 'se') {
    const newH = height + dy;
    if (newH >= MIN_SIZE) {
      height = newH;
    }
  }

  return { x, y, width, height };
}

export function querySvgElement(): SVGSVGElement | null {
  return document.querySelector<SVGSVGElement>(
    `.${ANNOTATOR_SVG_WRAPPER_CLASS} svg`
  );
}
