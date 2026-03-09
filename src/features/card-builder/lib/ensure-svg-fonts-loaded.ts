import type { SvgJsonNode } from '@fs-card-engine';
import {
  stripQuotes,
  normalizeFamily,
  normalizeFileToken,
  generateFontFileCandidates,
} from '@fs-card-engine';
import { entries, fileTokens } from './font-resolver';

/** Families already covered by static registry entries (Montserrat, Poppins, etc.) */
const staticFamilies = new Set(entries.map((e) => normalizeFamily(e.family)));

/** Tracks families we've already registered with the browser. */
const registeredFonts = new Set<string>();

/** Recursively collect all font-family names from an SVG tree. */
function collectFontFamilies(node: SvgJsonNode): Set<string> {
  const families = new Set<string>();

  function walk(n: SvgJsonNode) {
    // Check font-family attribute
    const attrFamily = n.attributes?.['font-family'];
    if (attrFamily) {
      for (const part of attrFamily.split(',')) {
        families.add(stripQuotes(part));
      }
    }

    // Check font-family in style attribute
    const style = n.attributes?.style;
    if (style) {
      const match = /font-family:\s*([^;]+)/i.exec(style);
      if (match) {
        for (const part of match[1].split(',')) {
          families.add(stripQuotes(part));
        }
      }
    }

    for (const child of n.children ?? []) {
      walk(child);
    }
  }

  walk(node);
  return families;
}

/** Resolve a font family name to a local font file URL, or null if not found. */
function resolveFontUrl(family: string): string | null {
  // Skip families already handled by static @font-face entries
  if (staticFamilies.has(normalizeFamily(family))) return null;

  const candidates = generateFontFileCandidates(family, 'Regular', false);
  for (const candidate of candidates) {
    const url = fileTokens.get(normalizeFileToken(candidate));
    if (url) return url;
  }
  return null;
}

/**
 * Scan an SVG tree for font-family references and register any unregistered
 * fonts with the browser via the FontFace API. This ensures the browser
 * renders text with the same font that opentype.js uses for measurement.
 */
export async function ensureSvgFontsLoaded(root: SvgJsonNode): Promise<void> {
  const families = collectFontFamilies(root);
  const loadPromises: Promise<FontFace | void>[] = [];

  for (const family of families) {
    if (registeredFonts.has(family)) continue;

    const url = resolveFontUrl(family);
    if (!url) continue;

    registeredFonts.add(family);

    const face = new FontFace(family, `url("${url}")`, {
      weight: '1 1000',
      style: 'normal',
      display: 'swap',
    });

    document.fonts.add(face);
    loadPromises.push(
      face.load().catch(() => {
        registeredFonts.delete(family);
        document.fonts.delete(face);
      })
    );
  }

  await Promise.all(loadPromises);
}
