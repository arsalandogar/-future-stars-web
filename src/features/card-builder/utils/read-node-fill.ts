/**
 * Read the fill color from an SVG node's attributes.
 * Checks the `fill` attribute first, then parses inline `style`.
 * Returns null for gradient fills (url(...)) or missing values.
 */
export function readNodeFill(node: {
  attributes: Record<string, string>;
}): string | null {
  const fill = node.attributes.fill;
  if (fill && !fill.startsWith('url(')) return fill;
  const style = node.attributes.style;
  if (!style) return null;
  const m = style.match(/fill:\s*([^;]+)/);
  if (m) {
    const val = m[1].trim();
    if (!val.startsWith('url(')) return val;
  }
  return null;
}
