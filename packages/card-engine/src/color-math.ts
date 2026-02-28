import {
  formatHex,
  modeOklab,
  modeRgb,
  parse,
  useMode as registerMode, // alias to avoid confusion with React's hook
  type Oklab,
} from 'culori/fn';

import type { ColorTarget, OklabOffset } from './types.ts';

export type { OklabOffset } from './types.ts';

export interface ColorCluster {
  baseHex: string;
  members: ClusterMember[];
}

export interface ClusterMember {
  hex: string;
  offset: OklabOffset;
  occurrences: { nodeId: string; colorTarget: ColorTarget }[];
}

interface ClusterableColor {
  hex: string;
  occurrences: ClusterMember['occurrences'];
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

registerMode(modeRgb);
const toOklab = registerMode(modeOklab);

function hexToOklab(hex: string): Oklab {
  const color = parse(hex);
  if (!color) return { mode: 'oklab', l: 0, a: 0, b: 0 };
  return toOklab(color);
}

function oklabToHex(oklab: Oklab): string {
  return formatHex(oklab) ?? '#000000';
}

// ---------------------------------------------------------------------------
// Offset computation & application
// ---------------------------------------------------------------------------

export function computeOklabOffset(
  baseHex: string,
  shadeHex: string
): OklabOffset {
  const base = hexToOklab(baseHex);
  const shade = hexToOklab(shadeHex);
  return {
    deltaL: shade.l - base.l,
    deltaA: (shade.a ?? 0) - (base.a ?? 0),
    deltaB: (shade.b ?? 0) - (base.b ?? 0),
  };
}

function offsetFromLab(base: Oklab, shade: Oklab): OklabOffset {
  return {
    deltaL: shade.l - base.l,
    deltaA: (shade.a ?? 0) - (base.a ?? 0),
    deltaB: (shade.b ?? 0) - (base.b ?? 0),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applyOklabOffset(baseHex: string, offset: OklabOffset): string {
  const base = hexToOklab(baseHex);
  const baseA = base.a ?? 0;
  const baseB = base.b ?? 0;
  const baseChroma = Math.sqrt(baseA * baseA + baseB * baseB);

  // Lightness shifts are hue-independent — always apply directly.
  const newL = clamp(base.l + offset.deltaL, 0, 1);

  let newA: number;
  let newB: number;

  if (baseChroma > 1e-4) {
    // Project the a/b offset onto the base color's chromaticity direction.
    // This preserves chroma changes (saturation shifts for lighter/darker
    // shades) while discarding hue shifts baked into the original palette.
    const ua = baseA / baseChroma;
    const ub = baseB / baseChroma;
    const proj = offset.deltaA * ua + offset.deltaB * ub;

    // Smoothly attenuate chromatic shifts for near-achromatic colors so
    // grays / whites / blacks don't pick up unwanted color tints.
    const chromaFactor = Math.min(baseChroma / 0.03, 1);

    newA = clamp(baseA + proj * ua * chromaFactor, -0.4, 0.4);
    newB = clamp(baseB + proj * ub * chromaFactor, -0.4, 0.4);
  } else {
    // Purely achromatic — only lightness matters.
    newA = baseA;
    newB = baseB;
  }

  const result: Oklab = { mode: 'oklab', l: newL, a: newA, b: newB };
  return oklabToHex(result);
}

// ---------------------------------------------------------------------------
// Color distance (perceptual, OKLAB Euclidean)
// ---------------------------------------------------------------------------

/** Scale factor: culori's OKLAB Euclidean distance (~0–0.5) → ~0–100 for the UI slider. */
const OKLAB_DISTANCE_SCALE = 200;

function labDistance(a: Oklab, b: Oklab): number {
  const dl = a.l - b.l;
  const da = (a.a ?? 0) - (b.a ?? 0);
  const db = (a.b ?? 0) - (b.b ?? 0);
  return Math.sqrt(dl * dl + da * da + db * db) * OKLAB_DISTANCE_SCALE;
}

export function colorDistance(hexA: string, hexB: string): number {
  const a = parse(hexA);
  const b = parse(hexB);
  if (!a || !b) return 1000;
  return labDistance(toOklab(a), toOklab(b));
}

// ---------------------------------------------------------------------------
// Agglomerative clustering
// ---------------------------------------------------------------------------

const DEFAULT_THRESHOLD = 30;

interface InternalCluster {
  baseHex: string;
  baseLab: Oklab;
  members: { hex: string; count: number }[];
}

export function clusterColors(
  detectedColors: ClusterableColor[],
  threshold = DEFAULT_THRESHOLD
): ColorCluster[] {
  if (detectedColors.length === 0) return [];

  // Pre-compute OKLAB representations once
  const labCache = new Map<string, Oklab>();
  for (const c of detectedColors) {
    if (!labCache.has(c.hex)) {
      labCache.set(c.hex, hexToOklab(c.hex));
    }
  }

  // Initialize each color as its own cluster
  const clusters: InternalCluster[] = detectedColors.map((c) => ({
    baseHex: c.hex,
    baseLab: labCache.get(c.hex)!,
    members: [{ hex: c.hex, count: c.occurrences.length }],
  }));

  // Agglomerative merge
  while (clusters.length > 1) {
    let minDist = Infinity;
    let mergeI = -1;
    let mergeJ = -1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = labDistance(clusters[i].baseLab, clusters[j].baseLab);
        if (d < minDist) {
          minDist = d;
          mergeI = i;
          mergeJ = j;
        }
      }
    }

    if (minDist >= threshold) break;

    // Merge j into i — base becomes the one with most occurrences
    const target = clusters[mergeI];
    const source = clusters[mergeJ];
    const merged = [...target.members, ...source.members];
    const targetCount = target.members.reduce((s, m) => s + m.count, 0);
    const sourceCount = source.members.reduce((s, m) => s + m.count, 0);
    if (sourceCount > targetCount) {
      target.baseHex = source.baseHex;
      target.baseLab = source.baseLab;
    }
    target.members = merged;
    clusters.splice(mergeJ, 1);
  }

  // Build lookup for occurrences by hex
  const occByHex = new Map<string, ClusterableColor['occurrences']>();
  for (const dc of detectedColors) {
    occByHex.set(dc.hex, dc.occurrences);
  }

  // Convert to output format with offsets (reuse cached OKLAB values)
  return clusters.map((cluster) => ({
    baseHex: cluster.baseHex,
    members: cluster.members.map((m) => ({
      hex: m.hex,
      offset: offsetFromLab(cluster.baseLab, labCache.get(m.hex)!),
      occurrences: occByHex.get(m.hex) ?? [],
    })),
  }));
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function serializeOffset(offset: OklabOffset): string {
  return `${round(offset.deltaL)},${round(offset.deltaA)},${round(offset.deltaB)}`;
}

export function parseOffset(raw: string): OklabOffset | null {
  const parts = raw.split(',');
  if (parts.length !== 3) return null;
  const [dL, dA, dB] = parts.map(Number);
  if (!Number.isFinite(dL) || !Number.isFinite(dA) || !Number.isFinite(dB))
    return null;
  return { deltaL: dL, deltaA: dA, deltaB: dB };
}

const EPSILON = 1e-4;

export function isZeroOffset(offset: OklabOffset): boolean {
  return (
    Math.abs(offset.deltaL) < EPSILON &&
    Math.abs(offset.deltaA) < EPSILON &&
    Math.abs(offset.deltaB) < EPSILON
  );
}
