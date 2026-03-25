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
 * Write a fill color to a node, respecting CSS specificity:
 * inline style > attribute. Mutates node in place.
 */
export function applyNodeFill(node: SvgJsonNode, color: string): void {
  if (node.attributes.style) {
    if (/fill\s*:/.test(node.attributes.style)) {
      node.attributes.style = node.attributes.style.replace(
        /fill\s*:\s*[^;]+/,
        `fill: ${color}`
      );
    } else {
      node.attributes.style = `fill: ${color}; ${node.attributes.style}`;
    }
  } else {
    node.attributes.fill = color;
  }
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
