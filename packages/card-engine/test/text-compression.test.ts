import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parse as parseFont } from 'opentype.js';

import {
  applyTextCompression,
  measureTextWidth,
  parseSvgSync,
  prepareTemplate,
  withTextEdit,
} from '../src/index.ts';
import { collectTextContent } from '../src/svg-text-utils.ts';
import type { SvgJsonNode } from '../src/types.ts';

const FONT_DATA = readFileSync(
  new URL('../../../src/assets/fonts/DejaVuSans.ttf', import.meta.url)
);
const TEST_FONT = parseFont(
  FONT_DATA.buffer.slice(
    FONT_DATA.byteOffset,
    FONT_DATA.byteOffset + FONT_DATA.byteLength
  )
);
const TEST_FONT_SIZE = 20;
const TEST_LINE_HEIGHT = (() => {
  const unitsPerEm = TEST_FONT.unitsPerEm || 1000;
  const fontHeight =
    ((TEST_FONT.ascender ?? unitsPerEm) - (TEST_FONT.descender ?? 0)) /
    unitsPerEm;

  return fontHeight > 0 ? fontHeight * TEST_FONT_SIZE : TEST_FONT_SIZE * 1.2;
})();

function createFontResolver() {
  return () => FONT_DATA;
}

function createSvg(textAttrs: string, textContent: string): SvgJsonNode {
  return parseSvgSync(`
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <text
        data-text-field="firstName"
        font-family="DejaVu Sans"
        font-size="20"
        ${textAttrs}
      >
        <tspan x="100" y="40">${textContent}</tspan>
      </text>
    </svg>
  `);
}

function findFirstTextElement(node: SvgJsonNode): SvgJsonNode {
  if (node.type !== 'text' && node.name === 'text') return node;

  for (const child of node.children) {
    if (child.type === 'text') continue;
    const found = findFirstTextElement(child);
    if (found) return found;
  }

  throw new Error('Text element not found');
}

function getWrappedLines(node: SvgJsonNode): string[] {
  return node.children
    .filter((child) => child.type !== 'text' && child.name === 'tspan')
    .map((child) => collectTextContent(child));
}

function measureLine(line: string): number {
  return measureTextWidth(line, TEST_FONT_SIZE, TEST_FONT);
}

function normalizeParagraphWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function wrapParagraphForTest(
  paragraph: string,
  maxWidth: number
): string[] | null {
  if (!paragraph) return [''];

  const words = paragraph.split(' ');
  const lines: string[] = [];
  let current = words[0] ?? '';

  if (measureLine(current) > maxWidth) return null;

  for (let i = 1; i < words.length; i += 1) {
    const word = words[i];
    const candidate = `${current} ${word}`;
    if (measureLine(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    lines.push(current);
    if (measureLine(word) > maxWidth) return null;
    current = word;
  }

  lines.push(current);
  return lines;
}

function wrapTextForTest(value: string, maxWidth: number): string[] | null {
  const lines: string[] = [];

  for (const paragraph of value.replace(/\r\n?/g, '\n').split('\n')) {
    const normalized = normalizeParagraphWhitespace(paragraph);
    if (!normalized) {
      lines.push('');
      continue;
    }

    const wrapped = wrapParagraphForTest(normalized, maxWidth);
    if (!wrapped) return null;
    lines.push(...wrapped);
  }

  return lines.length > 0 ? lines : [''];
}

function measureVisibleWrappedWidth(
  lines: string[],
  maxWidth: number,
  maxHeight: number
): number {
  const maxLineWidth = lines.reduce(
    (current, line) => Math.max(current, measureLine(line)),
    0
  );
  const totalHeight = lines.length * TEST_LINE_HEIGHT;
  const scale = Math.min(maxWidth / maxLineWidth, maxHeight / totalHeight, 1);
  return maxLineWidth * scale;
}

function getRenderedScale(node: SvgJsonNode): number {
  const transform = node.attributes.transform ?? '';
  const match = /scale\(([-\d.]+)(?:,\s*([-\d.]+))?\)/.exec(transform);
  return match ? Number.parseFloat(match[1] ?? '1') : 1;
}

function measureRenderedVisibleWidth(node: SvgJsonNode): number {
  const maxLineWidth = getWrappedLines(node).reduce(
    (current, line) => Math.max(current, measureLine(line)),
    0
  );
  return maxLineWidth * getRenderedScale(node);
}

void test('wraps text into multiple tspans when width overflows and height allows', async () => {
  const svg = createSvg(
    'data-max-width="70" data-max-height="50" data-text-multiline="true" text-anchor="middle"',
    'John Doe'
  );

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);
  const tspans = textNode.children.filter(
    (child) => child.type !== 'text' && child.name === 'tspan'
  );

  assert.equal(result.compressedCount, 0);
  assert.equal(result.wrappedCount, 1);
  assert.equal(result.modifiedCount, 1);
  assert.deepEqual(getWrappedLines(textNode), ['John', 'Doe']);
  assert.equal(tspans.length, 2);
  assert.equal(tspans[0]?.attributes.x, '100');
  assert.equal(tspans[0]?.attributes.y, '40');
  assert.equal(tspans[1]?.attributes.x, '100');
  assert.ok(Number(tspans[1]?.attributes.dy) > 0);
  assert.equal(textNode.attributes.transform, undefined);
});

void test('keeps wrapped lines and scales the block when max height is exhausted', async () => {
  const svg = createSvg(
    'data-max-width="70" data-max-height="20" data-text-multiline="true"',
    'John Doe'
  );

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);

  assert.equal(result.compressedCount, 1);
  assert.equal(result.wrappedCount, 1);
  assert.equal(result.modifiedCount, 1);
  assert.match(textNode.attributes.transform ?? '', /scale\(/);
  assert.deepEqual(getWrappedLines(textNode), ['John', 'Doe']);
});

void test('preserves explicit line breaks when multiline lines already fit max width', async () => {
  const svg = createSvg(
    'data-max-width="120" data-max-height="50" data-text-multiline="true"',
    'John\nDoe'
  );

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);
  const tspans = textNode.children.filter(
    (child) => child.type !== 'text' && child.name === 'tspan'
  );

  assert.equal(result.compressedCount, 0);
  assert.equal(result.wrappedCount, 1);
  assert.equal(result.modifiedCount, 1);
  assert.deepEqual(getWrappedLines(textNode), ['John', 'Doe']);
  assert.equal(tspans.length, 2);
  assert.equal(tspans[0]?.attributes.x, '100');
  assert.equal(tspans[0]?.attributes.y, '40');
  assert.equal(tspans[1]?.attributes.x, '100');
  assert.ok(Number(tspans[1]?.attributes.dy) > 0);
  assert.equal(textNode.attributes.transform, undefined);
});

void test('scales explicit multiline blocks when only height is exhausted', async () => {
  const svg = createSvg(
    'data-max-width="120" data-max-height="20" data-text-multiline="true"',
    'John\nDoe'
  );

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);

  assert.equal(result.compressedCount, 1);
  assert.equal(result.wrappedCount, 1);
  assert.equal(result.modifiedCount, 1);
  assert.match(textNode.attributes.transform ?? '', /scale\(/);
  assert.deepEqual(getWrappedLines(textNode), ['John', 'Doe']);
});

void test('rebalances scaled multiline text to use more visible width than the greedy wrap', async () => {
  const text = Array.from(
    { length: 6 },
    () => 'Hi what are you not using full width?'
  ).join(' ');
  const maxWidth = 120;
  const maxHeight = 80;
  const greedyLines = wrapTextForTest(text, maxWidth);

  assert.ok(greedyLines);
  assert.ok(greedyLines.length > 1);

  const greedyVisibleWidth = measureVisibleWrappedWidth(
    greedyLines,
    maxWidth,
    maxHeight
  );
  const svg = createSvg(
    `data-max-width="${maxWidth}" data-max-height="${maxHeight}" data-text-multiline="true"`,
    text
  );

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);
  const renderedLines = getWrappedLines(textNode);
  const renderedVisibleWidth = measureRenderedVisibleWidth(textNode);

  assert.equal(result.compressedCount, 1);
  assert.equal(result.wrappedCount, 1);
  assert.equal(result.modifiedCount, 1);
  assert.ok(renderedLines.length < greedyLines.length);
  assert.ok(renderedVisibleWidth > greedyVisibleWidth + 1);
});

void test('keeps single-line scaling when max height exists but multiline is off', async () => {
  const svg = createSvg('data-max-width="70" data-max-height="50"', 'John Doe');

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);

  assert.equal(result.compressedCount, 1);
  assert.equal(result.wrappedCount, 0);
  assert.equal(result.modifiedCount, 1);
  assert.match(textNode.attributes.transform ?? '', /scale\(/);
});

void test('editing a wrapped field restores the original text structure before re-fitting', async () => {
  const template = createSvg(
    'data-max-width="70" data-max-height="50" data-text-multiline="true"',
    'Starter'
  );
  const { workingCopy, fields } = prepareTemplate(template);
  const textField = fields.textFields[0];

  withTextEdit({}, textField, 'John Doe');
  await applyTextCompression(workingCopy, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(workingCopy);
  assert.deepEqual(getWrappedLines(textNode), ['John', 'Doe']);

  withTextEdit({}, textField, 'John');

  const linesAfterEdit = getWrappedLines(textNode);
  assert.equal(linesAfterEdit.length, 1);
  assert.equal(linesAfterEdit[0], 'John');
  assert.equal(textNode.attributes.transform, undefined);

  const result = await applyTextCompression(workingCopy, {
    fontResolver: createFontResolver(),
  });

  assert.equal(result.compressedCount, 0);
  assert.equal(result.wrappedCount, 0);
  assert.equal(result.modifiedCount, 0);
});

void test('editing a scaled wrapped field can return to an unscaled wrapped layout', async () => {
  const template = createSvg(
    'data-max-width="70" data-max-height="20" data-text-multiline="true"',
    'Starter'
  );
  const { workingCopy, fields } = prepareTemplate(template);
  const textField = fields.textFields[0];

  withTextEdit({}, textField, 'John Doe');
  await applyTextCompression(workingCopy, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(workingCopy);
  assert.deepEqual(getWrappedLines(textNode), ['John', 'Doe']);
  assert.match(textNode.attributes.transform ?? '', /scale\(/);

  withTextEdit({}, textField, 'John');

  const result = await applyTextCompression(workingCopy, {
    fontResolver: createFontResolver(),
  });

  assert.equal(result.compressedCount, 0);
  assert.equal(result.wrappedCount, 0);
  assert.equal(textNode.attributes.transform, undefined);
  assert.deepEqual(getWrappedLines(textNode), ['John']);
});

void test('falls back to scaling for single unbreakable words', async () => {
  const svg = createSvg(
    'data-max-width="70" data-max-height="50" data-text-multiline="true"',
    'Supercalifragilistic'
  );

  const result = await applyTextCompression(svg, {
    fontResolver: createFontResolver(),
  });

  const textNode = findFirstTextElement(svg);

  assert.equal(result.compressedCount, 1);
  assert.equal(result.wrappedCount, 0);
  assert.equal(result.modifiedCount, 1);
  assert.match(textNode.attributes.transform ?? '', /scale\(/);
});
