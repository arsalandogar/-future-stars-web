import type { SvgJsonNode } from '@/types/svg';

const ENTITY_RE = /&amp;apos;|&apos;|&#39;|&amp;quot;|&quot;/gi;
const ENTITY_MAP: Record<string, string> = {
  '&amp;apos;': "'",
  '&apos;': "'",
  '&#39;': "'",
  '&amp;quot;': '"',
  '&quot;': '"',
};

const GENERIC_FONT_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
]);

function decodeFontFamilyQuotes(value: string): string {
  return value.replace(ENTITY_RE, (m) => ENTITY_MAP[m.toLowerCase()]);
}

function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function stripOuterQuotes(value: string): string {
  const trimmed = collapseWhitespace(value);
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function splitFontFamilyList(value: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === '\\' && index + 1 < value.length) {
      current += char + value[index + 1];
      index += 1;
      continue;
    }

    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }

    if (char === ',') {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  parts.push(current);
  return parts;
}

function quoteFontFamily(value: string): string {
  if (!/\s/.test(value)) return value;
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;
  return `'${value.replace(/'/g, "\\'")}'`;
}

function normalizeFontFamilyToken(
  rawValue: string
): { key: string; value: string } | null {
  const decoded = decodeFontFamilyQuotes(rawValue);
  const normalized = stripOuterQuotes(decoded);
  if (!normalized) return null;

  const key = normalized.toLowerCase();
  const value = GENERIC_FONT_FAMILIES.has(key)
    ? normalized
    : quoteFontFamily(normalized);

  return { key, value };
}

export function sanitizeFontFamilyValue(value: string): string {
  const families = splitFontFamilyList(value);
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const family of families) {
    const token = normalizeFontFamilyToken(family);
    if (!token || seen.has(token.key)) continue;
    seen.add(token.key);
    normalized.push(token.value);
  }

  return normalized.length > 0 ? normalized.join(', ') : value;
}

function sanitizeStyleValue(style: string): string {
  const re = /(^|;)(\s*font-family\s*:\s*)/gi;
  let result = '';
  let lastIndex = 0;

  for (let match = re.exec(style); match; ) {
    const valueStart = match.index + match[0].length;
    const valueEnd = findStyleValueEnd(style, valueStart);
    const fontFamilyValue = style.slice(valueStart, valueEnd);
    const sanitized = sanitizeFontFamilyValue(fontFamilyValue);

    result += style.slice(lastIndex, valueStart);
    result += sanitized;
    lastIndex = valueEnd;

    re.lastIndex = valueEnd;
    match = re.exec(style);
  }

  return lastIndex === 0 ? style : result + style.slice(lastIndex);
}

const STYLE_PROP_RE = /^\s*[-\w]+\s*:/;

function findStyleValueEnd(style: string, startIndex: number): number {
  let quote: '"' | "'" | null = null;

  for (let index = startIndex; index < style.length; index += 1) {
    const char = style[index];

    if (char === '\\' && index + 1 < style.length) {
      index += 1;
      continue;
    }

    if (quote) {
      if (char === quote) quote = null;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === ';') {
      const after = index + 1;
      if (after >= style.length || STYLE_PROP_RE.test(style.slice(after)))
        return index;
    }
  }

  return style.length;
}

export function sanitizeSvgFontFamilies(root: SvgJsonNode): SvgJsonNode {
  function walk(node: SvgJsonNode): void {
    if (node.type === 'text') return;

    const fontFamily = node.attributes['font-family'];
    if (fontFamily) {
      const sanitized = sanitizeFontFamilyValue(fontFamily);
      if (sanitized !== fontFamily) {
        node.attributes['font-family'] = sanitized;
      }
    }

    const style = node.attributes.style;
    if (style && /font-family\s*:/i.test(style)) {
      const sanitized = sanitizeStyleValue(style);
      if (sanitized !== style) {
        node.attributes.style = sanitized;
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(root);
  return root;
}
