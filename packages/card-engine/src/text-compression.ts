import type * as opentype from 'opentype.js';
import { parse as parseFont } from 'opentype.js';

import type { SvgJsonNode } from './types.ts';
import { collectTextContent } from './svg-text-utils.ts';
import { stripQuotes } from './font-matching.ts';

export type FontData = ArrayBuffer | Uint8Array;

export interface FontResolverInput {
  family: string;
  weight: string | number;
  style: string;
}

export type FontResolver = (
  input: FontResolverInput
) => Promise<FontData | null> | FontData | null;

export type TextCompressionWarningReason =
  | 'font-not-found'
  | 'parse-failed'
  | 'unsupported-mixed-style'
  | 'invalid-max-width';

export interface TextCompressionWarning {
  reason: TextCompressionWarningReason;
  nodeId?: string;
  message: string;
}

export interface FontLookupResult {
  font: opentype.Font | null;
  errorReason?: 'font-not-found' | 'parse-failed';
}

export interface ApplyTextCompressionOptions {
  fontResolver: FontResolver;
  onWarning?: (warning: TextCompressionWarning) => void;
  /** Optional external cache for parsed opentype.Font objects. Persisting this
   *  across calls avoids re-parsing font binaries on every invocation. */
  fontCache?: Map<string, Promise<FontLookupResult>>;
}

export interface ApplyTextCompressionResult {
  compressedCount: number;
  warningCount: number;
}

interface ResolvedTextStyle {
  family: string;
  fontSize: number;
  weight: string | number;
  style: string;
  letterSpacing: number;
}

const STYLE_PROP_KEYS = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
] as const;

const DEFAULT_STYLE: ResolvedTextStyle = {
  family: 'Poppins',
  fontSize: 16,
  weight: 'normal',
  style: 'normal',
  letterSpacing: 0,
};

const UPPER_CASE_RE = /[A-Z]/g;
const KEBAB_TO_CAMEL_RE = /-([a-z])/g;

function normalizeCssPropName(prop: string): string {
  return prop
    .trim()
    .replace(UPPER_CASE_RE, (char: string) => `-${char.toLowerCase()}`)
    .toLowerCase();
}

function parseStyleString(styleRaw: string | undefined): Map<string, string> {
  const parsed = new Map<string, string>();
  if (!styleRaw) return parsed;

  for (const declaration of styleRaw.split(';')) {
    const trimmed = declaration.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    const key = normalizeCssPropName(trimmed.slice(0, colonIndex));
    const value = trimmed.slice(colonIndex + 1).trim();
    if (!key || !value) continue;
    parsed.set(key, value);
  }

  return parsed;
}

function isCssWideKeyword(value: string): boolean {
  return (
    value === 'inherit' ||
    value === 'initial' ||
    value === 'unset' ||
    value === 'revert'
  );
}

function parsePrimaryFontFamily(value: string | undefined): string | null {
  if (!value) return null;
  const first = value.split(',')[0]?.trim();
  if (!first) return null;
  if (isCssWideKeyword(first.toLowerCase())) return null;
  return stripQuotes(first);
}

function parseCssNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFontWeight(raw: string | undefined): string | number | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (!normalized || isCssWideKeyword(normalized)) return null;
  if (normalized === 'normal') return 'normal';
  if (normalized === 'bold') return 'bold';
  if (normalized === 'lighter') return 300;
  if (normalized === 'bolder') return 700;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFontStyle(raw: string | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (!normalized || isCssWideKeyword(normalized)) return null;
  return normalized;
}

function parseLetterSpacing(raw: string | undefined): number | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (!normalized || isCssWideKeyword(normalized)) return null;
  if (normalized === 'normal') return DEFAULT_STYLE.letterSpacing;
  const parsed = parseCssNumber(normalized);
  return parsed ?? null;
}

function resolveTextStyle(
  node: SvgJsonNode,
  parent: ResolvedTextStyle
): ResolvedTextStyle {
  if (node.type === 'text') return parent;

  const attrs = node.attributes;
  const inline = parseStyleString(attrs.style);

  const fromStyle = (name: string): string | undefined => inline.get(name);
  const fromAttr = (name: string): string | undefined =>
    attrs[name] ??
    attrs[name.replace(KEBAB_TO_CAMEL_RE, (_, c: string) => c.toUpperCase())];

  const family =
    parsePrimaryFontFamily(fromAttr('font-family')) ??
    parsePrimaryFontFamily(fromStyle('font-family')) ??
    parent.family;

  const fontSize =
    parseCssNumber(fromAttr('font-size')) ??
    parseCssNumber(fromStyle('font-size')) ??
    parent.fontSize;

  const weight =
    parseFontWeight(fromAttr('font-weight') ?? fromStyle('font-weight')) ??
    parent.weight;

  const style =
    parseFontStyle(fromAttr('font-style') ?? fromStyle('font-style')) ??
    parent.style;

  const letterSpacingRaw =
    fromAttr('letter-spacing') ?? fromStyle('letter-spacing');
  const letterSpacing =
    letterSpacingRaw != null
      ? (parseLetterSpacing(letterSpacingRaw) ?? parent.letterSpacing)
      : parent.letterSpacing;

  return {
    family,
    fontSize: fontSize > 0 ? fontSize : parent.fontSize,
    weight,
    style,
    letterSpacing,
  };
}

function hasStyleOverride(node: SvgJsonNode): boolean {
  if (node.type === 'text') return false;
  for (const key of STYLE_PROP_KEYS) {
    if (node.attributes[key]) return true;
  }
  const inline = parseStyleString(node.attributes.style);
  for (const key of STYLE_PROP_KEYS) {
    if (inline.has(key)) return true;
  }
  return false;
}

function hasMixedTextStyle(node: SvgJsonNode): boolean {
  if (node.type === 'text') return false;

  for (const child of node.children) {
    if (child.type === 'text') continue;
    if (
      (child.name === 'tspan' || child.name === 'textPath') &&
      hasStyleOverride(child)
    ) {
      return true;
    }
    if (hasMixedTextStyle(child)) return true;
  }

  return false;
}

function toArrayBuffer(data: FontData): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  if (
    data.byteOffset === 0 &&
    data.byteLength === data.buffer.byteLength &&
    data.buffer instanceof ArrayBuffer
  ) {
    return data.buffer;
  }
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

function fontCacheKey(style: ResolvedTextStyle): string {
  return `${stripQuotes(style.family)}|${String(style.weight)}|${style.style}`;
}

const ORIGINAL_TRANSFORM_ATTR = '__originalTransform';

function clearCompressionAttrs(node: SvgJsonNode): void {
  if (ORIGINAL_TRANSFORM_ATTR in node.attributes) {
    const original = node.attributes[ORIGINAL_TRANSFORM_ATTR];
    if (original) {
      node.attributes.transform = original;
    } else {
      delete node.attributes.transform;
    }
    delete node.attributes[ORIGINAL_TRANSFORM_ATTR];
  }
}

function resolveScaleOriginX(node: SvgJsonNode): number {
  return parseCssNumber(node.attributes.x) ?? 0;
}

function applyCompressionTransform(node: SvgJsonNode, scaleX: number): void {
  // Preserve the original transform so we can restore it later.
  if (!(ORIGINAL_TRANSFORM_ATTR in node.attributes)) {
    node.attributes[ORIGINAL_TRANSFORM_ATTR] = node.attributes.transform ?? '';
  }

  const originX = resolveScaleOriginX(node);
  const compression = `translate(${originX}, 0) scale(${scaleX}, 1) translate(${-originX}, 0)`;

  const original = node.attributes[ORIGINAL_TRANSFORM_ATTR];
  node.attributes.transform = original
    ? `${original} ${compression}`
    : compression;
}

export function measureTextWidth(
  text: string,
  fontSize: number,
  font: opentype.Font,
  letterSpacing = 0
): number {
  const baseWidth = font.getAdvanceWidth(text, fontSize);
  if (!letterSpacing || text.length < 2) return baseWidth;
  return baseWidth + letterSpacing * (text.length - 1);
}

export async function applyTextCompression(
  root: SvgJsonNode,
  options: ApplyTextCompressionOptions
): Promise<ApplyTextCompressionResult> {
  let compressedCount = 0;
  let warningCount = 0;

  const warn = (
    reason: TextCompressionWarningReason,
    message: string,
    node?: SvgJsonNode
  ) => {
    warningCount += 1;
    options.onWarning?.({
      reason,
      message,
      nodeId: node?.type !== 'text' ? node?.attributes['__nodeId'] : undefined,
    });
  };

  const fontCache =
    options.fontCache ?? new Map<string, Promise<FontLookupResult>>();

  const resolveFont = async (
    style: ResolvedTextStyle
  ): Promise<FontLookupResult> => {
    const key = fontCacheKey(style);
    const existing = fontCache.get(key);
    if (existing) return existing;

    const next = (async (): Promise<FontLookupResult> => {
      const resolved = await options.fontResolver({
        family: style.family,
        weight: style.weight,
        style: style.style,
      });
      if (!resolved) {
        return { font: null, errorReason: 'font-not-found' };
      }

      try {
        const parsed = parseFont(toArrayBuffer(resolved));
        return { font: parsed };
      } catch {
        return { font: null, errorReason: 'parse-failed' };
      }
    })();

    fontCache.set(key, next);
    return next;
  };

  const walk = async (
    node: SvgJsonNode,
    parentStyle: ResolvedTextStyle
  ): Promise<void> => {
    if (node.type === 'text') return;

    const style = resolveTextStyle(node, parentStyle);

    if (node.name === 'text' && node.attributes['data-max-width']) {
      const maxWidthRaw = node.attributes['data-max-width'];
      const maxWidth = parseCssNumber(maxWidthRaw);

      if (maxWidth == null || maxWidth <= 0) {
        clearCompressionAttrs(node);
        warn(
          'invalid-max-width',
          `Skipping text compression due to invalid data-max-width "${maxWidthRaw}".`,
          node
        );
      } else if (hasMixedTextStyle(node)) {
        clearCompressionAttrs(node);
        warn(
          'unsupported-mixed-style',
          'Skipping text compression for mixed-style text nodes (styled descendants).',
          node
        );
      } else {
        const text = collectTextContent(node);
        if (!text) {
          clearCompressionAttrs(node);
        } else {
          const lookup = await resolveFont(style);
          if (!lookup.font) {
            clearCompressionAttrs(node);
            warn(
              lookup.errorReason ?? 'font-not-found',
              `Unable to resolve font "${style.family}" (${String(style.weight)}, ${style.style}).`,
              node
            );
          } else {
            const measuredWidth = measureTextWidth(
              text,
              style.fontSize,
              lookup.font,
              style.letterSpacing
            );

            if (measuredWidth > maxWidth) {
              const scaleX = maxWidth / measuredWidth;
              applyCompressionTransform(node, scaleX);
              compressedCount += 1;
            } else {
              clearCompressionAttrs(node);
            }
          }
        }
      }
    }

    await Promise.all(node.children.map((child) => walk(child, style)));
  };

  await walk(root, DEFAULT_STYLE);

  return { compressedCount, warningCount };
}
