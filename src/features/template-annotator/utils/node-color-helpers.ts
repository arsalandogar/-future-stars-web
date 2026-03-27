import type { SvgJsonNode } from '@/types/svg';

import type { ColorTarget } from '../types';

export function isDirectColor(val: string | undefined): val is string {
  return !!val && val !== 'none' && !val.startsWith('url(');
}

const STYLE_REGEXES: Record<string, RegExp> = {
  fill: /fill:\s*([^;]+)/,
  stroke: /stroke:\s*([^;]+)/,
  'stop-color': /stop-color:\s*([^;]+)/,
};

export function getNodeColor(
  node: SvgJsonNode,
  target?: ColorTarget
): string | undefined {
  const t = target ?? 'fill';
  const val = node.attributes[t];
  if (isDirectColor(val)) return val;
  const styleProp = t === 'stop-color' ? 'stop-color' : t;
  const style = node.attributes.style;
  if (style) {
    const re =
      STYLE_REGEXES[styleProp] ?? new RegExp(`${styleProp}:\\s*([^;]+)`);
    const match = style.match(re);
    if (match && isDirectColor(match[1].trim())) return match[1].trim();
  }
  return undefined;
}

export function getTextFillColor(node: SvgJsonNode): string {
  // Inline style takes CSS precedence over fill attribute — check style first
  const style = node.attributes.style;
  if (style) {
    const match = style.match(STYLE_REGEXES.fill);
    if (match) {
      const val = match[1].trim();
      if (isDirectColor(val)) return val;
    }
  }
  const fill = node.attributes.fill;
  if (isDirectColor(fill)) return fill;
  return '#000000';
}

/**
 * Write a color value to a node for the given target (fill/stroke/stop-color).
 * Respects CSS specificity: inline style > attribute. Mutates node in place.
 */
export function applyNodeColor(
  node: SvgJsonNode,
  target: ColorTarget,
  color: string
): void {
  const prop = target;
  const re = STYLE_REGEXES[prop] ?? new RegExp(`${prop}:\\s*[^;]+`);
  if (node.attributes.style && re.test(node.attributes.style)) {
    node.attributes.style = node.attributes.style.replace(
      re,
      `${prop}: ${color}`
    );
  } else if (node.attributes.style && target === 'fill') {
    // fill may not be in style but still needs style-level override
    node.attributes.style = `${prop}: ${color}; ${node.attributes.style}`;
  } else {
    node.attributes[prop] = color;
  }
}

/**
 * Shorthand for applying a fill color. Delegates to applyNodeColor.
 */
export function applyNodeFill(node: SvgJsonNode, color: string): void {
  applyNodeColor(node, 'fill', color);
}

export function getNodeFontSize(node: SvgJsonNode): number | undefined {
  if (node.type !== 'element') return undefined;
  const fromAttr = node.attributes['font-size'];
  if (fromAttr) {
    const parsed = parseFloat(fromAttr);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const styleMatch = node.attributes.style?.match(/font-size:\s*([\d.]+)/);
  if (styleMatch) return Number(styleMatch[1]);
  return undefined;
}
