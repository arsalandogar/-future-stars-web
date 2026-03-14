import type { TouchBounds } from '../types';

export interface SvgPoint {
  x: number;
  y: number;
}

export interface TransformBasis {
  rotation: number;
}

export interface TextAreaDimensions {
  width: number;
  height: number;
}

/**
 * Prepends a translate(dx, dy) to an existing transform string.
 * SVG transforms compose right-to-left, so prepending applies the translation
 * after all existing transforms.
 */
export function applyTranslate(
  existingTransform: string | undefined,
  dx: number,
  dy: number
): string {
  const translate = `translate(${dx},${dy})`;
  if (!existingTransform) return translate;
  return `${translate} ${existingTransform}`;
}

/**
 * Prepends a scale around a given anchor point to an existing transform.
 * Equivalent to: translate(ax, ay) scale(sx, sy) translate(-ax, -ay)
 * This scales the element relative to the anchor point.
 */
export function applyScaleAroundPoint(
  existingTransform: string | undefined,
  ax: number,
  ay: number,
  sx: number,
  sy: number
): string {
  const scale = `translate(${ax},${ay}) scale(${sx},${sy}) translate(${-ax},${-ay})`;
  if (!existingTransform) return scale;
  return `${scale} ${existingTransform}`;
}

/**
 * Prepends a rotation around a point in SVG root space to an existing transform.
 * Equivalent to: rotate(angleDeg, cx, cy)
 * This rotates the rendered element around its current visual center.
 */
export function applyRotateAroundPoint(
  existingTransform: string | undefined,
  angleDeg: number,
  cx: number,
  cy: number
): string {
  const rotate = `rotate(${angleDeg},${cx},${cy})`;
  if (!existingTransform) return rotate;
  return `${rotate} ${existingTransform}`;
}

/**
 * Removes scale transforms (and their surrounding anchor-translate pairs)
 * from a transform string, preserving standalone translate() functions.
 *
 * The codebase generates scale transforms via `applyScaleAroundPoint` which
 * produces: translate(ax,ay) scale(sx,sy) translate(-ax,-ay)
 * This function strips those triplets plus any bare scale() calls.
 */
export function removeScaleFromTransform(
  transform: string | undefined
): string | undefined {
  if (!transform) return undefined;

  // Tokenize into individual transform functions
  const tokens: string[] = [];
  const re = /(translate|scale|rotate|matrix|skewX|skewY)\([^)]*\)/g;
  let match;
  while ((match = re.exec(transform)) !== null) {
    tokens.push(match[0]);
  }

  // Walk through tokens and remove scale() along with its
  // surrounding anchor-translate pair (translate(ax,ay) scale(...) translate(-ax,-ay))
  const keep: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].startsWith('scale(')) {
      // Bare scale — skip it
      i++;
      continue;
    }

    // Check for the triplet pattern: translate(ax,ay) scale(...) translate(-ax,-ay)
    if (
      i + 2 < tokens.length &&
      tokens[i].startsWith('translate(') &&
      tokens[i + 1].startsWith('scale(') &&
      tokens[i + 2].startsWith('translate(')
    ) {
      // Verify the two translates are inverse of each other
      const nums1 = parseTranslateArgs(tokens[i]);
      const nums2 = parseTranslateArgs(tokens[i + 2]);
      if (
        nums1 &&
        nums2 &&
        Math.abs(nums1[0] + nums2[0]) < 0.001 &&
        Math.abs(nums1[1] + nums2[1]) < 0.001
      ) {
        // Skip the entire triplet
        i += 3;
        continue;
      }
    }

    keep.push(tokens[i]);
    i++;
  }

  if (keep.length === 0) return undefined;
  return keep.join(' ');
}

/**
 * Extracts the first scale(sx, sy) values from a transform string.
 * Returns null if no scale is present.
 */
export function parseScaleValues(
  transform: string | undefined
): { sx: number; sy: number } | null {
  if (!transform) return null;
  const match = transform.match(/scale\(\s*([^,)]+?)\s*(?:,\s*([^)]+?)\s*)?\)/);
  if (!match) return null;
  const sx = parseFloat(match[1].trim());
  const sy = match[2] ? parseFloat(match[2].trim()) : sx;
  if (isNaN(sx) || isNaN(sy)) return null;
  return { sx, sy };
}

export function transformPoint(
  matrix: DOMMatrix,
  x: number,
  y: number
): SvgPoint {
  const pt = new DOMPoint(x, y).matrixTransform(matrix);
  return { x: pt.x, y: pt.y };
}

/**
 * Transforms a direction vector through the linear part of a matrix
 * (ignoring translation). Use to convert deltas between coordinate spaces.
 */
export function transformVector(
  matrix: DOMMatrix,
  dx: number,
  dy: number
): SvgPoint {
  return {
    x: matrix.a * dx + matrix.c * dy,
    y: matrix.b * dx + matrix.d * dy,
  };
}

/**
 * Converts an SVG-root-space affine operation to parent space
 * via conjugation: svgToParent * svgOp * svgToParent^-1
 */
export function conjugateTransform(
  svgToParent: DOMMatrix,
  svgOp: DOMMatrix
): DOMMatrix {
  const parentToSvg = svgToParent.inverse();
  return svgToParent.multiply(svgOp).multiply(parentToSvg);
}

/**
 * Prepends a DOMMatrix as matrix(a,b,c,d,e,f) to an existing transform string.
 */
export function applyMatrixPrepend(
  existingTransform: string | undefined,
  matrix: DOMMatrix
): string {
  const matrixStr = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e},${matrix.f})`;
  if (!existingTransform) return matrixStr;
  return `${matrixStr} ${existingTransform}`;
}

export function getTransformBasis(matrix: DOMMatrix): TransformBasis {
  const origin = transformPoint(matrix, 0, 0);
  const xPt = transformPoint(matrix, 1, 0);
  const xAxis = { x: xPt.x - origin.x, y: xPt.y - origin.y };

  return {
    rotation: normalizeAngle((Math.atan2(xAxis.y, xAxis.x) * 180) / Math.PI),
  };
}

export function getTransformedRectPoints(
  rect: TouchBounds,
  matrix: DOMMatrix
): SvgPoint[] {
  return [
    transformPoint(matrix, rect.x, rect.y),
    transformPoint(matrix, rect.x + rect.width, rect.y),
    transformPoint(matrix, rect.x + rect.width, rect.y + rect.height),
    transformPoint(matrix, rect.x, rect.y + rect.height),
  ];
}

export function getBoundsFromPoints(points: SvgPoint[]): TouchBounds {
  let minX = points[0].x;
  let maxX = minX;
  let minY = points[0].y;
  let maxY = minY;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function normalizeImportedTextAreaDimensions(params: {
  storedWidth: number;
  storedHeight: number;
  rotation: number;
  renderedBounds?: TouchBounds | null;
  localBounds?: TouchBounds | null;
}): TextAreaDimensions {
  const { renderedBounds, localBounds, storedWidth, storedHeight } = params;

  if (!isNearRightAngle(params.rotation) || !renderedBounds || !localBounds) {
    return { width: storedWidth, height: storedHeight };
  }

  const storedToRendered =
    Math.abs(storedWidth - renderedBounds.width) +
    Math.abs(storedHeight - renderedBounds.height);
  const storedToLocal =
    Math.abs(storedWidth - localBounds.width) +
    Math.abs(storedHeight - localBounds.height);

  if (storedToLocal <= storedToRendered) {
    return { width: storedWidth, height: storedHeight };
  }

  return { width: storedHeight, height: storedWidth };
}

export function normalizeAngle(angle: number): number {
  const normalized = angle % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function isNearRightAngle(rotation: number): boolean {
  const normalized = normalizeAngle(rotation);
  return Math.abs(normalized - 90) < 1 || Math.abs(normalized - 270) < 1;
}

function parseTranslateArgs(token: string): [number, number] | null {
  const match = token.match(
    /^translate\(\s*([^,)]+?)\s*(?:,\s*([^)]+?)\s*)?\)$/
  );
  if (!match) return null;
  const x = parseFloat(match[1].trim());
  const y = match[2] ? parseFloat(match[2].trim()) : 0;
  if (isNaN(x) || isNaN(y)) return null;
  return [x, y];
}
