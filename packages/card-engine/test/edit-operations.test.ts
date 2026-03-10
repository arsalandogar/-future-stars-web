import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cleanEditsForPersistence,
  createEmptySideState,
  initializeSideSnapshot,
  parseSvgSync,
  prepareTemplate,
  renderEditedTemplate,
  type Edits,
  type SvgJsonNode,
} from '../src/index.ts';

function createSvg(): SvgJsonNode {
  return parseSvgSync(`
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <text data-text-field="firstName" data-touch-bounds="1,2,3,4">
        <tspan x="0" y="20">John</tspan>
      </text>
      <rect data-color-field="colorOne" fill="#112233" width="40" height="40" />
      <image
        data-image-field="imageOne"
        href="https://example.com/original.png"
        x="10"
        y="20"
        width="100"
        height="80"
      />
    </svg>
  `);
}

function findElementByAttribute(
  node: SvgJsonNode,
  attribute: string,
  value?: string
): SvgJsonNode | null {
  if (node.type === 'element' && attribute in node.attributes) {
    if (value === undefined || node.attributes[attribute] === value) {
      return node;
    }
  }

  for (const child of node.children) {
    const found = findElementByAttribute(child, attribute, value);
    if (found) return found;
  }

  return null;
}

void test('cleanEditsForPersistence removes unknown fields and blob-backed image edits', () => {
  const svg = createSvg();
  const { fields } = prepareTemplate(svg, { includeTouchTargets: false });

  const edits = {
    firstName: 'Jane',
    colorOne: '#abcdef',
    imageOne: {
      url: 'blob:preview',
      zoom: 1.4,
      offsetX: 8,
      offsetY: -6,
    },
    imageTwo: {
      url: 'https://example.com/extra.png',
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    },
  } satisfies Edits;

  assert.deepEqual(cleanEditsForPersistence(edits, fields), {
    firstName: 'Jane',
    colorOne: '#abcdef',
  });
});

void test('cleanEditsForPersistence preserves persistable image edits', () => {
  const svg = createSvg();
  const { fields } = prepareTemplate(svg, { includeTouchTargets: false });

  const edits = {
    imageOne: {
      url: 'https://cdn.example.com/final.png',
      zoom: 1.5,
      offsetX: 5,
      offsetY: -4,
    },
  } satisfies Edits;

  assert.deepEqual(cleanEditsForPersistence(edits, fields), edits);
});

void test('renderEditedTemplate returns a clean clone and reapplies image transforms', () => {
  const svg = createSvg();

  const originalImage = findElementByAttribute(
    svg,
    'data-image-field',
    'imageOne'
  );
  assert.ok(originalImage);

  const edits = {
    firstName: 'Jane',
    imageOne: {
      url: 'https://cdn.example.com/final.png',
      zoom: 1.5,
      offsetX: 5,
      offsetY: -4,
    },
  } satisfies Edits;

  const { workingCopy } = renderEditedTemplate(svg, edits);

  const renderedImage = findElementByAttribute(
    workingCopy,
    'data-image-field',
    'imageOne'
  );
  assert.ok(renderedImage);
  assert.equal(
    renderedImage.attributes.href,
    'https://cdn.example.com/final.png'
  );
  assert.equal(renderedImage.attributes.width, '150');
  assert.equal(renderedImage.attributes.height, '120');
  assert.equal(renderedImage.attributes.x, '-10');
  assert.equal(renderedImage.attributes.y, '-4');

  assert.equal(
    originalImage.attributes.href,
    'https://example.com/original.png'
  );
  assert.equal(originalImage.attributes.width, '100');
  assert.equal(originalImage.attributes.height, '80');
  assert.equal(originalImage.attributes.x, '10');
  assert.equal(originalImage.attributes.y, '20');

  assert.equal(findElementByAttribute(workingCopy, 'data-touch-target'), null);
});

void test('initializeSideSnapshot replays stored image zoom and keeps touch targets', () => {
  const svg = createSvg();
  const previous = createEmptySideState();
  previous.edits = {
    imageOne: {
      url: 'https://cdn.example.com/final.png',
      zoom: 1.5,
      offsetX: 5,
      offsetY: -4,
    },
  };

  const next = initializeSideSnapshot(svg, previous);
  assert.ok(next.workingCopy);

  const renderedImage = findElementByAttribute(
    next.workingCopy,
    'data-image-field',
    'imageOne'
  );
  assert.ok(renderedImage);
  assert.equal(renderedImage.attributes.x, '-10');
  assert.equal(renderedImage.attributes.y, '-4');
  assert.equal(renderedImage.attributes.width, '150');
  assert.equal(renderedImage.attributes.height, '120');

  assert.ok(findElementByAttribute(next.workingCopy, 'data-touch-target'));
});
