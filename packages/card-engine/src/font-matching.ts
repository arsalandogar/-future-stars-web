export type FontStyle = 'normal' | 'italic';

export interface FontEntry {
  family: string;
  weight: number;
  style: FontStyle;
}

export function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value.trim();
}

export function normalizeFamily(value: string): string {
  return stripQuotes(value).replace(/\s+/g, '').toLowerCase();
}

export function normalizeFileToken(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function normalizeWeight(weight: string | number): number {
  if (typeof weight === 'number' && Number.isFinite(weight)) return weight;

  const raw = String(weight).trim().toLowerCase();
  if (raw === 'normal') return 400;
  if (raw === 'bold') return 700;
  if (raw === 'lighter') return 300;
  if (raw === 'bolder') return 700;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 400;
}

export function normalizeStyle(style: string): FontStyle {
  const raw = style.trim().toLowerCase();
  return raw.includes('italic') || raw.includes('oblique')
    ? 'italic'
    : 'normal';
}

export function weightToVariantToken(weight: number): string {
  if (weight >= 900) return 'Black';
  if (weight >= 800) return 'ExtraBold';
  if (weight >= 700) return 'Bold';
  if (weight >= 600) return 'SemiBold';
  if (weight >= 500) return 'Medium';
  if (weight >= 300) return 'Light';
  return 'Regular';
}

export function pickNearestWeight<T extends FontEntry>(
  entries: T[],
  requestedWeight: number
): T {
  let best = entries[0];
  let bestDistance = Math.abs(best.weight - requestedWeight);

  for (let i = 1; i < entries.length; i += 1) {
    const candidate = entries[i];
    const distance = Math.abs(candidate.weight - requestedWeight);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

export function generateFontFileCandidates(
  family: string,
  variant: string,
  italic: boolean
): string[] {
  const italicSuffix = italic ? 'Italic' : '';

  return [
    `${family}-${variant}${italicSuffix}`,
    `${family}-${variant}`,
    `${family}${variant}${italicSuffix}`,
    `${family}-Regular`,
    `${family}${italicSuffix}`,
    family,
  ];
}
