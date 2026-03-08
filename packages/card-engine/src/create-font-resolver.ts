import type { FontResolver, FontResolverInput } from './text-compression.ts';
import {
  normalizeFamily,
  normalizeWeight,
  normalizeStyle,
  normalizeFileToken,
  pickNearestWeight,
  stripQuotes,
  weightToVariantToken,
  generateFontFileCandidates,
  type FontStyle,
} from './font-matching.ts';

export interface FontRegistryEntry {
  family: string;
  weight: number;
  style: FontStyle;
  /** Platform-specific locator (URL, file path, asset ID, etc.) */
  locator: string;
}

export interface CreateFontResolverOptions {
  /** Registered font entries available on this platform */
  entries: FontRegistryEntry[];
  /** Platform-specific: load font binary data from a locator */
  loadFont: (locator: string) => Promise<Uint8Array | null>;
  /** Optional: extra file-token lookup map for fuzzy filename matching */
  fileTokens?: Map<string, string>;
}

function entryKey(family: string, style: FontStyle): string {
  return `${normalizeFamily(family)}|${style}`;
}

function buildIndex(
  entries: FontRegistryEntry[]
): Map<string, FontRegistryEntry[]> {
  const index = new Map<string, FontRegistryEntry[]>();

  for (const entry of entries) {
    const key = entryKey(entry.family, entry.style);
    const list = index.get(key) ?? [];
    list.push(entry);
    index.set(key, list);
  }

  for (const list of index.values()) {
    list.sort((a, b) => a.weight - b.weight);
  }

  return index;
}

function resolveLocator(
  index: Map<string, FontRegistryEntry[]>,
  fileTokens: Map<string, string> | undefined,
  input: FontResolverInput
): string | null {
  const style = normalizeStyle(input.style);
  const requestedWeight = normalizeWeight(input.weight);
  const key = entryKey(input.family, style);

  // Try exact family + style match
  const styleMatches = index.get(key);
  if (styleMatches?.length) {
    return pickNearestWeight(styleMatches, requestedWeight).locator;
  }

  // Fall back to normal style if italic/oblique is unavailable
  const normalMatches = index.get(entryKey(input.family, 'normal'));
  if (normalMatches?.length) {
    return pickNearestWeight(normalMatches, requestedWeight).locator;
  }

  // Fall back to fuzzy filename matching if fileTokens is provided
  if (fileTokens) {
    const familyRaw = stripQuotes(input.family);
    const variant = weightToVariantToken(requestedWeight);
    const candidates = generateFontFileCandidates(
      familyRaw,
      variant,
      style === 'italic'
    );

    for (const candidate of candidates) {
      const token = normalizeFileToken(candidate);
      const found = fileTokens.get(token);
      if (found) return found;
    }
  }

  return null;
}

function cacheKey(input: FontResolverInput): string {
  return [
    normalizeFamily(input.family),
    String(normalizeWeight(input.weight)),
    normalizeStyle(input.style),
  ].join('|');
}

export function createFontResolver(
  options: CreateFontResolverOptions
): FontResolver {
  const index = buildIndex(options.entries);
  const cache = new Map<string, Promise<Uint8Array | null>>();

  const resolver: FontResolver = (input: FontResolverInput) => {
    const key = cacheKey(input);
    const existing = cache.get(key);
    if (existing) return existing;

    const next = (async (): Promise<Uint8Array | null> => {
      const locator = resolveLocator(index, options.fileTokens, input);
      if (!locator) return null;
      return options.loadFont(locator);
    })();

    cache.set(key, next);
    return next;
  };

  return resolver;
}
