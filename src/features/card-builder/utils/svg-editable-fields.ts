import type { SvgJsonNode } from '@/types/svg';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

const TEXT_FIELD_IDS = Object.entries(EDITABLE_FIELDS)
  .filter(([, field]) => field.type === 'text')
  .map(([id]) => id as EditableFieldId);

const TEXT_FIELD_ORDER = new Map(TEXT_FIELD_IDS.map((id, i) => [id, i]));

const COLOR_FIELD_IDS = Object.entries(EDITABLE_FIELDS)
  .filter(([, field]) => field.type === 'color')
  .map(([id]) => id as EditableFieldId);

const COLOR_FIELD_ORDER = new Map(COLOR_FIELD_IDS.map((id, i) => [id, i]));

export interface EditableTextField {
  fieldId: EditableFieldId;
  label: string;
  originalValue: string;
  elementNodes: SvgJsonNode[];
}

function collectTextContent(node: SvgJsonNode): string {
  if (node.type === 'text') return node.value;
  return node.children.map(collectTextContent).join('');
}

function findFirstTextNode(node: SvgJsonNode): SvgJsonNode | null {
  if (node.type === 'text') return node;
  for (const child of node.children) {
    const found = findFirstTextNode(child);
    if (found) return found;
  }
  return null;
}

export function discoverEditableTextFields(
  root: SvgJsonNode
): EditableTextField[] {
  const fieldMap = new Map<EditableFieldId, SvgJsonNode[]>();

  function walk(node: SvgJsonNode) {
    if (node.type === 'text') return;

    const dataField = node.attributes['data-text-field'] as string | undefined;
    if (dataField && TEXT_FIELD_ORDER.has(dataField as EditableFieldId)) {
      const fieldId = dataField as EditableFieldId;
      const existing = fieldMap.get(fieldId);
      if (existing) {
        existing.push(node);
      } else {
        fieldMap.set(fieldId, [node]);
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(root);

  const fields: EditableTextField[] = [];

  for (const [fieldId, elementNodes] of fieldMap) {
    const fieldDef = EDITABLE_FIELDS[fieldId];
    const originalValue = collectTextContent(elementNodes[0]);

    fields.push({
      fieldId,
      label: fieldDef.label,
      originalValue,
      elementNodes,
    });
  }

  fields.sort(
    (a, b) =>
      (TEXT_FIELD_ORDER.get(a.fieldId) ?? 0) -
      (TEXT_FIELD_ORDER.get(b.fieldId) ?? 0)
  );

  return fields;
}

export function applyTextEdit(field: EditableTextField, value: string): void {
  for (const elementNode of field.elementNodes) {
    const textNode = findFirstTextNode(elementNode);
    if (textNode) {
      textNode.value = value;
    }
  }
}

export type ColorTarget = 'fill' | 'stroke' | 'stop-color';

export interface ColorFieldElement {
  node: SvgJsonNode;
  colorTarget: ColorTarget;
}

export interface EditableColorField {
  fieldId: EditableFieldId;
  label: string;
  originalValue: string;
  elements: ColorFieldElement[];
}

function readColorValue(node: SvgJsonNode, target: ColorTarget): string {
  if (target === 'stop-color') {
    // Check direct attribute first, then style string
    if (node.attributes['stop-color']) {
      return node.attributes['stop-color'];
    }
    const style = node.attributes.style;
    if (!style) return '';
    const match = style.match(/stop-color:\s*([^;]+)/);
    return match ? match[1].trim() : '';
  }
  return node.attributes[target] ?? '';
}

function writeColorValue(
  node: SvgJsonNode,
  target: ColorTarget,
  color: string
): void {
  if (target === 'stop-color') {
    // Write to direct attribute if it exists, otherwise update style string
    if (node.attributes['stop-color'] != null) {
      node.attributes['stop-color'] = color;
    } else {
      const style = node.attributes.style;
      if (style) {
        node.attributes.style = style.replace(
          /stop-color:\s*[^;]+/,
          `stop-color: ${color}`
        );
      }
    }
  } else {
    node.attributes[target] = color;
  }
}

export function discoverEditableColorFields(
  root: SvgJsonNode
): EditableColorField[] {
  const fieldMap = new Map<EditableFieldId, ColorFieldElement[]>();

  function walk(node: SvgJsonNode) {
    if (node.type === 'text') return;

    const dataField = node.attributes['data-color-field'] as string | undefined;
    if (dataField && COLOR_FIELD_ORDER.has(dataField as EditableFieldId)) {
      const fieldId = dataField as EditableFieldId;
      const target =
        (node.attributes['data-color-target'] as ColorTarget) ?? 'fill';
      const element: ColorFieldElement = { node, colorTarget: target };

      const existing = fieldMap.get(fieldId);
      if (existing) {
        existing.push(element);
      } else {
        fieldMap.set(fieldId, [element]);
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(root);

  const fields: EditableColorField[] = [];

  for (const [fieldId, elements] of fieldMap) {
    const fieldDef = EDITABLE_FIELDS[fieldId];

    // Pick originalValue from the first element with a concrete color
    // (skip gradient references like "url(#...)")
    let originalValue = '';
    for (const el of elements) {
      const val = readColorValue(el.node, el.colorTarget);
      if (val && !val.startsWith('url(')) {
        originalValue = val;
        break;
      }
    }

    fields.push({
      fieldId,
      label: fieldDef.label,
      originalValue,
      elements,
    });
  }

  fields.sort(
    (a, b) =>
      (COLOR_FIELD_ORDER.get(a.fieldId) ?? 0) -
      (COLOR_FIELD_ORDER.get(b.fieldId) ?? 0)
  );

  return fields;
}

export function applyColorEdit(field: EditableColorField, color: string): void {
  for (const element of field.elements) {
    writeColorValue(element.node, element.colorTarget, color);
  }
}
