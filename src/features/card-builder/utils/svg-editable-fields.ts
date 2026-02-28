import type { ColorTarget, SvgJsonNode } from '@/types/svg';
import {
  applyOklabOffset,
  parseOffset,
  type OklabOffset,
} from '@/utils/color-math';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

function buildFieldOrder(type: string): Map<EditableFieldId, number> {
  const ids = Object.entries(EDITABLE_FIELDS)
    .filter(([, field]) => field.type === type)
    .map(([id]) => id as EditableFieldId);
  return new Map(ids.map((id, i) => [id, i]));
}

const TEXT_FIELD_ORDER = buildFieldOrder('text');
const COLOR_FIELD_ORDER = buildFieldOrder('color');
const IMAGE_FIELD_ORDER = buildFieldOrder('image');

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

export interface ColorFieldElement {
  node: SvgJsonNode;
  colorTarget: ColorTarget;
  colorOffset?: OklabOffset;
}

export interface EditableColorField {
  fieldId: EditableFieldId;
  label: string;
  originalValue: string;
  elements: ColorFieldElement[];
}

function findBaseColor(
  elements: ColorFieldElement[],
  includeOffset: boolean
): string | null {
  for (const el of elements) {
    if (!includeOffset && el.colorOffset) continue;
    const val = readColorValue(el.node, el.colorTarget);
    if (val && !val.startsWith('url(')) return val;
  }
  return null;
}

function readColorValue(node: SvgJsonNode, target: ColorTarget): string {
  // Direct attribute takes precedence
  if (node.attributes[target]) {
    return node.attributes[target];
  }
  // Fall back to style string
  const style = node.attributes.style;
  if (!style) return '';
  const match = style.match(new RegExp(`${target}:\\s*([^;]+)`));
  return match ? match[1].trim() : '';
}

function writeColorValue(
  node: SvgJsonNode,
  target: ColorTarget,
  color: string
): void {
  // If direct attribute exists, write there
  if (node.attributes[target] != null) {
    node.attributes[target] = color;
    return;
  }
  // Otherwise update style string
  const style = node.attributes.style;
  if (style && style.includes(`${target}:`)) {
    node.attributes.style = style.replace(
      new RegExp(`${target}:\\s*[^;]+`),
      `${target}: ${color}`
    );
    return;
  }
  // No existing value — set as direct attribute
  node.attributes[target] = color;
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
      const offsetRaw = node.attributes['data-color-offset'];
      const colorOffset = offsetRaw ? parseOffset(offsetRaw) : null;
      const element: ColorFieldElement = {
        node,
        colorTarget: target,
        ...(colorOffset && { colorOffset }),
      };

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

    // Pick originalValue from an element WITHOUT an offset (the true base
    // color). Fall back to any element if all have offsets.
    const originalValue =
      findBaseColor(elements, false) ?? findBaseColor(elements, true) ?? '';

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
    const derivedColor = element.colorOffset
      ? applyOklabOffset(color, element.colorOffset)
      : color;
    writeColorValue(element.node, element.colorTarget, derivedColor);
  }
}

export interface ImageClipBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditableImageField {
  fieldId: EditableFieldId;
  label: string;
  originalValue: string;
  originalBounds: ImageClipBounds;
  elementNodes: SvgJsonNode[];
  aspectRatio: number | null;
  clipBounds: ImageClipBounds | null;
}

/** Build a map of clipPath id -> bounding rect from <defs>. */
function buildClipBoundsMap(root: SvgJsonNode): Map<string, ImageClipBounds> {
  const map = new Map<string, ImageClipBounds>();

  function walk(node: SvgJsonNode) {
    if (node.type === 'text') return;

    if (node.name === 'clipPath' && node.attributes.id) {
      const child = node.children.find(
        (c) => c.name === 'rect' || c.name === 'polygon'
      );
      if (child?.name === 'rect') {
        map.set(node.attributes.id, {
          x: parseFloat(child.attributes.x ?? '0'),
          y: parseFloat(child.attributes.y ?? '0'),
          width: parseFloat(child.attributes.width ?? '0'),
          height: parseFloat(child.attributes.height ?? '0'),
        });
      }
    }

    for (const c of node.children) walk(c);
  }

  walk(root);
  return map;
}

/** Extract the clip-path id from a url(#...) reference. */
function parseClipPathId(value: string | undefined): string | null {
  if (!value) return null;
  const match = value.match(/url\(#([^)]+)\)/);
  return match ? match[1] : null;
}

export function discoverEditableImageFields(
  root: SvgJsonNode
): EditableImageField[] {
  const clipBoundsMap = buildClipBoundsMap(root);

  // Map image field id -> { nodes, parentNode (the <g> wrapping the <image>) }
  const fieldMap = new Map<
    EditableFieldId,
    { nodes: SvgJsonNode[]; parent: SvgJsonNode | null }
  >();

  function walk(node: SvgJsonNode, parent: SvgJsonNode | null) {
    if (node.type === 'text') return;

    const dataField = node.attributes['data-image-field'] as string | undefined;
    if (dataField && IMAGE_FIELD_ORDER.has(dataField as EditableFieldId)) {
      const fieldId = dataField as EditableFieldId;
      const existing = fieldMap.get(fieldId);
      if (existing) {
        existing.nodes.push(node);
      } else {
        fieldMap.set(fieldId, { nodes: [node], parent });
      }
    }

    for (const child of node.children) {
      walk(child, node);
    }
  }

  walk(root, null);

  const fields: EditableImageField[] = [];

  for (const [fieldId, { nodes: elementNodes, parent }] of fieldMap) {
    const fieldDef = EDITABLE_FIELDS[fieldId];
    const first = elementNodes[0];
    const originalValue =
      first.attributes.href ?? first.attributes['xlink:href'] ?? '';

    // Resolve clip bounds: check parent <g>'s clip-path, then the image's own
    const parentClipId = parseClipPathId(parent?.attributes['clip-path']);
    const selfClipId = parseClipPathId(first.attributes['clip-path']);
    const clipBounds =
      (parentClipId ? clipBoundsMap.get(parentClipId) : null) ??
      (selfClipId ? clipBoundsMap.get(selfClipId) : null) ??
      null;

    const originalBounds: ImageClipBounds = {
      x: parseFloat(first.attributes.x ?? '0'),
      y: parseFloat(first.attributes.y ?? '0'),
      width: parseFloat(first.attributes.width ?? '0'),
      height: parseFloat(first.attributes.height ?? '0'),
    };

    const w = clipBounds?.width ?? originalBounds.width;
    const h = clipBounds?.height ?? originalBounds.height;
    const aspectRatio = w > 0 && h > 0 ? w / h : null;

    fields.push({
      fieldId,
      label: fieldDef.label,
      originalValue,
      originalBounds,
      elementNodes,
      aspectRatio,
      clipBounds,
    });
  }

  fields.sort(
    (a, b) =>
      (IMAGE_FIELD_ORDER.get(a.fieldId) ?? 0) -
      (IMAGE_FIELD_ORDER.get(b.fieldId) ?? 0)
  );

  return fields;
}

export function applyImageEdit(
  field: EditableImageField,
  imageUrl: string
): void {
  const isOriginal = imageUrl === field.originalValue;

  for (const node of field.elementNodes) {
    node.attributes.href = imageUrl;
    node.attributes['xlink:href'] = imageUrl;

    if (isOriginal) {
      // Restore original position/size
      node.attributes.x = String(field.originalBounds.x);
      node.attributes.y = String(field.originalBounds.y);
      node.attributes.width = String(field.originalBounds.width);
      node.attributes.height = String(field.originalBounds.height);
    } else if (field.clipBounds) {
      // Expand image to fill the clip rect so no background bleeds through
      node.attributes.x = String(field.clipBounds.x);
      node.attributes.y = String(field.clipBounds.y);
      node.attributes.width = String(field.clipBounds.width);
      node.attributes.height = String(field.clipBounds.height);
    }
  }
}
