import type * as opentype from 'opentype.js';
import { parse as parseFont } from 'opentype.js';

import type { SvgJsonNode } from './types.ts';
import {
  clearAutoWrappedTextNode,
  collectTextContent,
  createTextNode,
  getLogicalTextContent,
  isAutoWrappedTextNode,
  markAutoWrappedTextNode,
  rememberTextLayout,
  restoreTextLayout,
  setLogicalTextContent,
} from './svg-text-utils.ts';
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
  wrappedCount: number;
  modifiedCount: number;
  warningCount: number;
}

interface ResolvedTextStyle {
  family: string;
  fontSize: number;
  weight: string | number;
  style: string;
  letterSpacing: number;
  lineHeight: number | null;
}

interface TextAnchorPosition {
  x: number;
  y: number;
}

interface WrappedTextMetrics {
  maxLineWidth: number;
  totalHeight: number;
}

interface WrappedTextFit {
  lines: string[];
  metrics: WrappedTextMetrics;
  scale: number;
  visibleWidth: number;
}

interface PreparedWrapParagraph {
  words: string[];
  prefixBaseWidths: number[];
  prefixCharCounts: number[];
}

interface PreparedWrapText {
  paragraphs: PreparedWrapParagraph[];
  baseSpaceWidth: number;
  letterSpacing: number;
  multilineWidthCap: number;
}

interface PreparedWrapResult {
  lines: string[];
  maxLineWidth: number;
}

const STYLE_PROP_KEYS = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'line-height',
] as const;

const DEFAULT_STYLE: ResolvedTextStyle = {
  family: 'Poppins',
  fontSize: 16,
  weight: 'normal',
  style: 'normal',
  letterSpacing: 0,
  lineHeight: null,
};

const UPPER_CASE_RE = /[A-Z]/g;
const KEBAB_TO_CAMEL_RE = /-([a-z])/g;
const NEWLINE_RE = /\r\n?/g;
const FLOAT_TOLERANCE = 0.01;
export const MULTILINE_ATTR = 'data-text-multiline';
const MAX_SCALE_SEARCH_STEPS = 14;
const MAX_MULTILINE_WIDTH_CAP_SEARCH_STEPS = 10;
const SCALE_REFINE_TOLERANCE = 0.001;

const originalTransforms = new WeakMap<SvgJsonNode, string | undefined>();

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

function parseLineHeight(
  raw: string | undefined,
  fontSize: number
): number | null {
  if (!raw) return null;

  const normalized = raw.trim().toLowerCase();
  if (!normalized || isCssWideKeyword(normalized)) return null;
  if (normalized === 'normal') return null;

  if (normalized.endsWith('%')) {
    const pct = parseCssNumber(normalized.slice(0, -1));
    return pct == null ? null : (pct / 100) * fontSize;
  }

  const parsed = parseCssNumber(normalized);
  if (parsed == null) return null;

  if (/^[+-]?\d*\.?\d+$/.test(normalized)) {
    return parsed * fontSize;
  }

  return parsed;
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

  const safeFontSize = fontSize > 0 ? fontSize : parent.fontSize;

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

  const lineHeightRaw = fromAttr('line-height') ?? fromStyle('line-height');
  const lineHeight =
    lineHeightRaw != null
      ? parseLineHeight(lineHeightRaw, safeFontSize)
      : parent.lineHeight;

  return {
    family,
    fontSize: safeFontSize,
    weight,
    style,
    letterSpacing,
    lineHeight,
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

function hasTextPath(node: SvgJsonNode): boolean {
  if (node.type === 'text') return false;

  for (const child of node.children) {
    if (child.type === 'text') continue;
    if (child.name === 'textPath') return true;
    if (hasTextPath(child)) return true;
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

function hasCompressionTransform(node: SvgJsonNode): boolean {
  return originalTransforms.has(node);
}

function clearCompressionTransform(node: SvgJsonNode): boolean {
  if (!originalTransforms.has(node)) return false;

  const current = node.attributes.transform;
  const hadTransform = 'transform' in node.attributes;
  const original = originalTransforms.get(node);

  if (original) {
    node.attributes.transform = original;
  } else {
    delete node.attributes.transform;
  }

  originalTransforms.delete(node);
  return original !== current || (!original && hadTransform);
}

function parseCoordinate(raw: string | undefined): number | null {
  if (!raw) return null;
  const token = raw.trim().split(/[\s,]+/)[0];
  return parseCssNumber(token);
}

function findCoordinateInChildren(
  node: SvgJsonNode,
  key: 'x' | 'y'
): number | null {
  if (node.type === 'text') return null;

  for (const child of node.children) {
    if (child.type === 'text') continue;

    const direct = parseCoordinate(child.attributes[key]);
    if (direct != null) return direct;

    const nested = findCoordinateInChildren(child, key);
    if (nested != null) return nested;
  }

  return null;
}

function resolveTextAnchorPosition(node: SvgJsonNode): TextAnchorPosition {
  return {
    x:
      parseCoordinate(node.attributes.x) ??
      findCoordinateInChildren(node, 'x') ??
      0,
    y:
      parseCoordinate(node.attributes.y) ??
      findCoordinateInChildren(node, 'y') ??
      0,
  };
}

function resolveScaleOriginX(node: SvgJsonNode): number {
  return resolveTextAnchorPosition(node).x;
}

function applyScaleTransform(
  node: SvgJsonNode,
  scaleX: number,
  scaleY = 1,
  origin = resolveTextAnchorPosition(node)
): boolean {
  if (!originalTransforms.has(node)) {
    originalTransforms.set(node, node.attributes.transform);
  }

  const compression = `translate(${origin.x}, ${origin.y}) scale(${scaleX}, ${scaleY}) translate(${-origin.x}, ${-origin.y})`;
  const original = originalTransforms.get(node);
  const nextTransform = original ? `${original} ${compression}` : compression;
  const changed = node.attributes.transform !== nextTransform;
  node.attributes.transform = nextTransform;
  return changed;
}

function applyCompressionTransform(node: SvgJsonNode, scaleX: number): boolean {
  return applyScaleTransform(node, scaleX, 1, {
    x: resolveScaleOriginX(node),
    y: 0,
  });
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

function measureLineHeight(
  style: ResolvedTextStyle,
  font: opentype.Font
): number {
  if (style.lineHeight != null && style.lineHeight > 0) return style.lineHeight;

  const unitsPerEm = font.unitsPerEm || 1000;
  const fontHeight =
    ((font.ascender ?? unitsPerEm) - (font.descender ?? 0)) / unitsPerEm;

  return fontHeight > 0 ? fontHeight * style.fontSize : style.fontSize * 1.2;
}

function normalizeParagraphWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeParagraphs(value: string): string[] {
  return value
    .replace(NEWLINE_RE, '\n')
    .split('\n')
    .map(normalizeParagraphWhitespace);
}

function measureBaseTextWidth(
  text: string,
  fontSize: number,
  font: opentype.Font
): number {
  return font.getAdvanceWidth(text, fontSize);
}

function createPreparedWrapParagraph(
  paragraph: string,
  font: opentype.Font,
  style: ResolvedTextStyle,
  baseWidthCache: Map<string, number>
): PreparedWrapParagraph {
  if (!paragraph) {
    return {
      words: [],
      prefixBaseWidths: [0],
      prefixCharCounts: [0],
    };
  }

  const words = paragraph.split(' ');
  const prefixBaseWidths = [0];
  const prefixCharCounts = [0];

  for (const word of words) {
    let baseWidth = baseWidthCache.get(word);
    if (baseWidth == null) {
      baseWidth = measureBaseTextWidth(word, style.fontSize, font);
      baseWidthCache.set(word, baseWidth);
    }

    prefixBaseWidths.push(
      prefixBaseWidths[prefixBaseWidths.length - 1] + baseWidth
    );
    prefixCharCounts.push(
      prefixCharCounts[prefixCharCounts.length - 1] + word.length
    );
  }

  return {
    words,
    prefixBaseWidths,
    prefixCharCounts,
  };
}

function measurePreparedWordRangeWidth(
  paragraph: PreparedWrapParagraph,
  start: number,
  end: number,
  prepared: PreparedWrapText
): number {
  const wordCount = end - start + 1;
  const baseWordsWidth =
    paragraph.prefixBaseWidths[end + 1] - paragraph.prefixBaseWidths[start];
  const totalChars =
    paragraph.prefixCharCounts[end + 1] - paragraph.prefixCharCounts[start];

  if (wordCount <= 1) {
    return (
      baseWordsWidth + prepared.letterSpacing * Math.max(totalChars - 1, 0)
    );
  }

  const gapCount = wordCount - 1;
  return (
    baseWordsWidth +
    prepared.baseSpaceWidth * gapCount +
    prepared.letterSpacing * Math.max(totalChars + gapCount - 1, 0)
  );
}

function findPreparedLineEnd(
  paragraph: PreparedWrapParagraph,
  start: number,
  rawMaxWidth: number,
  prepared: PreparedWrapText
): number {
  let low = start;
  let high = paragraph.words.length - 1;
  let best = start - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const width = measurePreparedWordRangeWidth(
      paragraph,
      start,
      mid,
      prepared
    );

    if (width <= rawMaxWidth + FLOAT_TOLERANCE) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

function countWrappedPreparedTextLines(
  prepared: PreparedWrapText,
  rawMaxWidth: number,
  stopAfter = Number.POSITIVE_INFINITY
): number | null {
  let lineCount = 0;

  for (const paragraph of prepared.paragraphs) {
    if (paragraph.words.length === 0) {
      lineCount += 1;
      if (lineCount >= stopAfter) return lineCount;
      continue;
    }

    let start = 0;
    while (start < paragraph.words.length) {
      const end = findPreparedLineEnd(paragraph, start, rawMaxWidth, prepared);
      if (end < start) return null;
      lineCount += 1;
      if (lineCount >= stopAfter) return lineCount;
      start = end + 1;
    }
  }

  return lineCount;
}

function wrapPreparedText(
  prepared: PreparedWrapText,
  rawMaxWidth: number
): PreparedWrapResult | null {
  const lines: string[] = [];
  let maxLineWidth = 0;

  for (const paragraph of prepared.paragraphs) {
    if (paragraph.words.length === 0) {
      lines.push('');
      continue;
    }

    let start = 0;
    while (start < paragraph.words.length) {
      const end = findPreparedLineEnd(paragraph, start, rawMaxWidth, prepared);
      if (end < start) return null;

      lines.push(paragraph.words.slice(start, end + 1).join(' '));
      maxLineWidth = Math.max(
        maxLineWidth,
        measurePreparedWordRangeWidth(paragraph, start, end, prepared)
      );
      start = end + 1;
    }
  }

  return { lines, maxLineWidth };
}

function findPreparedMultilineWidthCap(
  prepared: PreparedWrapText,
  minWidth: number,
  maxWidth: number
): number {
  let low = minWidth;
  let high = maxWidth;
  let best = minWidth;

  for (let step = 0; step < MAX_MULTILINE_WIDTH_CAP_SEARCH_STEPS; step += 1) {
    const mid = (low + high) / 2;
    const lineCount = countWrappedPreparedTextLines(prepared, mid, 2);

    if (lineCount != null && lineCount >= 2) {
      best = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return best;
}

function prepareWrappedText(
  value: string,
  font: opentype.Font,
  style: ResolvedTextStyle,
  maxWidth: number,
  measuredWidth: number
): PreparedWrapText | null {
  const paragraphs = normalizeParagraphs(value);
  const baseWidthCache = new Map<string, number>();
  const prepared: PreparedWrapText = {
    paragraphs: paragraphs.map((paragraph) =>
      createPreparedWrapParagraph(paragraph, font, style, baseWidthCache)
    ),
    baseSpaceWidth: measureBaseTextWidth(' ', style.fontSize, font),
    letterSpacing: style.letterSpacing,
    multilineWidthCap: Number.POSITIVE_INFINITY,
  };

  const initialLineCount = countWrappedPreparedTextLines(prepared, maxWidth, 2);
  if (initialLineCount == null || initialLineCount < 2) return null;

  if (paragraphs.length === 1) {
    prepared.multilineWidthCap = findPreparedMultilineWidthCap(
      prepared,
      maxWidth,
      Math.max(maxWidth, measuredWidth)
    );
  }

  return prepared;
}

function buildWrappedTextFit(
  lines: string[],
  maxLineWidth: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number
): WrappedTextFit {
  const metrics = {
    maxLineWidth,
    totalHeight: lines.length * lineHeight,
  };
  const scale = Math.min(
    maxWidth / metrics.maxLineWidth,
    maxHeight / metrics.totalHeight,
    1
  );

  return {
    lines,
    metrics,
    scale,
    visibleWidth: metrics.maxLineWidth * scale,
  };
}

function isPreparedWrappedTextFeasible(
  prepared: PreparedWrapText,
  scale: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number
): boolean {
  if (scale <= 0) return false;

  const rawMaxWidth = Math.min(maxWidth / scale, prepared.multilineWidthCap);
  const maxLineCount = Math.floor(
    (maxHeight + FLOAT_TOLERANCE) / (lineHeight * scale)
  );

  if (maxLineCount < 2) return false;

  const lineCount = countWrappedPreparedTextLines(
    prepared,
    rawMaxWidth,
    maxLineCount + 1
  );

  return lineCount != null && lineCount >= 2 && lineCount <= maxLineCount;
}

function refineStableWrappedTextFit(
  prepared: PreparedWrapText,
  scaleGuess: number,
  maxWidth: number,
  maxHeight: number,
  lineHeight: number
): WrappedTextFit | null {
  let scale = Math.max(scaleGuess, FLOAT_TOLERANCE);
  let bestFit: WrappedTextFit | null = null;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const rawMaxWidth = Math.min(maxWidth / scale, prepared.multilineWidthCap);
    const wrapped = wrapPreparedText(prepared, rawMaxWidth);
    if (!wrapped || wrapped.lines.length < 2) return bestFit;

    const fit = buildWrappedTextFit(
      wrapped.lines,
      wrapped.maxLineWidth,
      maxWidth,
      maxHeight,
      lineHeight
    );
    bestFit = fit;

    if (Math.abs(fit.scale - scale) <= SCALE_REFINE_TOLERANCE) {
      return fit;
    }

    scale = fit.scale;
  }

  return bestFit;
}

function findStableWrappedTextFit(
  value: string,
  maxWidth: number,
  maxHeight: number,
  measuredWidth: number,
  lineHeight: number,
  font: opentype.Font,
  style: ResolvedTextStyle
): WrappedTextFit | null {
  const prepared = prepareWrappedText(
    value,
    font,
    style,
    maxWidth,
    measuredWidth
  );
  if (!prepared) return null;

  let low = 0;
  let high = 1;
  let bestScale = 0;

  for (let step = 0; step < MAX_SCALE_SEARCH_STEPS; step += 1) {
    const mid = (low + high) / 2;
    if (
      isPreparedWrappedTextFeasible(
        prepared,
        mid,
        maxWidth,
        maxHeight,
        lineHeight
      )
    ) {
      bestScale = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  if (bestScale <= 0) return null;

  return refineStableWrappedTextFit(
    prepared,
    bestScale,
    maxWidth,
    maxHeight,
    lineHeight
  );
}

function buildWrappedLine(
  line: string,
  anchor: TextAnchorPosition,
  lineHeight: number,
  index: number
): SvgJsonNode {
  return {
    name: 'tspan',
    type: 'element',
    value: '',
    attributes:
      index === 0
        ? { x: String(anchor.x), y: String(anchor.y) }
        : { x: String(anchor.x), dy: String(lineHeight) },
    children: [createTextNode(line)],
  } as SvgJsonNode;
}

function getWrappedTextLines(node: SvgJsonNode): string[] | null {
  if (node.type === 'text' || !isAutoWrappedTextNode(node)) return null;

  const lines: string[] = [];
  for (const child of node.children) {
    if (child.type === 'text') {
      if (child.value.trim().length > 0) return null;
      continue;
    }

    if (child.name !== 'tspan') return null;
    lines.push(collectTextContent(child));
  }

  return lines;
}

function matchesFloatString(
  raw: string | undefined,
  expected: number
): boolean {
  const parsed = parseCssNumber(raw);
  if (parsed == null) return false;
  return Math.abs(parsed - expected) <= FLOAT_TOLERANCE;
}

function hasMatchingWrappedLayout(
  node: SvgJsonNode,
  lines: string[],
  anchor: TextAnchorPosition,
  lineHeight: number
): boolean {
  const currentLines = getWrappedTextLines(node);
  if (!currentLines || currentLines.length !== lines.length) return false;

  const tspans = node.children.filter(
    (child) => child.type !== 'text' && child.name === 'tspan'
  );
  if (tspans.length !== lines.length) return false;

  for (let i = 0; i < tspans.length; i += 1) {
    const tspan = tspans[i];
    if (collectTextContent(tspan) !== lines[i]) return false;
    if (!matchesFloatString(tspan.attributes.x, anchor.x)) return false;

    if (i === 0) {
      if (!matchesFloatString(tspan.attributes.y, anchor.y)) return false;
      continue;
    }

    if (!matchesFloatString(tspan.attributes.dy, lineHeight)) return false;
  }

  return true;
}

function applyWrappedTextLayout(
  node: SvgJsonNode,
  lines: string[],
  anchor: TextAnchorPosition,
  lineHeight: number
): boolean {
  if (hasMatchingWrappedLayout(node, lines, anchor, lineHeight)) {
    markAutoWrappedTextNode(node);
    return false;
  }

  node.value = '';
  node.children = lines.map((line, index) =>
    buildWrappedLine(line, anchor, lineHeight, index)
  );
  markAutoWrappedTextNode(node);
  return true;
}

function resetRenderedLayout(node: SvgJsonNode, text: string): boolean {
  let changed = false;

  if (isAutoWrappedTextNode(node)) {
    restoreTextLayout(node, text);
    clearAutoWrappedTextNode(node);
    changed = true;
  }

  if (clearCompressionTransform(node)) {
    changed = true;
  }

  return changed;
}

export async function applyTextCompression(
  root: SvgJsonNode,
  options: ApplyTextCompressionOptions
): Promise<ApplyTextCompressionResult> {
  let compressedCount = 0;
  let wrappedCount = 0;
  let modifiedCount = 0;
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
      rememberTextLayout(node);

      const maxWidthRaw = node.attributes['data-max-width'];
      const maxWidth = parseCssNumber(maxWidthRaw);
      const text = getLogicalTextContent(node);
      let nodeModified = false;

      if (maxWidth == null || maxWidth <= 0) {
        nodeModified = resetRenderedLayout(node, text);
        warn(
          'invalid-max-width',
          `Skipping text compression due to invalid data-max-width "${maxWidthRaw}".`,
          node
        );
      } else if (hasMixedTextStyle(node)) {
        nodeModified = resetRenderedLayout(node, text);
        warn(
          'unsupported-mixed-style',
          'Skipping text compression for mixed-style text nodes (styled descendants).',
          node
        );
      } else if (!text) {
        nodeModified = resetRenderedLayout(node, '');
        setLogicalTextContent(node, '');
      } else {
        const lookup = await resolveFont(style);
        if (!lookup.font) {
          nodeModified = resetRenderedLayout(node, text);
          warn(
            lookup.errorReason ?? 'font-not-found',
            `Unable to resolve font "${style.family}" (${String(style.weight)}, ${style.style}).`,
            node
          );
        } else {
          const font = lookup.font;
          setLogicalTextContent(node, text);

          const normalizedText = text.replace(NEWLINE_RE, '\n');
          const explicitLines = normalizeParagraphs(text);
          const hasExplicitLineBreaks = explicitLines.length > 1;
          const measuredWidth = measureTextWidth(
            normalizedText.replace(/\n/g, ' '),
            style.fontSize,
            font,
            style.letterSpacing
          );
          const maxHeight = parseCssNumber(node.attributes['data-max-height']);
          const isMultiline = node.attributes[MULTILINE_ATTR] === 'true';
          const canTryWrap =
            isMultiline &&
            maxHeight != null &&
            maxHeight > 0 &&
            !hasTextPath(node);

          if (
            canTryWrap &&
            (measuredWidth > maxWidth || hasExplicitLineBreaks)
          ) {
            const lineHeight = measureLineHeight(style, font);
            const explicitLineMaxWidth = hasExplicitLineBreaks
              ? explicitLines.reduce(
                  (current, line) =>
                    Math.max(
                      current,
                      measureTextWidth(
                        line,
                        style.fontSize,
                        font,
                        style.letterSpacing
                      )
                    ),
                  0
                )
              : 0;
            const wrappedFit =
              hasExplicitLineBreaks &&
              explicitLineMaxWidth <= maxWidth + FLOAT_TOLERANCE
                ? buildWrappedTextFit(
                    explicitLines,
                    explicitLineMaxWidth,
                    maxWidth,
                    maxHeight,
                    lineHeight
                  )
                : findStableWrappedTextFit(
                    text,
                    maxWidth,
                    maxHeight,
                    measuredWidth,
                    lineHeight,
                    font,
                    style
                  );

            if (wrappedFit && wrappedFit.lines.length > 1) {
              if (clearCompressionTransform(node)) {
                nodeModified = true;
              }

              const anchor = resolveTextAnchorPosition(node);
              if (
                applyWrappedTextLayout(
                  node,
                  wrappedFit.lines,
                  anchor,
                  lineHeight
                )
              ) {
                nodeModified = true;
              }

              if (wrappedFit.scale < 1 - FLOAT_TOLERANCE) {
                if (
                  applyScaleTransform(
                    node,
                    wrappedFit.scale,
                    wrappedFit.scale,
                    anchor
                  )
                ) {
                  nodeModified = true;
                }
              }

              setLogicalTextContent(node, text);
            } else {
              if (isAutoWrappedTextNode(node)) {
                restoreTextLayout(node, text);
                clearAutoWrappedTextNode(node);
                nodeModified = true;
              }

              const scaleX = maxWidth / measuredWidth;
              if (applyCompressionTransform(node, scaleX)) {
                nodeModified = true;
              }
            }
          } else if (measuredWidth > maxWidth) {
            if (isAutoWrappedTextNode(node)) {
              restoreTextLayout(node, text);
              clearAutoWrappedTextNode(node);
              nodeModified = true;
            }

            const scaleX = maxWidth / measuredWidth;
            if (applyCompressionTransform(node, scaleX)) {
              nodeModified = true;
            }
          } else {
            nodeModified = resetRenderedLayout(node, text);
          }
        }
      }

      if (nodeModified) {
        modifiedCount += 1;
      }
      if (isAutoWrappedTextNode(node)) {
        wrappedCount += 1;
      }
      if (hasCompressionTransform(node)) {
        compressedCount += 1;
      }
    }

    await Promise.all(node.children.map((child) => walk(child, style)));
  };

  await walk(root, DEFAULT_STYLE);

  return { compressedCount, wrappedCount, modifiedCount, warningCount };
}
