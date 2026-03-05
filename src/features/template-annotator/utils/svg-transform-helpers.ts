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
