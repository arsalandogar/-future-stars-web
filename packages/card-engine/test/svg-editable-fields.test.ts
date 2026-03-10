import assert from 'node:assert/strict';
import test from 'node:test';

import { discoverEditableTextFields, parseSvgSync } from '../src/index.ts';

void test('marks text fields as multiline when the svg annotation enables it', () => {
  const svg = parseSvgSync(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <text data-text-field="firstName" data-text-multiline="true">
        <tspan x="0" y="20">John Doe</tspan>
      </text>
    </svg>
  `);

  const [field] = discoverEditableTextFields(svg);

  assert.equal(field?.fieldId, 'firstName');
  assert.equal(field?.multiline, true);
});

void test('defaults text fields to single-line when multiline annotation is absent', () => {
  const svg = parseSvgSync(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <text data-text-field="firstName">
        <tspan x="0" y="20">John Doe</tspan>
      </text>
    </svg>
  `);

  const [field] = discoverEditableTextFields(svg);

  assert.equal(field?.fieldId, 'firstName');
  assert.equal(field?.multiline, false);
});
