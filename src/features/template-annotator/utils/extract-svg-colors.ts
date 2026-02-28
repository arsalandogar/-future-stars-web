import type { SvgJsonNode } from '@/types/svg';
import { clusterColors, type ColorCluster } from '@/utils/color-math';

import type { ColorOccurrence, ColorTarget, DetectedColor } from '../types';
import { getStyleProp } from './svg-node-helpers';

const SKIP_VALUES = new Set(['none', 'inherit', 'currentcolor', 'transparent']);

const CSS_NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
  maroon: '#800000',
  olive: '#808000',
  lime: '#00ff00',
  aqua: '#00ffff',
  teal: '#008080',
  navy: '#000080',
  fuchsia: '#ff00ff',
  purple: '#800080',
  orange: '#ffa500',
  pink: '#ffc0cb',
  brown: '#a52a2a',
  coral: '#ff7f50',
  crimson: '#dc143c',
  darkblue: '#00008b',
  darkgreen: '#006400',
  darkred: '#8b0000',
  gold: '#ffd700',
  indigo: '#4b0082',
  ivory: '#fffff0',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  linen: '#faf0e6',
  peru: '#cd853f',
  plum: '#dda0dd',
  salmon: '#fa8072',
  sienna: '#a0522d',
  tan: '#d2b48c',
  tomato: '#ff6347',
  turquoise: '#40e0d0',
  violet: '#ee82ee',
  wheat: '#f5deb3',
};

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function componentToHex(c: number): string {
  return clamp(c).toString(16).padStart(2, '0');
}

function normalizeColor(raw: string): string | null {
  const value = raw.trim().toLowerCase();

  if (SKIP_VALUES.has(value)) return null;
  if (value.startsWith('url(')) return null;

  // Named color
  if (CSS_NAMED_COLORS[value]) return CSS_NAMED_COLORS[value];

  // Hex
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      // Expand shorthand (3-digit or 4-digit with alpha, alpha is discarded)
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }
    if (hex.length === 6) {
      return `#${hex}`;
    }
    if (hex.length === 8) {
      return `#${hex.slice(0, 6)}`;
    }
    return null;
  }

  // rgb() / rgba()
  const rgbMatch = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/
  );
  if (rgbMatch) {
    const r = componentToHex(Number(rgbMatch[1]));
    const g = componentToHex(Number(rgbMatch[2]));
    const b = componentToHex(Number(rgbMatch[3]));
    return `#${r}${g}${b}`;
  }

  return null;
}

function getColorValue(node: SvgJsonNode, target: ColorTarget): string | null {
  const styleProp = target === 'stop-color' ? 'stopColor' : target;
  const raw = node.attributes[target] ?? getStyleProp(node, styleProp);
  if (!raw) return null;

  return normalizeColor(raw);
}

export function extractSvgColors(
  nodeMap: Map<string, SvgJsonNode>
): DetectedColor[] {
  const colorMap = new Map<string, ColorOccurrence[]>();

  for (const [nodeId, node] of nodeMap) {
    const targets: ColorTarget[] =
      node.name === 'stop' ? ['stop-color'] : ['fill', 'stroke'];

    for (const target of targets) {
      const hex = getColorValue(node, target);
      if (!hex) continue;

      let occurrences = colorMap.get(hex);
      if (!occurrences) {
        occurrences = [];
        colorMap.set(hex, occurrences);
      }
      occurrences.push({ nodeId, colorTarget: target });
    }
  }

  return Array.from(colorMap, ([hex, occurrences]) => ({
    hex,
    occurrences,
  })).sort((a, b) => b.occurrences.length - a.occurrences.length);
}

export function extractColorClusters(
  nodeMap: Map<string, SvgJsonNode>,
  threshold?: number
): ColorCluster[] {
  const detectedColors = extractSvgColors(nodeMap);
  return clusterColors(detectedColors, threshold);
}
